import { saveInstallation } from "../repositories/installation.repository.js";
import { saveRepository } from "../repositories/repository.repository.js";

// interface InstallationWebhookPayload {
//   installation: {
//     id: number; // from GitHub
//     account: {
//       id: number;
//       login: string;
//       type: "User" | "Organization";
//     };
//   };
// }

export async function handleInstallationEvent(octokit: any, payload: any) {
  const installationId = payload.installation?.id;
  const account = payload.installation?.account;

  if (!installationId || !account) {
    console.log("Invalid installation payload");
    return;
  }

  const savedInstallation = await saveInstallation({
    githubInstallationId: BigInt(installationId),
    githubAccountId: BigInt(account.id),
    accountLogin: account.login,
    accountType: account.type,
  });

  console.log("Installation saved in DB");
  const { data } = await octokit.apps.listReposAccessibleToInstallation();
  await saveRepository(savedInstallation.id, data.repositories);
  console.log("repositories save to db");
}
