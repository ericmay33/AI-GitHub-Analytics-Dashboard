import { prisma } from "../../prisma/client";
import { fetchRepoPRs } from "../github/prFetcher";

export async function ingestPullRequests(owner: string, repoName: string, repoId: string) {
  const prs = await fetchRepoPRs(owner, repoName);

  const results = [];

  for (const pr of prs) {
    // Find contributor (if any)
    let contributorId: string | null = null;

    if (pr.user?.id) {
      const contributor = await prisma.contributor.findUnique({
        where: { githubId: pr.user.id },
      });
      contributorId = contributor?.id ?? null;
    }

    // Upsert PR
    const stored = await prisma.pullRequest.upsert({
      where: {
        repoId_number: {
          repoId,
          number: pr.number,
        },
      },
      update: {
        title: pr.title,
        body: pr.body,
        state: pr.state,
        additions: pr.additions,
        deletions: pr.deletions,
        changedFiles: pr.changed_files,
        createdAt: new Date(pr.created_at),
        mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
        closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
        contributorId,
      },
      create: {
        number: pr.number,
        title: pr.title,
        body: pr.body,
        state: pr.state,
        additions: pr.additions,
        deletions: pr.deletions,
        changedFiles: pr.changed_files,
        createdAt: new Date(pr.created_at),
        mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
        closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
        repoId,
        contributorId,
      },
    });

    results.push(stored);
  }

  return results;
}
