import { Queue } from "bullmq";
import { redis } from "../lib/redis.js";

export const reviewQueue = new Queue("review-queue", {
  connection: redis,
});
