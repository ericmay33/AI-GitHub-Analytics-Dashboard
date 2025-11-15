import { githubGet } from "./githubClient";

export interface GithubContributorResponse {
  id: number;
  login: string;
  avatar_url: string | null;
  html_url: string | null;
  contributions: number;
}

export async function fetchRepoContributors(owner: string, repo: string): Promise<GithubContributorResponse[]> {
  return githubGet<GithubContributorResponse[]>(`/repos/${owner}/${repo}/contributors?per_page=100`);
}
