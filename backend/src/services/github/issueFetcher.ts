import { githubGet } from "./githubClient";

export interface GithubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  created_at: string;
  closed_at: string | null;
  user: {
    id: number;
    login: string;
  } | null;
  pull_request?: {
    url: string;
  };
}

/**
 * Fetch issues (excluding PRs)
 */
export async function fetchRepoIssues(owner: string, repo: string): Promise<GithubIssue[]> {
  const issues = await githubGet<GithubIssue[]>(`/repos/${owner}/${repo}/issues?state=all&per_page=100`);

  // Filter out PRs (issues that contain `pull_request`)
  return issues.filter((i) => !i.pull_request);
}
