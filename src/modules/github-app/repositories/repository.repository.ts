import { prisma } from "../../../lib/prisma.js";

export async function saveRepository(
  savedInstallationId: any,
  repositories: any,
) {
  for (const repo of repositories) {
    await prisma.repository.upsert({
      where: {
        githubRepositoryId: BigInt(repo.id),
      },
      update: {
        name: repo.name,
        fullName: repo.full_name,
        defaultBranch: repo.default_branch,
        isPrivate: repo.private,
        isActive: true,
      },
      create: {
        githubRepositoryId: BigInt(repo.id),
        name: repo.name,
        fullName: repo.full_name,
        defaultBranch: repo.default_branch,
        isPrivate: repo.private,
        installationId: savedInstallationId,
      },
    });
  }
}
