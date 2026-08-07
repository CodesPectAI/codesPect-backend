/*
  Warnings:

  - You are about to drop the column `user_id` on the `installations` table. All the data in the column will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `github_account_id` to the `installations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "installations" DROP CONSTRAINT "installations_user_id_fkey";

-- DropIndex
DROP INDEX "installations_user_id_key";

-- AlterTable
ALTER TABLE "installations" DROP COLUMN "user_id",
ADD COLUMN     "github_account_id" BIGINT NOT NULL;

-- DropTable
DROP TABLE "users";
