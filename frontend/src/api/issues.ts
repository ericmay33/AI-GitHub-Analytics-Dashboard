import { apiGet } from './client';
import type { IssueListResponse } from './types';

export async function getIssues(
  repoId: string,
  options?: {
    page?: number;
    limit?: number;
    state?: 'open' | 'closed';
  }
): Promise<IssueListResponse> {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.state) params.append('state', options.state);

  const query = params.toString();
  const url = `/issues/repo/${repoId}${query ? `?${query}` : ''}`;

  return apiGet<IssueListResponse>(url);
}

// Note: There's no GET /api/issues/:issueId endpoint in the backend,
// but we can add it if needed for issue details
// For now, we'll use the list endpoint and filter client-side if needed

