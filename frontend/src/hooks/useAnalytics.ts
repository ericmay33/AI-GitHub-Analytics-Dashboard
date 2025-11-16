import { useQuery } from '@tanstack/react-query';
import { getRepositoryAnalytics } from '../api/repos';

export function useAnalytics(repoId: string) {
  return useQuery({
    queryKey: ['analytics', repoId],
    queryFn: () => getRepositoryAnalytics(repoId),
    enabled: !!repoId,
    staleTime: 60000, // Analytics are expensive, cache longer
  });
}

