import { apiGet, apiPost } from './client';
import type {
  PullRequest,
  PullRequestListResponse,
  PRSummaryResponse,
} from './types';

export async function getPullRequests(
  repoId: string,
  options?: {
    page?: number;
    limit?: number;
    state?: 'open' | 'closed';
  }
): Promise<PullRequestListResponse> {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.state) params.append('state', options.state);

  const query = params.toString();
  const url = `/prs/repo/${repoId}${query ? `?${query}` : ''}`;

  return apiGet<PullRequestListResponse>(url);
}

export async function getPullRequestById(prId: string): Promise<PullRequest> {
  return apiGet<PullRequest>(`/prs/${prId}`);
}

export async function generatePRSummary(
  prId: string
): Promise<PRSummaryResponse> {
  return apiPost<PRSummaryResponse>(`/prs/${prId}/summarize`);
}

