import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";

export async function handlePullRequest(payload: any) {
  const installationId = payload.installation.id;
  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const pull_number = payload.pull_request.number;

  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.GITHUB_APP_ID,
      privateKey: process.env.GITHUB_PRIVATE_KEY,
      installationId,
    },
  });

  const files = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number,
  });

  console.dir(files, { depth: null });

  return files.data
    .filter(
      (file) =>
        file.patch && (file.status === "added" || file.status === "modified"),
    )
    .map((file) => ({
      filename: file.filename,
      patch: file.patch,
    }));
}
