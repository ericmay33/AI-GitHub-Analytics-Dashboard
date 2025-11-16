import { apiPost } from './client';
import type { SyncRepositoryResponse } from './types';

export async function syncRepository(
  repoUrl: string
): Promise<SyncRepositoryResponse> {
  return apiPost<SyncRepositoryResponse>('/sync', { repoUrl });
}

