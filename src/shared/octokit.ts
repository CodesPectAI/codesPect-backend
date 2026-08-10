// import { App } from "@octokit/app";
import { githubConfig } from "../config/github.js";

// const app = new App({
//   appId: Number(githubConfig.appId),
//   privateKey: githubConfig.privateKey,
// });

// export async function getInstallationOctokit(installationId: number) {
//   const octokit = await app.getInstallationOctokit(installationId);
//   return octokit;
// }

import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

export function getInstallationAccessTooken(installationId: BigInt) {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: githubConfig.appId,
      privateKey: githubConfig.privateKey,
      installationId: installationId,
    },
  });
}
