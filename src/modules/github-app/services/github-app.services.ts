import { getInstallationOctokit } from "../../../shared/octokit.js";
import { handleInstallationEvent } from "../handlers/installation.handler.js";
import { handlePullRequest } from "../handlers/pull-request.handler.js";

export async function handleGithubWebHook(
  event: string | undefined,
  payload: any,
) {
  switch (event) {
    case "ping":
      console.log("github app connected");
      break;

    case "installation":
      console.log("github installation created");
      await handleInstallationEvent(payload);
      break;

    case "pull_request":
      console.log("pull request created");

      const installationId = payload.installation?.id;

      if (!installationId) {
        throw new Error("Missing installation ID");
      }

      const octokit = getInstallationOctokit(installationId);

      await handlePullRequest({ octokit, payload });
      break;

    default:
      console.log(`Unhandled event: ${event}`);
  }
}
