import { useQuery } from '@tanstack/react-query';
import { getIssues } from '../api/issues';

export function useIssues(
  repoId: string,
  options?: {
    page?: number;
    limit?: number;
    state?: 'open' | 'closed';
  }
) {
  return useQuery({
    queryKey: ['issues', repoId, options],
    queryFn: () => getIssues(repoId, options),
    enabled: !!repoId,
    staleTime: 30000,
  });
}

