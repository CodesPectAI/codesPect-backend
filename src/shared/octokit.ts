// import { app } from "./github-app";

// export async function getInstallationOctokit(installationId: number) {
//   return app.getInstallationOctokit(installationId);
// }

// import { app } from "./github-app";

// export async function getInstallationOctokit(installationId: number) {
//   return await app.getInstallationOctokit(installationId);
// }

import { app } from "./github-app.js";

export async function getInstallationOctokit(installationId: number) {
  const octokit = await app.getInstallationOctokit(installationId);
  return octokit;
}
