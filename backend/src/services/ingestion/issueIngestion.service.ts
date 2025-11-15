import { prisma } from "../../prisma/client";
import { fetchRepoIssues } from "../github/issueFetcher";

export async function ingestIssues(owner: string, repoName: string, repoId: string) {
  const issues = await fetchRepoIssues(owner, repoName);

  const results = [];

  for (const issue of issues) {
    // Look up contributor if available
    let contributorId: string | null = null;

    if (issue.user?.id) {
      const contributor = await prisma.contributor.findUnique({
        where: { githubId: issue.user.id },
      });
      contributorId = contributor?.id ?? null;
    }

    // Upsert issue
    const stored = await prisma.issue.upsert({
      where: {
        repoId_number: {
          repoId,
          number: issue.number,
        },
      },
      update: {
        title: issue.title,
        body: issue.body,
        state: issue.state,
        createdAt: new Date(issue.created_at),
        closedAt: issue.closed_at ? new Date(issue.closed_at) : null,
        contributorId,
      },
      create: {
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        createdAt: new Date(issue.created_at),
        closedAt: issue.closed_at ? new Date(issue.closed_at) : null,
        repoId,
        contributorId,
      },
    });

    results.push(stored);
  }

  return results;
}
