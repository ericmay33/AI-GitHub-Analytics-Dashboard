import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPullRequests,
  getPullRequestById,
  generatePRSummary,
} from '../api/prs';

export function usePullRequests(
  repoId: string,
  options?: {
    page?: number;
    limit?: number;
    state?: 'open' | 'closed';
  }
) {
  return useQuery({
    queryKey: ['pullRequests', repoId, options],
    queryFn: () => getPullRequests(repoId, options),
    enabled: !!repoId,
    staleTime: 30000,
  });
}

export function usePullRequest(prId: string) {
  return useQuery({
    queryKey: ['pullRequest', prId],
    queryFn: () => getPullRequestById(prId),
    enabled: !!prId,
    staleTime: 30000,
  });
}

export function useGeneratePRSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prId: string) => generatePRSummary(prId),
    onSuccess: (_data, prId) => {
      // Invalidate the PR query to refetch with new summary
      queryClient.invalidateQueries({ queryKey: ['pullRequest', prId] });
    },
  });
}

