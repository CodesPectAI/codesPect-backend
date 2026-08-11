import { prisma } from "../../../lib/prisma.js";
import { reviewQueue } from "../../../queues/review.queue.js";

function mapPRStatus(pr: any) {
  if (pr.merged) return "MERGED";
  if (pr.state === "closed") return "CLOSED";
  return "OPEN";
}

export async function handlePullRequestEvent(payload: any) {
  const action = payload.action;

  // ✅ Only process meaningful actions
  if (!["opened", "synchronize", "reopened"].includes(action)) {
    console.log("⏭️ Ignored PR action:", action);
    return;
  }

  const pr = payload.pull_request;
  const repo = payload.repository;

  if (!pr || !repo) {
    console.log("❌ Invalid PR payload");
    return;
  }

  // 1️⃣ Find repository in DB
  const repository = await prisma.repository.findUnique({
    where: {
      githubRepositoryId: BigInt(repo.id),
    },
  });

  if (!repository) {
    console.log("❌ Repository not found in DB");
    return;
  }

  // 2️⃣ Upsert Pull Request
  const savedPR = await prisma.pullRequest.upsert({
    where: {
      githubPullRequestId: BigInt(pr.id),
    },
    update: {
      title: pr.title,
      status: mapPRStatus(pr.state),
      headSha: pr.head.sha,
      baseSha: pr.base.sha,
    },
    create: {
      githubPullRequestId: BigInt(pr.id),
      prNumber: pr.number,
      title: pr.title,
      status: mapPRStatus(pr.state),
      headSha: pr.head.sha,
      baseSha: pr.base.sha,
      repositoryId: repository.id,
    },
  });

  console.log("✅ PR saved:", savedPR.prNumber);

  // 3️⃣ Create or update ReviewJob
  // ✅ Prevent duplicate for same commit
  const existingJob = await prisma.reviewJob.findFirst({
    where: {
      pullRequestId: savedPR.id,
      headSha: pr.head.sha,
    },
  });

  if (existingJob) {
    console.log("⏭️ Already processed this commit");
    return;
  }

  // ✅ Create new job
  const reviewJob = await prisma.reviewJob.create({
    data: {
      pullRequest: {
        connect: { id: savedPR.id }, // ✅ FIX
      },
      headSha: pr.head.sha,
      status: "PENDING",
      triggerType: action === "synchronize" ? "RETRY" : "WEBHOOK",
    },
  });

  console.log("🔥 ReviewJob created:", reviewJob.id);
  const [owner] = repository.fullName.split("/");

  // 4️⃣ Push to queue (IMPORTANT)
  await reviewQueue.add(
    "review-pr",
    {
      reviewJobId: reviewJob.id.toString(), // ✅ FIX
      repositoryId: repository.id.toString(),
      owner: owner,
      repo: repository.name,
      prNumber: pr.number,
    },
    {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 6000,
      },
      removeOnComplete: true,
      removeOnFail: 100,
    },
  );

  console.log("🚀 PR queued for review");
}
