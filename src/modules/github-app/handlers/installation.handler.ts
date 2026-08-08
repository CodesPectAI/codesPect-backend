import { saveInstallation } from "../repositories/installation.repository.js";
import { AccountType } from "../../../generated/prisma/client.js";

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

export async function handleInstallationEvent(payload: any) {
  const installationId = payload.installation?.id;
  const account = payload.installation?.account;

  if (!installationId || !account) {
    console.log("Invalid installation payload");
    return;
  }

  const accountType =
    account.type === "User"
      ? AccountType.USER
      : account.type === "Organization"
        ? AccountType.ORGANIZATION
        : undefined;

  if (!accountType) {
    throw new Error(`Unsupported GitHub account type: ${account.type}`);
  }

  await saveInstallation({
    githubInstallationId: BigInt(installationId),
    githubAccountId: BigInt(account.id),
    accountLogin: account.login,
    accountType,
  });

  console.log("Installation saved in DB");
}
