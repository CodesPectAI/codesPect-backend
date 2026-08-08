interface PullRequestWebhookPayload {
  repository: {
    owner: { login: string };
    name: string;
  };
  pull_request: {
    number: number;
  };
}

interface PullRequestOctokit {
  issues: {
    createComment: (params: {
      owner: string;
      repo: string;
      issue_number: number;
      body: string;
    }) => Promise<unknown>;
  };
}

interface HandlePullRequestParams {
  octokit: PullRequestOctokit;
  payload: PullRequestWebhookPayload;
}

export async function handlePullRequest({
  octokit,
  payload,
}: HandlePullRequestParams) {
  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const pull_number = payload.pull_request.number;

  console.log(`Received a pull request event for #${pull_number}`);
  try {
    const result = await await octokit.issues.createComment({
      owner,
      repo,
      issue_number: pull_number,
      body: "PR opened 🚀",
    });
    console.dir(result, { depth: null });
  } catch (error: any) {
    if (error.response) {
      console.error(
        `Error! Status: ${error.response.status}. Message: ${error.response.data.message}`,
      );
    }
    console.error(error);
  }
}
