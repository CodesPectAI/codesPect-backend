// import { parsePatch } from "../lib/parsePatch.js";
// import { prisma } from "../lib/prisma.js";
// import { analyzeCodeWithAI } from "../modules/github-app/services/ai.services.js";
// import { getInstallationAccessTooken } from "../shared/octokit.js";

// export async function processReviewJob(job: any) {
//   console.log(`🔥 Processing job ${job.id} (attempt ${job.attemptsMade + 1})`);

//   const { reviewJobId, owner, repo, prNumber } = job.data;

//   try {
//     const existingJob = await prisma.reviewJob.findUnique({
//       where: { id: reviewJobId },
//       include: {
//         pullRequest: {
//           include: {
//             repository: {
//               include: {
//                 installation: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!existingJob) throw new Error("ReviewJob not found");

//     if (existingJob?.status === "COMPLETED") {
//       console.log("⚠️ Already completed, skipping");
//       return;
//     }

//     // 1️⃣ mark processing
//     await prisma.reviewJob.update({
//       where: { id: BigInt(reviewJobId) },
//       data: {
//         status: "PROCESSING",
//         startedAt: new Date(),
//       },
//     });

//     console.log(`Reviewing PR #${prNumber}`);

//     // fetch PR files (Octokit)
//     const octokit = await getInstallationAccessTooken(
//       existingJob.pullRequest.repository.installation.githubInstallationId,
//     );

//     const { data: files } = await octokit.pulls.listFiles({
//       owner,
//       repo,
//       pull_number: prNumber,
//     });

//     // 5️⃣ Filter relevant files
//     const relevantFiles = files.filter(
//       (file: any) =>
//         (file.status === "added" || file.status === "modified") && file.patch,
//     );

//     console.log("📂 Files to review:", relevantFiles.length);

//     // 6️⃣ Format for AI
//     const formattedFiles = relevantFiles.map((file: any) => ({
//       filename: file.filename,
//       patch: file.patch,
//     }));

//     for (const file of relevantFiles) {
//       const changedLines = parsePatch(file.patch);

//       console.log("\n📄", file.filename);

//       console.dir(changedLines, {
//         depth: null,
//       });
//     }

//     // run AI review
//     const aiResults = await analyzeCodeWithAI(formattedFiles);
//     console.log("🤖 CodesPect AI comments:", aiResults.length);
//     console.dir(aiResults, { depth: null });

//     // store comments
//     await Promise.all(
//       aiResults.map((comment: any) =>
//         prisma.reviewComment.create({
//           data: {
//             reviewJobId: reviewJobId,
//             filePath: comment.filePath,
//             lineNumber: comment.lineNumber,
//             severity: comment.severity,
//             comment: comment.comment,
//             suggestedFix: comment.suggestedFix,
//           },
//         }),
//       ),
//     );

//     await octokit.pulls.createReview({
//       owner,
//       repo,
//       pull_number: prNumber,
//       event: "COMMENT",
//       body: "🤖 CodesPect AI Code Review",
//       comments: aiResults.map((c: any) => ({
//         path: c.filePath,
//         body: c.comment,
//         line: c.line || 1,
//       })),
//     });

//     // GitHub accepted the review
//     await prisma.reviewComment.updateMany({
//       where: {
//         reviewJobId: reviewJobId,
//       },
//       data: {
//         postedToGithub: true,
//       },
//     });

//     // 2️⃣ mark completed
//     await prisma.reviewJob.update({
//       where: { id: BigInt(reviewJobId) },
//       data: {
//         status: "COMPLETED",
//         completedAt: new Date(),
//       },
//     });

//     console.log("✅ Done");
//   } catch (error: any) {
//     console.error("❌ Failed:", error);

//     await prisma.reviewJob.update({
//       where: { id: BigInt(reviewJobId) },
//       data: {
//         status: "FAILED",
//         errorMessage: error.message,
//       },
//     });
//     throw error;
//   }
// }

import { parsePatch } from "../lib/parsePatch.js";
import { prisma } from "../lib/prisma.js";
import { analyzeCodeWithAI } from "../modules/github-app/services/ai.services.js";
import { getInstallationAccessTooken } from "../shared/octokit.js";

export async function processReviewJob(job: any) {
  console.log(`🔥 Processing job ${job.id} (attempt ${job.attemptsMade + 1})`);

  const { reviewJobId, owner, repo, prNumber } = job.data;

  try {
    // =========================================================
    // 1. Get ReviewJob + PullRequest + Repository + Installation
    // =========================================================

    const existingJob = await prisma.reviewJob.findUnique({
      where: {
        id: BigInt(reviewJobId),
      },
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

    if (!existingJob) {
      throw new Error("ReviewJob not found");
    }

    // =========================================================
    // 2. Prevent duplicate processing
    // =========================================================

    if (existingJob.status === "COMPLETED") {
      console.log("⚠️ Already completed, skipping");
      return;
    }

    // =========================================================
    // 3. Mark ReviewJob as PROCESSING
    // =========================================================

    await prisma.reviewJob.update({
      where: {
        id: BigInt(reviewJobId),
      },
      data: {
        status: "PROCESSING",
        startedAt: new Date(),
      },
    });

    console.log(`🔍 Reviewing PR #${prNumber}`);

    // =========================================================
    // 4. Create authenticated Octokit instance
    // =========================================================

    const githubInstallationId =
      existingJob.pullRequest.repository.installation.githubInstallationId;

    const octokit = await getInstallationAccessTooken(githubInstallationId);

    // =========================================================
    // 5. Fetch PR files from GitHub
    // =========================================================

    const { data: files } = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
    });

    // =========================================================
    // 6. Filter relevant files
    // =========================================================

    const relevantFiles = files.filter(
      (file: any) =>
        (file.status === "added" || file.status === "modified") && file.patch,
    );

    console.log("📂 Files to review:", relevantFiles.length);

    // =========================================================
    // 7. Parse GitHub patches
    // =========================================================

    const formattedFiles = relevantFiles.map((file: any) => {
      const changedLines = parsePatch(file.patch);

      return {
        filename: file.filename,
        changedLines,
      };
    });

    // =========================================================
    // 8. Remove files that have no parseable changed lines
    // =========================================================

    const filesForAI = formattedFiles.filter(
      (file) => file.changedLines.length > 0,
    );

    console.log("\n🤖 Files sent to AI:", filesForAI.length);

    if (filesForAI.length === 0) {
      console.log("ℹ️ No changed lines available for AI review.");

      await prisma.reviewJob.update({
        where: {
          id: BigInt(reviewJobId),
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      return;
    }

    // =========================================================
    // 9. Send changed lines to Gemini
    // =========================================================

    const aiResults = await analyzeCodeWithAI(filesForAI);

    console.log("\n🤖 CodesPect AI comments:", aiResults.length);

    // =========================================================
    // 10. Build valid line map
    // =========================================================

    const validLines = new Map<string, Set<number>>();

    for (const file of filesForAI) {
      validLines.set(
        file.filename,
        new Set(file.changedLines.map((line) => line.lineNumber)),
      );
    }

    // =========================================================
    // 11. Validate AI results
    // =========================================================

    const validAIResults = aiResults.filter((comment: any) => {
      const fileLines = validLines.get(comment.filePath);

      if (!fileLines) {
        console.warn(`⚠️ Invalid file from AI: ${comment.filePath}`);

        return false;
      }

      if (!fileLines.has(comment.lineNumber)) {
        console.warn(
          `⚠️ Invalid line from AI: ${comment.filePath}:${comment.lineNumber}`,
        );

        return false;
      }

      return true;
    });

    console.log("\n✅ Valid AI comments:", validAIResults.length);

    // =========================================================
    // 12. If AI produced comments but none are valid
    // =========================================================

    if (aiResults.length > 0 && validAIResults.length === 0) {
      console.warn(
        "⚠️ AI produced comments, but none mapped to valid changed lines.",
      );
    }

    // =========================================================
    // 13. Save valid comments to database
    // =========================================================

    const savedComments = await Promise.all(
      validAIResults.map((comment: any) =>
        prisma.reviewComment.create({
          data: {
            reviewJobId: BigInt(reviewJobId),

            filePath: comment.filePath,

            lineNumber: comment.lineNumber,

            severity: comment.severity,

            comment: comment.comment,

            suggestedFix: comment.suggestedFix,
          },
        }),
      ),
    );

    console.log("💾 Saved comments:", savedComments.length);

    // =========================================================
    // 14. Post review to GitHub
    // =========================================================

    if (validAIResults.length > 0) {
      console.log("📤 Posting review to GitHub...");

      await octokit.pulls.createReview({
        owner,
        repo,
        pull_number: prNumber,

        event: "COMMENT",

        body: "🤖 CodesPect AI Code Review",

        comments: validAIResults.map((comment: any) => ({
          path: comment.filePath,

          body: comment.comment,

          line: comment.lineNumber,

          side: "RIGHT",
        })),
      });

      console.log("✅ GitHub review posted");

      // =======================================================
      // 15. Mark comments as posted
      // =======================================================

      await prisma.reviewComment.updateMany({
        where: {
          reviewJobId: BigInt(reviewJobId),
        },

        data: {
          postedToGithub: true,
        },
      });
    } else {
      console.log("ℹ️ No valid comments to post to GitHub");
    }

    // =========================================================
    // 16. Mark ReviewJob as COMPLETED
    // =========================================================

    await prisma.reviewJob.update({
      where: {
        id: BigInt(reviewJobId),
      },

      data: {
        status: "COMPLETED",

        completedAt: new Date(),
      },
    });

    console.log(`✅ Review completed: ${reviewJobId}`);
  } catch (error: any) {
    // =========================================================
    // 17. Handle failure
    // =========================================================

    console.error("❌ Review failed:", error);

    await prisma.reviewJob.update({
      where: {
        id: BigInt(reviewJobId),
      },

      data: {
        status: "FAILED",

        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    });

    // IMPORTANT:
    // Let BullMQ know the job failed so it can retry.
    throw error;
  }
}
