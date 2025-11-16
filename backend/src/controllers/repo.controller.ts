import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import {
  getRepoBasicInfo,
  getDailyMetrics,
  getContributorStats,
} from "../services/data/repoData.service";
import { getFullRepositoryAnalytics } from "../services/data/repoAnalytics.service";

// ----------------------------------------
// GET /api/repos
// List all repositories (lightweight for sidebar)
// ----------------------------------------
export const getRepositories = async (req: Request, res: Response) => {
  try {
    const repositories = await prisma.repository.findMany({
      select: {
        id: true,
        owner: true,
        name: true,
        fullName: true,
        htmlUrl: true,
        lastSyncedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Check which repos have analytics data
    const repoIds = repositories.map((r) => r.id);
    const reposWithMetrics = await prisma.metricsDaily.groupBy({
      by: ["repoId"],
      where: {
        repoId: {
          in: repoIds,
        },
      },
    });

    const metricsRepoIds = new Set(reposWithMetrics.map((m) => m.repoId));

    // Map repositories with hasAnalytics flag
    const reposWithFlags = repositories.map((repo) => ({
      id: repo.id,
      owner: repo.owner,
      name: repo.name,
      fullName: repo.fullName,
      htmlUrl: repo.htmlUrl,
      lastSyncedAt: repo.lastSyncedAt,
      createdAt: repo.createdAt,
      hasAnalytics: metricsRepoIds.has(repo.id),
    }));

    return res.status(200).json(reposWithFlags);
  } catch (err: any) {
    console.error("Error fetching repositories:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch repositories" });
  }
};

// ----------------------------------------
// GET /api/repos/:repoId
// Get repository overview (medium-depth)
// ----------------------------------------
export const getRepositoryOverview = async (req: Request, res: Response) => {
  try {
    const { repoId } = req.params;

    if (!repoId) {
      return res.status(400).json({ error: "Repository ID is required" });
    }

    // Fetch basic info, daily metrics, and contributor stats in parallel
    const [repoInfo, dailyMetrics, contributorStats] = await Promise.all([
      getRepoBasicInfo(repoId),
      getDailyMetrics(repoId),
      getContributorStats(repoId),
    ]);

    if (!repoInfo) {
      return res.status(404).json({ error: "Repository not found" });
    }

    // Get last 30 days of metrics
    const recentMetrics = dailyMetrics.slice(-30);

    // Get top 10 contributors
    const topContributors = contributorStats.topCommitters.slice(0, 10).map((c) => ({
      id: c.id,
      login: c.login,
      avatarUrl: c.avatarUrl,
      commitCount: c.commitCount,
    }));

    return res.status(200).json({
      repo: repoInfo,
      recentMetrics,
      topContributors,
    });
  } catch (err: any) {
    console.error("Error fetching repository overview:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch repository overview" });
  }
};

// ----------------------------------------
// GET /api/repos/:repoId/analytics
// Get full repository analytics (includes AI analysis)
// ----------------------------------------
export const getRepositoryAnalytics = async (req: Request, res: Response) => {
  try {
    const { repoId } = req.params;

    if (!repoId) {
      return res.status(400).json({ error: "Repository ID is required" });
    }

    const analytics = await getFullRepositoryAnalytics(repoId);

    return res.status(200).json(analytics);
  } catch (err: any) {
    console.error("Error fetching repository analytics:", err);
    
    if (err.message?.includes("not found")) {
      return res.status(404).json({ error: err.message });
    }

    return res.status(500).json({ error: err.message || "Failed to fetch repository analytics" });
  }
};
