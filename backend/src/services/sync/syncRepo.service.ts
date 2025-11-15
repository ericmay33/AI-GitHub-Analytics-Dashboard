import { ingestRepository } from "../ingestion/repoIngestion.service";
import { ingestContributors } from "../ingestion/contributorIngestion.service";
import { ingestCommits } from "../ingestion/commitIngestion.service";
import { ingestPullRequests } from "../ingestion/prIngestion.service";
import { ingestIssues } from "../ingestion/issueIngestion.service";
import { aggregateDailyMetrics } from "../ingestion/metricsAggregation.service";

export async function syncRepo(repoUrl: string) {
  // STEP 1: Load or create repository record
  const repo = await ingestRepository(repoUrl);

  // STEP 2: Ingest contributors
  const contributors = await ingestContributors(repo);

  // STEP 3: Ingest commits
  const commits = await ingestCommits(repo);

  // STEP 4: Ingest pull requests
  const prs = await ingestPullRequests(repo);

  // STEP 5: Ingest issues
  const issues = await ingestIssues(repo);

  // STEP 6: Aggregate daily metrics
  const metrics = await aggregateDailyMetrics(repo.id);

  return {
    repoId: repo.id,
    contributors: contributors.length,
    commits: commits.length,
    prs: prs.length,
    issues: issues.length,
    metrics,
  };
}
