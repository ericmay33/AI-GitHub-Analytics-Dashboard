import { githubGet } from "./githubClient";

export interface GithubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  merged_at: string | null;
  created_at: string;
  closed_at: string | null;
  additions: number;
  deletions: number;
  changed_files: number;
  user: {
    id: number;
    login: string;
    avatar_url: string | null;
  } | null;
}

/**
 * Fetch all pull requests (open & closed)
 */
export async function fetchRepoPRs(owner: string, repo: string): Promise<GithubPullRequest[]> {
  return githubGet<GithubPullRequest[]>(`/repos/${owner}/${repo}/pulls?state=all&per_page=100`);
}
