-- CreateEnum
CREATE TYPE "account_type_enum" AS ENUM ('USER', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "pull_request_status_enum" AS ENUM ('OPEN', 'CLOSED', 'MERGED');

-- CreateEnum
CREATE TYPE "review_job_status_enum" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "review_trigger_enum" AS ENUM ('WEBHOOK', 'MANUAL', 'RETRY');

-- CreateEnum
CREATE TYPE "review_severity_enum" AS ENUM ('INFO', 'LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "webhook_processing_status_enum" AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "github_user_id" BIGINT NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "avatar_url" TEXT,
    "deleted_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installations" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "github_installation_id" BIGINT NOT NULL,
    "account_login" VARCHAR(255) NOT NULL,
    "account_type" "account_type_enum" NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "installations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repositories" (
    "id" BIGSERIAL NOT NULL,
    "installation_id" BIGINT NOT NULL,
    "github_repository_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(500) NOT NULL,
    "default_branch" VARCHAR(100) NOT NULL,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "repositories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pull_requests" (
    "id" BIGSERIAL NOT NULL,
    "repository_id" BIGINT NOT NULL,
    "github_pull_request_id" BIGINT NOT NULL,
    "pr_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "status" "pull_request_status_enum" NOT NULL,
    "head_sha" VARCHAR(40) NOT NULL,
    "base_sha" VARCHAR(40) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "pull_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_jobs" (
    "id" BIGSERIAL NOT NULL,
    "pull_request_id" BIGINT NOT NULL,
    "status" "review_job_status_enum" NOT NULL DEFAULT 'PENDING',
    "trigger_type" "review_trigger_enum" NOT NULL DEFAULT 'WEBHOOK',
    "error_message" TEXT,
    "started_at" TIMESTAMP(6),
    "completed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_comments" (
    "id" BIGSERIAL NOT NULL,
    "review_job_id" BIGINT NOT NULL,
    "file_path" TEXT NOT NULL,
    "line_number" INTEGER NOT NULL,
    "severity" "review_severity_enum" NOT NULL,
    "comment" TEXT NOT NULL,
    "suggested_fix" TEXT,
    "posted_to_github" BOOLEAN NOT NULL DEFAULT false,
    "github_comment_id" BIGINT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" BIGSERIAL NOT NULL,
    "github_delivery_id" UUID NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "payload" JSONB NOT NULL,
    "processing_status" "webhook_processing_status_enum" NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,
    "processed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_github_user_id_key" ON "users"("github_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "installations_user_id_key" ON "installations"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "installations_github_installation_id_key" ON "installations"("github_installation_id");

-- CreateIndex
CREATE UNIQUE INDEX "repositories_github_repository_id_key" ON "repositories"("github_repository_id");

-- CreateIndex
CREATE INDEX "repositories_installation_id_idx" ON "repositories"("installation_id");

-- CreateIndex
CREATE UNIQUE INDEX "pull_requests_github_pull_request_id_key" ON "pull_requests"("github_pull_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "pull_requests_repository_id_pr_number_key" ON "pull_requests"("repository_id", "pr_number");

-- CreateIndex
CREATE UNIQUE INDEX "review_jobs_pull_request_id_key" ON "review_jobs"("pull_request_id");

-- CreateIndex
CREATE INDEX "review_jobs_status_created_at_idx" ON "review_jobs"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "review_comments_github_comment_id_key" ON "review_comments"("github_comment_id");

-- CreateIndex
CREATE INDEX "review_comments_review_job_id_idx" ON "review_comments"("review_job_id");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_github_delivery_id_key" ON "webhook_events"("github_delivery_id");

-- CreateIndex
CREATE INDEX "webhook_events_processing_status_created_at_idx" ON "webhook_events"("processing_status", "created_at");

-- AddForeignKey
ALTER TABLE "installations" ADD CONSTRAINT "installations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_installation_id_fkey" FOREIGN KEY ("installation_id") REFERENCES "installations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pull_requests" ADD CONSTRAINT "pull_requests_repository_id_fkey" FOREIGN KEY ("repository_id") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_jobs" ADD CONSTRAINT "review_jobs_pull_request_id_fkey" FOREIGN KEY ("pull_request_id") REFERENCES "pull_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_comments" ADD CONSTRAINT "review_comments_review_job_id_fkey" FOREIGN KEY ("review_job_id") REFERENCES "review_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
