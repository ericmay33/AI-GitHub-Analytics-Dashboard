import { useQuery } from '@tanstack/react-query';
import {
  getRepositories,
  getRepositoryOverview,
  getRepositoryAnalytics,
} from '../api/repos';

export function useRepositories() {
  return useQuery({
    queryKey: ['repositories'],
    queryFn: getRepositories,
    staleTime: 30000, // 30 seconds
  });
}

export function useRepositoryOverview(repoId: string) {
  return useQuery({
    queryKey: ['repository', repoId, 'overview'],
    queryFn: () => getRepositoryOverview(repoId),
    enabled: !!repoId,
    staleTime: 30000,
  });
}

export function useRepositoryAnalytics(repoId: string) {
  return useQuery({
    queryKey: ['repository', repoId, 'analytics'],
    queryFn: () => getRepositoryAnalytics(repoId),
    enabled: !!repoId,
    staleTime: 60000, // 1 minute - analytics are more expensive
  });
}

