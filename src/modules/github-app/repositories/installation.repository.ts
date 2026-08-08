import { prisma } from "../../../lib/prisma.js";
import { AccountType } from "../../../generated/prisma/client.js";

interface installationDataType {
  githubInstallationId: bigint;
  githubAccountId: bigint;
  accountLogin: string;
  accountType: AccountType;
}

export function saveInstallation(data: installationDataType) {
  return prisma.installation.create({
    data: {
      githubInstallationId: data.githubInstallationId,
      githubAccountId: data.githubAccountId,
      accountLogin: data.accountLogin,
      accountType: data.accountType,
    },
  });
}
