import { Worker } from "bullmq";
// import { redis } from "../lib/redis.js";
import { prisma } from "../lib/prisma.js";
import { Redis } from "ioredis";

const worker = new Worker(
  "review-queue",
  async (job) => {
    console.log("🔥 Processing job:", job.id);

    const { reviewJobId, prNumber } = job.data;

    // 1️⃣ mark processing
    await prisma.reviewJob.update({
      where: { id: BigInt(reviewJobId) },
      data: {
        status: "PROCESSING",
        startedAt: new Date(),
      },
    });

    try {
      console.log(`Reviewing PR #${prNumber}`);

      // 👉 TODO:
      // fetch PR files (Octokit)
      // run AI review
      // store comments

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
    }
  },
  {
    connection: new Redis({
      host: "127.0.0.1",
      port: 6379,
      maxRetriesPerRequest: null,
    }),
  },
);

console.log("🚀 Worker started...");
