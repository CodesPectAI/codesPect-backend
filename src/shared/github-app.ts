import { githubConfig } from "../config/github";
import { App } from "@octokit/app";

export const github = new App({
  appId: githubConfig.appId,
  privateKey: githubConfig.privateKey,
});
