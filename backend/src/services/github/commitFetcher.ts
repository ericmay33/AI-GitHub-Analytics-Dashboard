import { githubGet } from "./githubClient";

export interface GithubCommitListItem {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  author: {
    id: number;
    login: string;
    avatar_url: string;
  } | null;
}

export interface GithubCommitDetails {
  sha: string;
  stats: {
    additions: number;
    deletions: number;
    total: number;
  };
  files?: {
    filename: string;
    additions: number;
    deletions: number;
    changes: number;
  }[];
}

/**
 * Fetch list of commits
 */
export async function fetchRepoCommits(owner: string, repo: string, branch: string): Promise<GithubCommitListItem[]> {
  return githubGet<GithubCommitListItem[]>(`/repos/${owner}/${repo}/commits?sha=${branch}&per_page=100`);
}

/**
 * Fetch details for a specific commit SHA
 */
export async function fetchCommitDetails(owner: string, repo: string, sha: string): Promise<GithubCommitDetails> {
  return githubGet<GithubCommitDetails>(`/repos/${owner}/${repo}/commits/${sha}`);
}
