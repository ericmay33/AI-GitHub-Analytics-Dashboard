import { prisma } from "../../prisma/client";
import { fetchRepoMeta, fetchRepoLanguages } from "../github/repoFetcher";
import { parseRepoUrl } from "../../utils/parseRepoUrl";
import { Repository } from "@prisma/client";

// -----------------------------------------------
// Add or update repository in the database
// -----------------------------------------------
export async function ingestRepository(repoUrl: string): Promise<Repository> {
  // Parse owner + repo from URL
  const { owner, name } = parseRepoUrl(repoUrl);

  // Fetch metadata from GitHub
  const meta = await fetchRepoMeta(owner, name);

  // Fetch language breakdown
  const languages = await fetchRepoLanguages(owner, name);

  // Upsert into database
  const repo = await prisma.repository.upsert({
    where: { githubId: meta.id },
    update: {
      name: meta.name,
      owner: meta.owner.login,
      fullName: meta.full_name,
      htmlUrl: meta.html_url,
      defaultBranch: meta.default_branch,
      updatedAt: new Date(),
    },
    create: {
      githubId: meta.id,
      name: meta.name,
      owner: meta.owner.login,
      fullName: meta.full_name,
      htmlUrl: meta.html_url,
      defaultBranch: meta.default_branch,
    },
  });

  // Optionally: store languages in metadata table later
  // For now, just return it with repo for UI/analytics
  return {
    ...repo,
    // @ts-ignore — safe temporary mount until we add metadata model
    languages,
  };
}
