import { getInstallationAccessTooken } from "../../../shared/octokit.js";
import { handleInstallationEvent } from "../handlers/installation.handler.js";
import { handlePullRequestEvent } from "../handlers/pull-request.handler.js";

export async function handleGithubWebHook(
  event: string | undefined,
  payload: any,
) {
  const installationId = payload.installation?.id;

  if (!installationId) {
    throw new Error("Missing installation ID");
  }

  const octokit = await getInstallationAccessTooken(installationId);
  switch (event) {
    case "ping":
      console.log("github app connected");
      break;

    case "installation":
      await handleInstallationEvent(octokit, payload);
      console.log("github installation created");
      break;

    case "pull_request":
      await handlePullRequestEvent(payload);
      console.log("pull request created");
      break;

    default:
      console.log(`Unhandled event: ${event}`);
  }
}
