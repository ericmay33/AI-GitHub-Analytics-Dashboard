import { apiGet } from './client';
import type {
  Repository,
  RepositoryOverview,
  FullRepositoryAnalytics,
} from './types';

export async function getRepositories(): Promise<Repository[]> {
  return apiGet<Repository[]>('/repos');
}

export async function getRepositoryOverview(
  repoId: string
): Promise<RepositoryOverview> {
  return apiGet<RepositoryOverview>(`/repos/${repoId}`);
}

export async function getRepositoryAnalytics(
  repoId: string
): Promise<FullRepositoryAnalytics> {
  return apiGet<FullRepositoryAnalytics>(`/repos/${repoId}/analytics`);
}

