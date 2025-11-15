import { prisma } from "../../prisma/client";
import { fetchRepoContributors } from "../github/contributorFetcher";

export async function ingestContributors(
  owner: string,
  repoName: string,
  repoId: string
) {
  const contributors = await fetchRepoContributors(owner, repoName);

  const results = [];

  for (const c of contributors) {
    // Upsert contributor
    const contributor = await prisma.contributor.upsert({
      where: { githubId: c.id },
      update: {
        login: c.login,
        avatarUrl: c.avatar_url,
        htmlUrl: c.html_url,
      },
      create: {
        githubId: c.id,
        login: c.login,
        avatarUrl: c.avatar_url,
        htmlUrl: c.html_url,
      },
    });

    // Ensure join table entry
    const contributorRepo = await prisma.contributorRepo.upsert({
      where: {
        contributorId_repoId: {
          contributorId: contributor.id,
          repoId,
        },
      },
      update: {},
      create: {
        contributorId: contributor.id,
        repoId,
      },
    });

    results.push({ contributor, contributorRepo });
  }

  return results;
}
