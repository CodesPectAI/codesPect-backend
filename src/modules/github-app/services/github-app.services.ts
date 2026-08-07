import { handleInstallationEvent } from "../handlers/installation.handler";
import { handlePullRequest } from "../handlers/pull-request.handler";

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
      console.log("pul request created");
      await handlePullRequest(payload);
      break;

    default:
      console.log(`Unhandled event: ${event}`);
  }
}
