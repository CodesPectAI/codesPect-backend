// import { githubConfig } from "../config/github";
// import { App } from "octokit";

// export const app = new App({
//   appId: githubConfig.appId,
//   privateKey: githubConfig.privateKey,
//   webhooks: {
//     secret: githubConfig.webhookSecret,
//   },
// });

import { githubConfig } from "../config/github.js";
import { App } from "@octokit/app";

export const app = new App({
  appId: githubConfig.appId,
  privateKey: githubConfig.privateKey,
});
