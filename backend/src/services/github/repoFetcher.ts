import { githubGet } from "./githubClient";

// -----------------------------------------------
// GitHub Repo Metadata Type
// -----------------------------------------------
export interface GithubRepoResponse {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  default_branch: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
  };
}

// -----------------------------------------------
// Fetch Repo Metadata (typed)
// -----------------------------------------------
export async function fetchRepoMeta(owner: string, repo: string): Promise<GithubRepoResponse> {
  return githubGet<GithubRepoResponse>(`/repos/${owner}/${repo}`);
}

// -----------------------------------------------
// Fetch Repo Languages Breakdown
// -----------------------------------------------
export async function fetchRepoLanguages(owner: string, repo: string): Promise<Record<string, number>> {
  return githubGet<Record<string, number>>(`/repos/${owner}/${repo}/languages`);
}

// -----------------------------------------------
// Fetch Code Frequency (Weekly Add/Del)
// -----------------------------------------------
export async function fetchRepoCodeFrequency(owner: string, repo: string): Promise<[number, number, number][]> {
  return githubGet<[number, number, number][]>(`/repos/${owner}/${repo}/stats/code_frequency`);
}

// -----------------------------------------------
// Fetch Weekly Commit Activity
// -----------------------------------------------
export async function fetchRepoParticipation(owner: string, repo: string): Promise<{ all: number[]; owner: number[] }> {
  return githubGet<{ all: number[]; owner: number[] }>(`/repos/${owner}/${repo}/stats/participation`);
}

// -----------------------------------------------
// Fetch Repo Contributors Count
// -----------------------------------------------
export async function fetchRepoContributorsCount(owner: string, repo: string): Promise<number> {
  const data = await githubGet<any[]>(`/repos/${owner}/${repo}/contributors`, {
    per_page: 1,
    anon: true,
  });

  return Array.isArray(data) ? data.length : 0;
}
