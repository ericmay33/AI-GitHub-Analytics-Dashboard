import {
  getRepoBasicInfo,
  getRepoContributors,
  getCommitTimeline,
  getPRTimeline,
  getIssueTimeline,
  getHotspots,
  getContributorStats,
  getDailyMetrics,
} from "./repoData.service";
import { generateRepoAIAnalysis } from "../ai/aiRepoAnalysis.service";
import { generateWeeklyReport } from "../ai/aiWeeklyReport.service";

// ----------------------------------------
// Type Definitions
// ----------------------------------------
interface RepoOverview {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  htmlUrl: string;
  defaultBranch: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastSyncedAt: Date | null;
}

interface ContributorStats {
  id: string;
  login: string;
  avatarUrl: string | null;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
}

interface ActivityTimeline {
  commits: Array<{
    day: string;
    commits: number;
    additions: number;
    deletions: number;
  }>;
  prs: Array<{
    day: string;
    opened: number;
    merged: number;
  }>;
  issues: Array<{
    day: string;
    opened: number;
    closed: number;
  }>;
}

interface HotspotData {
  prId: string;
  number: number;
  title: string;
  additions: number;
  deletions: number;
  totalChanges: number;
  createdAt: Date;
  mergedAt: Date | null;
}

interface QualityIndicators {
  totalCommits: number;
  totalPRsOpened: number;
  totalPRsMerged: number;
  prMergeRate: number;
  totalIssuesOpened: number;
  totalIssuesClosed: number;
  issueCloseRate: number;
  activeDays: number;
  totalContributors: number;
}

interface AIRepoAnalysis {
  healthScore: number;
  riskLevel: "low" | "medium" | "high";
  summary: string;
  strengths: string[];
  weaknesses: string[];
  hotspots: Array<{ file: string; churn: number }>;
  contributorInsights: string[];
  recommendations: string[];
}

interface AIWeeklyReport {
  highlights: string[];
  keyPRs: Array<{ id: string; title: string }>;
  keyIssues: Array<{ id: string; title: string }>;
  activeContributors: string[];
  riskAlerts: string[];
  velocitySummary: string;
  suggestedNextSteps: string[];
}

interface FullRepositoryAnalytics {
  repo: RepoOverview;
  metrics: Array<{
    day: string;
    commitsCount: number;
    prsOpened: number;
    prsMerged: number;
    issuesOpened: number;
    issuesClosed: number;
    linesAdded: number;
    linesDeleted: number;
  }>;
  contributors: ContributorStats[];
  timeline: ActivityTimeline;
  hotspots: HotspotData[];
  quality: QualityIndicators;
  ai: {
    repoAnalysis: AIRepoAnalysis;
    weeklyReport: AIWeeklyReport;
  };
}

// ----------------------------------------
// Get Full Repository Analytics
// ----------------------------------------
export async function getFullRepositoryAnalytics(
  repoId: string
): Promise<FullRepositoryAnalytics> {
  // Verify repository exists
  const repoInfo = await getRepoBasicInfo(repoId);
  if (!repoInfo) {
    throw new Error(`Repository with id ${repoId} not found`);
  }

  // Fetch all raw analytics data in parallel
  const [
    contributors,
    commitTimeline,
    prTimeline,
    issueTimeline,
    hotspots,
    contributorStats,
    dailyMetrics,
  ] = await Promise.all([
    getRepoContributors(repoId),
    getCommitTimeline(repoId),
    getPRTimeline(repoId),
    getIssueTimeline(repoId),
    getHotspots(repoId),
    getContributorStats(repoId),
    getDailyMetrics(repoId),
  ]);

  // Calculate quality indicators
  const totalCommits = commitTimeline.reduce((sum, day) => sum + day.commits, 0);
  const totalPRsOpened = prTimeline.reduce((sum, day) => sum + day.opened, 0);
  const totalPRsMerged = prTimeline.reduce((sum, day) => sum + day.merged, 0);
  const totalIssuesOpened = issueTimeline.reduce((sum, day) => sum + day.opened, 0);
  const totalIssuesClosed = issueTimeline.reduce((sum, day) => sum + day.closed, 0);
  const prMergeRate = totalPRsOpened > 0 ? (totalPRsMerged / totalPRsOpened) * 100 : 0;
  const issueCloseRate = totalIssuesOpened > 0 ? (totalIssuesClosed / totalIssuesOpened) * 100 : 0;

  const quality: QualityIndicators = {
    totalCommits,
    totalPRsOpened,
    totalPRsMerged,
    prMergeRate: Math.round(prMergeRate * 10) / 10,
    totalIssuesOpened,
    totalIssuesClosed,
    issueCloseRate: Math.round(issueCloseRate * 10) / 10,
    activeDays: contributorStats.activeDays,
    totalContributors: contributorStats.topCommitters.length,
  };

  // Build timeline structure
  const timeline: ActivityTimeline = {
    commits: commitTimeline,
    prs: prTimeline,
    issues: issueTimeline,
  };

  // Fetch AI analysis (may take time, but run in parallel)
  let aiRepoAnalysis: AIRepoAnalysis;
  let aiWeeklyReport: AIWeeklyReport;

  try {
    [aiRepoAnalysis, aiWeeklyReport] = await Promise.all([
      generateRepoAIAnalysis(repoId),
      generateWeeklyReport(repoId),
    ]);
  } catch (error: any) {
    // If AI generation fails, provide fallback structure
    console.error("AI analysis generation failed:", error.message);
    aiRepoAnalysis = {
      healthScore: 0,
      riskLevel: "medium",
      summary: "AI analysis unavailable",
      strengths: [],
      weaknesses: [],
      hotspots: [],
      contributorInsights: [],
      recommendations: [],
    };
    aiWeeklyReport = {
      highlights: [],
      keyPRs: [],
      keyIssues: [],
      activeContributors: [],
      riskAlerts: [],
      velocitySummary: "Weekly report unavailable",
      suggestedNextSteps: [],
    };
  }

  // Build and return complete analytics object
  return {
    repo: {
      id: repoInfo.id,
      owner: repoInfo.owner,
      name: repoInfo.name,
      fullName: repoInfo.fullName,
      htmlUrl: repoInfo.htmlUrl,
      defaultBranch: repoInfo.defaultBranch,
      createdAt: repoInfo.createdAt,
      updatedAt: repoInfo.updatedAt,
      lastSyncedAt: repoInfo.lastSyncedAt,
    },
    metrics: dailyMetrics,
    contributors,
    timeline,
    hotspots,
    quality,
    ai: {
      repoAnalysis: aiRepoAnalysis,
      weeklyReport: aiWeeklyReport,
    },
  };
}

