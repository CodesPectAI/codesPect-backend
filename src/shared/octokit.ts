// import { App } from "@octokit/app";
import { githubConfig } from "../config/github.js";

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
