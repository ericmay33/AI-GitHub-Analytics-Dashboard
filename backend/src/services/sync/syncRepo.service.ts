import { ingestRepository } from "../ingestion/repoIngestion.service";
import { ingestContributors } from "../ingestion/contributorIngestion.service";
import { ingestCommits } from "../ingestion/commitIngestion.service";
import { ingestPullRequests } from "../ingestion/prIngestion.service";
import { ingestIssues } from "../ingestion/issueIngestion.service";
import { aggregateDailyMetrics } from "../ingestion/metricsAggregation.service";

export async function syncRepo(repoUrl: string) {
  // STEP 1: Load or create repository record
  const repo = await ingestRepository(repoUrl);
  const owner = repo.owner;
  const repoName = repo.name;
  const repoId = repo.id;
  const defaultBranch = repo.defaultBranch ?? "main";

  // STEP 2: Ingest contributors
  const contributors = await ingestContributors(owner, repoName, repoId);

  // STEP 3: Ingest commits
  const commits = await ingestCommits(owner, repoName, repoId, defaultBranch);

  // STEP 4: Ingest pull requests
  const prs = await ingestPullRequests(owner, repoName, repoId);

  // STEP 5: Ingest issues
  const issues = await ingestIssues(owner, repoName, repoId);

  // STEP 6: Aggregate daily metrics
  const metrics = await aggregateDailyMetrics(repoId);

  return {
    repoId,
    contributors: contributors.length,
    commits: commits.length,
    prs: prs.length,
    issues: issues.length,
    metrics,
  };
}
