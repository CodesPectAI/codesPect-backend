import "dotenv/config"; // MUST BE FIRST LINE

export const githubConfig = {
  appId: process.env.GITHUB_APP_ID!,
  webhookSecret: process.env.GITHUB_WEBHOOK_SECRET!,
  privateKey: process.env.GITHUB_PRIVATE_KEY!.replace(/\\n/g, "\n"),
};
