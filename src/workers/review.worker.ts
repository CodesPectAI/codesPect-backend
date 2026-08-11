import { Worker } from "bullmq";
import { redis } from "../lib/redis.js";
import { processReviewJob } from "../processor/review.processor.js";

const worker = new Worker("review-queue", processReviewJob, {
  connection: redis,
  concurrency: 3,
  limiter: {
    max: 5,
    duration: 1000,
  },
});

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.log(`❌ Job ${job?.id} failed:`, err.message);
});

console.log("🚀 Worker started...");
