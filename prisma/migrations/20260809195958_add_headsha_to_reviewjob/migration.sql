/*
  Warnings:

  - Added the required column `head_sha` to the `review_jobs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "review_jobs" ADD COLUMN     "head_sha" VARCHAR(40) NOT NULL;
