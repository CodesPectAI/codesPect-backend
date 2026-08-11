import { prisma } from "../lib/prisma.js";
import { analyzeCodeWithAI } from "../modules/github-app/services/ai.services.js";
import { getInstallationAccessTooken } from "../shared/octokit.js";

export async function processReviewJob(job: any) {
  console.log(`🔥 Processing job ${job.id} (attempt ${job.attemptsMade + 1})`);

  const { reviewJobId, owner, repo, prNumber } = job.data;

  try {
    const existingJob = await prisma.reviewJob.findUnique({
      where: { id: reviewJobId },
      include: {
        pullRequest: {
          include: {
            repository: {
              include: {
                installation: true,
              },
            },
          },
        },
      },
    });

    if (!existingJob) throw new Error("ReviewJob not found");

    if (existingJob?.status === "COMPLETED") {
      console.log("⚠️ Already completed, skipping");
      return;
    }

    // 1️⃣ mark processing
    await prisma.reviewJob.update({
      where: { id: BigInt(reviewJobId) },
      data: {
        status: "PROCESSING",
        startedAt: new Date(),
      },
    });

    console.log(`Reviewing PR #${prNumber}`);

    // fetch PR files (Octokit)
    const octokit = await getInstallationAccessTooken(
      existingJob.pullRequest.repository.installation.githubInstallationId,
    );

    const { data: files } = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
    });

    // 5️⃣ Filter relevant files
    const relevantFiles = files.filter(
      (file: any) =>
        (file.status === "added" || file.status === "modified") && file.patch,
    );

    console.log("📂 Files to review:", relevantFiles.length);

    // 6️⃣ Format for AI
    const formattedFiles = relevantFiles.map((file: any) => ({
      filename: file.filename,
      patch: file.patch,
    }));

    // run AI review
    const aiResults = await analyzeCodeWithAI(formattedFiles);
    console.log("🤖 CodesPect AI comments:", aiResults.length);
    console.dir(aiResults, { depth: null });

    // store comments
    await Promise.all(
      aiResults.map((comment: any) =>
        prisma.reviewComment.create({
          data: {
            reviewJobId: reviewJobId,
            filePath: comment.filePath,
            lineNumber: comment.lineNumber,
            severity: comment.severity,
            comment: comment.comment,
            suggestedFix: comment.suggestedFix,
          },
        }),
      ),
    );

    await octokit.pulls.createReview({
      owner,
      repo,
      pull_number: prNumber,
      event: "COMMENT",
      body: "🤖 CodesPect AI Code Review",
      comments: aiResults.map((c: any) => ({
        path: c.filePath,
        body: c.comment,
        line: c.line || 1,
      })),
    });

    // GitHub accepted the review
    await prisma.reviewComment.updateMany({
      where: {
        reviewJobId: reviewJobId,
      },
      data: {
        postedToGithub: true,
      },
    });

    // 2️⃣ mark completed
    await prisma.reviewJob.update({
      where: { id: BigInt(reviewJobId) },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    console.log("✅ Done");
  } catch (error: any) {
    console.error("❌ Failed:", error);

    await prisma.reviewJob.update({
      where: { id: BigInt(reviewJobId) },
      data: {
        status: "FAILED",
        errorMessage: error.message,
      },
    });
    throw error;
  }
}
