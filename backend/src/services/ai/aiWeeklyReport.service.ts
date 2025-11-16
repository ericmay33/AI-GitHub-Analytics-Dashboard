import { prisma } from "../../prisma/client";
import { generateStructured } from "./openaiClient";
import {
  getRepoBasicInfo,
  getDailyMetrics,
  getPRTimeline,
  getIssueTimeline,
  getHotspots,
  getContributorStats,
} from "../data/repoData.service";

// ----------------------------------------
// AI Weekly Report Output Schema
// ----------------------------------------
interface AIWeeklyReport {
  highlights: string[];
  keyPRs: Array<{ id: string; title: string }>;
  keyIssues: Array<{ id: string; title: string }>;
  activeContributors: string[];
  riskAlerts: string[];
  velocitySummary: string;
  suggestedNextSteps: string[];
}

// ----------------------------------------
// Generate Weekly Report
// ----------------------------------------
export async function generateWeeklyReport(repoId: string): Promise<AIWeeklyReport> {
  // Verify repository exists
  const repoInfo = await getRepoBasicInfo(repoId);
  if (!repoInfo) {
    throw new Error(`Repository with id ${repoId} not found`);
  }

  // Get all daily metrics
  const allDailyMetrics = await getDailyMetrics(repoId);
  const prTimeline = await getPRTimeline(repoId);
  const issueTimeline = await getIssueTimeline(repoId);

  // Calculate date 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

  // Filter last 7 days of data
  const last7DaysMetrics = allDailyMetrics.filter((m) => m.day >= sevenDaysAgoStr);
  const last7DaysPRs = prTimeline.filter((p) => p.day >= sevenDaysAgoStr);
  const last7DaysIssues = issueTimeline.filter((i) => i.day >= sevenDaysAgoStr);

  // Aggregate last 7 days
  const commitsLast7Days = last7DaysMetrics.reduce((sum, m) => sum + m.commitsCount, 0);
  const prsOpenedLast7Days = last7DaysMetrics.reduce((sum, m) => sum + m.prsOpened, 0);
  const prsMergedLast7Days = last7DaysMetrics.reduce((sum, m) => sum + m.prsMerged, 0);
  const issuesOpenedLast7Days = last7DaysMetrics.reduce((sum, m) => sum + m.issuesOpened, 0);
  const issuesClosedLast7Days = last7DaysMetrics.reduce((sum, m) => sum + m.issuesClosed, 0);
  const linesAddedLast7Days = last7DaysMetrics.reduce((sum, m) => sum + m.linesAdded, 0);
  const linesDeletedLast7Days = last7DaysMetrics.reduce((sum, m) => sum + m.linesDeleted, 0);

  // Get anomalies from MetricsDaily (last 7 days)
  const allMetrics = await prisma.metricsDaily.findMany({
    where: {
      repoId,
      day: {
        gte: sevenDaysAgo,
      },
    },
    select: {
      day: true,
      anomalies: true,
    },
  });

  // Filter to only entries with anomalies
  const anomaliesData = allMetrics.filter((m) => m.anomalies !== null);

  // Get recent PRs (last 7 days) with details
  const recentPRs = await prisma.pullRequest.findMany({
    where: {
      repoId,
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    select: {
      id: true,
      number: true,
      title: true,
      state: true,
      mergedAt: true,
      additions: true,
      deletions: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  // Get recent issues (last 7 days)
  const recentIssues = await prisma.issue.findMany({
    where: {
      repoId,
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    select: {
      id: true,
      number: true,
      title: true,
      state: true,
      closedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  // Get contributor activity (commits in last 7 days)
  const recentCommits = await prisma.commit.findMany({
    where: {
      repoId,
      committedAt: {
        gte: sevenDaysAgo,
      },
    },
    select: {
      contributorId: true,
      contributor: {
        select: {
          login: true,
        },
      },
    },
  });

  const contributorActivity = new Map<string, number>();
  recentCommits.forEach((commit) => {
    if (commit.contributor?.login) {
      const current = contributorActivity.get(commit.contributor.login) || 0;
      contributorActivity.set(commit.contributor.login, current + 1);
    }
  });

  const activeContributorsList = Array.from(contributorActivity.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([login]) => login);

  // Get hotspots for context
  const hotspots = await getHotspots(repoId);
  const topHotspots = hotspots.slice(0, 5);

  // Build context for AI
  const systemPrompt = `You are an expert software engineering analyst creating weekly reports for GitHub repositories.
Your job is to analyze the last 7 days of activity and provide structured insights, highlights, and recommendations.
Return ONLY valid JSON matching the exact schema requested.`;

  const userPrompt = `
Repository: ${repoInfo.fullName} (${repoInfo.owner}/${repoInfo.name})

Last 7 Days Activity Summary:
- Commits: ${commitsLast7Days}
- PRs Opened: ${prsOpenedLast7Days}
- PRs Merged: ${prsMergedLast7Days}
- Issues Opened: ${issuesOpenedLast7Days}
- Issues Closed: ${issuesClosedLast7Days}
- Lines Added: ${linesAddedLast7Days}
- Lines Deleted: ${linesDeletedLast7Days}
- Net Code Change: ${linesAddedLast7Days - linesDeletedLast7Days} lines

Active Contributors (last 7 days):
${activeContributorsList.map((login, i) => `${i + 1}. ${login}`).join("\n")}

Recent Pull Requests (last 7 days):
${recentPRs.slice(0, 10).map((pr) => `- PR #${pr.number}: "${pr.title}" - ${pr.state}${pr.mergedAt ? " (merged)" : ""} - ${(pr.additions || 0) + (pr.deletions || 0)} changes`).join("\n")}

Recent Issues (last 7 days):
${recentIssues.slice(0, 10).map((issue) => `- Issue #${issue.number}: "${issue.title}" - ${issue.state}${issue.closedAt ? " (closed)" : ""}`).join("\n")}

Code Hotspots (highest churn PRs):
${topHotspots.map((h, i) => `${i + 1}. PR #${h.number}: "${h.title}" - ${h.totalChanges} total changes`).join("\n")}

Anomalies Detected:
${anomaliesData.length > 0 ? anomaliesData.map((a) => `- ${a.day.toISOString().split("T")[0]}: ${JSON.stringify(a.anomalies)}`).join("\n") : "None detected"}

Daily Breakdown (last 7 days):
${last7DaysMetrics.map((m) => `- ${m.day}: ${m.commitsCount} commits, ${m.prsOpened} PRs opened, ${m.prsMerged} PRs merged, ${m.issuesOpened} issues opened, ${m.issuesClosed} issues closed`).join("\n")}

Generate a weekly report with:
1. highlights: Array of 3-5 key highlights from the week
2. keyPRs: Array of the most important PRs (use PR IDs and titles from the data above, max 5)
3. keyIssues: Array of the most important issues (use issue IDs and titles from the data above, max 5)
4. activeContributors: Array of contributor logins who were most active (use from the list above)
5. riskAlerts: Array of 2-4 potential risks or concerns identified
6. velocitySummary: A 2-3 sentence summary of development velocity and trends
7. suggestedNextSteps: Array of 3-5 actionable next steps

Return the report as a JSON object matching this exact structure.`;

  // Generate structured AI report using Groq
  const weeklyReport = await generateStructured<AIWeeklyReport>({
    system: systemPrompt,
    user: userPrompt,
  });

  // Save to AISummary table (create new entry for weekly report to maintain history)
  await prisma.aISummary.create({
    data: {
      entityType: "WEEKLY",
      repoId: repoId,
      summary: weeklyReport.velocitySummary,
      metadata: {
        highlights: weeklyReport.highlights,
        keyPRs: weeklyReport.keyPRs,
        keyIssues: weeklyReport.keyIssues,
        activeContributors: weeklyReport.activeContributors,
        riskAlerts: weeklyReport.riskAlerts,
        suggestedNextSteps: weeklyReport.suggestedNextSteps,
      },
    },
  });

  return weeklyReport;
}
