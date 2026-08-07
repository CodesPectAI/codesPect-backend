import fs from "fs";
import path from "path";

export const githubConfig = {
  appId: process.env.GITHUB_APP_ID!,
  webhookSecret: process.env.GITHUB_WEBHOOK_SECRET!,
  privateKey: fs.readFileSync(
    path.resolve(process.env.GITHUB_PRIVATE_KEY_PATH!),
    "utf8",
  ),
};
