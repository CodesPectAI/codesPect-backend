import { github } from "./github-app";

export async function getInstallationOctokit(installationId: number) {
    await github.getInstallationOctokit(installationId);
}
