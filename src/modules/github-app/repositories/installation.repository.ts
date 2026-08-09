import { AccountType } from "@prisma/client";
import { prisma } from "../../../lib/prisma.js";
interface installationDataType {
  githubInstallationId: bigint;
  githubAccountId: bigint;
  accountLogin: string;
  accountType: AccountType;
}

function mapGithubAccountType(type: string): AccountType {
  switch (type) {
    case "Organization":
      return AccountType.ORGANIZATION;
    case "User":
      return AccountType.USER;
    default:
      throw new Error(`Unsupported account type: ${type}`);
  }
}

export function saveInstallation(data: installationDataType) {
  return prisma.installation.upsert({
    where: {
      githubInstallationId: data.githubInstallationId,
    },
    update: {
      githubAccountId: data.githubAccountId,
      accountLogin: data.accountLogin,
      accountType: mapGithubAccountType(data.accountType),
    },
    create: {
      githubInstallationId: data.githubInstallationId,
      githubAccountId: data.githubAccountId,
      accountLogin: data.accountLogin,
      accountType: mapGithubAccountType(data.accountType),
    },
  });
}
