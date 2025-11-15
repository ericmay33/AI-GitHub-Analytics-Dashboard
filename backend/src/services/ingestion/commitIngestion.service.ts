import { prisma } from "../../prisma/client";
import { fetchRepoCommits, fetchCommitDetails } from "../github/commitFetcher";

export async function ingestCommits(owner: string, repoName: string, repoId: string, defaultBranch: string) {
  // Fetch the list of commits
  const commitList = await fetchRepoCommits(owner, repoName, defaultBranch);

  const results = [];

  for (const c of commitList) {
    // Fetch full commit details
    const details = await fetchCommitDetails(owner, repoName, c.sha);

    const authorGithubId = c.author?.id ?? null;

    // Upsert commit
    const commit = await prisma.commit.upsert({
      where: { sha: c.sha },
      update: {
        message: c.commit.message,
        additions: details.stats.additions,
        deletions: details.stats.deletions,
        totalChanges: details.stats.total,
        committedAt: new Date(c.commit.author.date),
        repoId,
        contributorId: authorGithubId
          ? (
              await prisma.contributor.findUnique({
                where: { githubId: authorGithubId },
              })
            )?.id
          : null,
      },
      create: {
        sha: c.sha,
        message: c.commit.message,
        additions: details.stats.additions,
        deletions: details.stats.deletions,
        totalChanges: details.stats.total,
        committedAt: new Date(c.commit.author.date),
        repoId,
        contributorId: authorGithubId
          ? (
              await prisma.contributor.findUnique({
                where: { githubId: authorGithubId },
              })
            )?.id
          : null,
      },
    });

    results.push(commit);
  }

  return results;
}
