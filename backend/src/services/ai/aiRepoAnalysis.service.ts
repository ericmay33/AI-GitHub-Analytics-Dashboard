import { prisma } from "../../prisma/client";
import { generateStructured } from "./openaiClient";
import {
  getRepoBasicInfo,
  getContributorStats,
  getHotspots,
  getCommitTimeline,
  getPRTimeline,
  getIssueTimeline,
  getDailyMetrics,
} from "../data/repoData.service";

// ----------------------------------------
// AI Repo Analysis Output Schema
// ----------------------------------------
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

// ----------------------------------------
// Generate AI Repository Analysis
// ----------------------------------------
export async function generateRepoAIAnalysis(repoId: string): Promise<AIRepoAnalysis> {
  // Verify repository exists
  const repoInfo = await getRepoBasicInfo(repoId);
  if (!repoInfo) {
    throw new Error(`Repository with id ${repoId} not found`);
  }

  // Fetch raw analytics data
  const [
    contributorStats,
    hotspots,
    commitTimeline,
    prTimeline,
    issueTimeline,
    dailyMetrics,
  ] = await Promise.all([
    getContributorStats(repoId),
    getHotspots(repoId),
    getCommitTimeline(repoId),
    getPRTimeline(repoId),
    getIssueTimeline(repoId),
    getDailyMetrics(repoId),
  ]);

  // Calculate quality indicators from data
  const totalCommits = commitTimeline.reduce((sum, day) => sum + day.commits, 0);
  const totalPRsOpened = prTimeline.reduce((sum, day) => sum + day.opened, 0);
  const totalPRsMerged = prTimeline.reduce((sum, day) => sum + day.merged, 0);
  const totalIssuesOpened = issueTimeline.reduce((sum, day) => sum + day.opened, 0);
  const totalIssuesClosed = issueTimeline.reduce((sum, day) => sum + day.closed, 0);
  const prMergeRate = totalPRsOpened > 0 ? (totalPRsMerged / totalPRsOpened) * 100 : 0;
  const issueCloseRate = totalIssuesOpened > 0 ? (totalIssuesClosed / totalIssuesOpened) * 100 : 0;
  const avgCommitsPerDay = dailyMetrics.length > 0 ? totalCommits / dailyMetrics.length : 0;
  const totalContributors = contributorStats.topCommitters.length;
  const topContributorCommitShare =
    totalCommits > 0 && contributorStats.topCommitters.length > 0
      ? (contributorStats.topCommitters[0].commitCount / totalCommits) * 100
      : 0;

  // Build context for AI
  const systemPrompt = `You are an expert software engineering analyst specializing in GitHub repository health assessment.
Your job is to analyze repository data and provide structured insights about code quality, team dynamics, and project health.
Return ONLY valid JSON matching the exact schema requested.`;

  const userPrompt = `
Repository: ${repoInfo.fullName} (${repoInfo.owner}/${repoInfo.name})
Created: ${repoInfo.createdAt.toISOString().split("T")[0]}
Last Synced: ${repoInfo.lastSyncedAt ? repoInfo.lastSyncedAt.toISOString().split("T")[0] : "Never"}

Activity Metrics:
- Total Commits: ${totalCommits}
- Total PRs Opened: ${totalPRsOpened}
- Total PRs Merged: ${totalPRsMerged}
- PR Merge Rate: ${prMergeRate.toFixed(1)}%
- Total Issues Opened: ${totalIssuesOpened}
- Total Issues Closed: ${totalIssuesClosed}
- Issue Close Rate: ${issueCloseRate.toFixed(1)}%
- Average Commits Per Day: ${avgCommitsPerDay.toFixed(1)}
- Active Days: ${contributorStats.activeDays}
- Total Contributors: ${totalContributors}

Top Contributors (by commits):
${contributorStats.topCommitters.slice(0, 5).map((c, i) => `${i + 1}. ${c.login}: ${c.commitCount} commits`).join("\n")}

Top Contributor Dominance: ${topContributorCommitShare.toFixed(1)}% of commits

Code Hotspots (PRs with most changes):
${hotspots.slice(0, 10).map((h, i) => `${i + 1}. PR #${h.number}: "${h.title}" - ${h.totalChanges} changes (${h.additions} additions, ${h.deletions} deletions)`).join("\n")}

Recent Activity (last 30 days):
${dailyMetrics.slice(-30).map((m) => `- ${m.day}: ${m.commitsCount} commits, ${m.prsOpened} PRs opened, ${m.prsMerged} PRs merged, ${m.issuesOpened} issues opened, ${m.issuesClosed} issues closed`).join("\n")}

Analyze this repository and provide:
1. healthScore: A number from 0-100 representing overall repository health
2. riskLevel: "low", "medium", or "high" based on potential risks
3. summary: A 2-3 sentence overview of the repository's current state
4. strengths: Array of 3-5 key strengths
5. weaknesses: Array of 3-5 key weaknesses or concerns
6. hotspots: Array of objects with file paths (use PR titles as file identifiers) and churn scores (based on PR changes)
7. contributorInsights: Array of 3-5 insights about contributor activity and distribution
8. recommendations: Array of 3-5 actionable recommendations for improvement

Return the analysis as a JSON object matching this exact structure.`;

  // Generate structured AI analysis using Groq
  const aiAnalysis = await generateStructured<AIRepoAnalysis>({
    system: systemPrompt,
    user: userPrompt,
  });

  // Save to AISummary table (find latest or create new)
  const existing = await prisma.aISummary.findFirst({
    where: {
      repoId: repoId,
      entityType: "REPO",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (existing) {
    await prisma.aISummary.update({
      where: { id: existing.id },
      data: {
        summary: aiAnalysis.summary,
        metadata: {
          healthScore: aiAnalysis.healthScore,
          riskLevel: aiAnalysis.riskLevel,
          strengths: aiAnalysis.strengths,
          weaknesses: aiAnalysis.weaknesses,
          hotspots: aiAnalysis.hotspots,
          contributorInsights: aiAnalysis.contributorInsights,
          recommendations: aiAnalysis.recommendations,
        },
      },
    });
  } else {
    await prisma.aISummary.create({
      data: {
        entityType: "REPO",
        repoId: repoId,
        summary: aiAnalysis.summary,
        metadata: {
          healthScore: aiAnalysis.healthScore,
          riskLevel: aiAnalysis.riskLevel,
          strengths: aiAnalysis.strengths,
          weaknesses: aiAnalysis.weaknesses,
          hotspots: aiAnalysis.hotspots,
          contributorInsights: aiAnalysis.contributorInsights,
          recommendations: aiAnalysis.recommendations,
        },
      },
    });
  }

  return aiAnalysis;
}
