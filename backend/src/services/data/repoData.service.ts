import { prisma } from "../../prisma/client";

// ----------------------------------------
// 1. Get Repository Basic Info
// ----------------------------------------
async function getRepoBasicInfo(repoId: string) {
  const repo = await prisma.repository.findUnique({
    where: { id: repoId },
    select: {
      id: true,
      owner: true,
      name: true,
      fullName: true,
      htmlUrl: true,
      defaultBranch: true,
      createdAt: true,
      updatedAt: true,
      lastSyncedAt: true,
    },
  });

  if (!repo) {
    return null;
  }

  return {
    id: repo.id,
    owner: repo.owner,
    name: repo.name,
    fullName: repo.fullName,
    htmlUrl: repo.htmlUrl,
    defaultBranch: repo.defaultBranch,
    createdAt: repo.createdAt,
    updatedAt: repo.updatedAt,
    lastSyncedAt: repo.lastSyncedAt,
  };
}

// ----------------------------------------
// 2. Get Repository Contributors with Stats
// ----------------------------------------
async function getRepoContributors(repoId: string) {
  // Get all contributors for this repo via ContributorRepo join table
  const contributorRepos = await prisma.contributorRepo.findMany({
    where: { repoId },
    include: {
      contributor: true,
    },
  });

  const results = await Promise.all(
    contributorRepos.map(async (cr) => {
      const contributorId = cr.contributorId;

      // Count commits, PRs, and issues for this contributor in this repo
      const [totalCommits, totalPRs, totalIssues] = await Promise.all([
        prisma.commit.count({
          where: {
            repoId,
            contributorId,
          },
        }),
        prisma.pullRequest.count({
          where: {
            repoId,
            contributorId,
          },
        }),
        prisma.issue.count({
          where: {
            repoId,
            contributorId,
          },
        }),
      ]);

      return {
        id: cr.contributor.id,
        login: cr.contributor.login,
        avatarUrl: cr.contributor.avatarUrl,
        totalCommits,
        totalPRs,
        totalIssues,
      };
    })
  );

  return results;
}

// ----------------------------------------
// 3. Get Commit Timeline
// ----------------------------------------
async function getCommitTimeline(repoId: string) {
  const metrics = await prisma.metricsDaily.findMany({
    where: { repoId },
    select: {
      day: true,
      commitsCount: true,
      linesAdded: true,
      linesDeleted: true,
    },
    orderBy: {
      day: "asc",
    },
  });

  return metrics.map((m) => ({
    day: m.day.toISOString().split("T")[0], // Format as YYYY-MM-DD
    commits: m.commitsCount,
    additions: m.linesAdded,
    deletions: m.linesDeleted,
  }));
}

// ----------------------------------------
// 4. Get PR Timeline
// ----------------------------------------
async function getPRTimeline(repoId: string) {
  const metrics = await prisma.metricsDaily.findMany({
    where: { repoId },
    select: {
      day: true,
      prsOpened: true,
      prsMerged: true,
    },
    orderBy: {
      day: "asc",
    },
  });

  return metrics.map((m) => ({
    day: m.day.toISOString().split("T")[0], // Format as YYYY-MM-DD
    opened: m.prsOpened,
    merged: m.prsMerged,
  }));
}

// ----------------------------------------
// 5. Get Issue Timeline
// ----------------------------------------
async function getIssueTimeline(repoId: string) {
  const metrics = await prisma.metricsDaily.findMany({
    where: { repoId },
    select: {
      day: true,
      issuesOpened: true,
      issuesClosed: true,
    },
    orderBy: {
      day: "asc",
    },
  });

  return metrics.map((m) => ({
    day: m.day.toISOString().split("T")[0], // Format as YYYY-MM-DD
    opened: m.issuesOpened,
    closed: m.issuesClosed,
  }));
}

// ----------------------------------------
// 6. Get Hotspots (PRs with most changes)
// ----------------------------------------
async function getHotspots(repoId: string) {
  const prs = await prisma.pullRequest.findMany({
    where: { repoId },
    select: {
      id: true,
      number: true,
      title: true,
      additions: true,
      deletions: true,
      createdAt: true,
      mergedAt: true,
    },
    orderBy: [
      {
        additions: "desc",
      },
      {
        deletions: "desc",
      },
    ],
  });

  return prs
    .map((pr) => {
      const additions = pr.additions ?? 0;
      const deletions = pr.deletions ?? 0;
      const totalChanges = additions + deletions;

      return {
        prId: pr.id,
        number: pr.number,
        title: pr.title,
        additions,
        deletions,
        totalChanges,
        createdAt: pr.createdAt,
        mergedAt: pr.mergedAt,
      };
    })
    .sort((a, b) => b.totalChanges - a.totalChanges); // Sort descending by totalChanges
}

// ----------------------------------------
// 7. Get Contributor Stats
// ----------------------------------------
async function getContributorStats(repoId: string) {
  // Get all contributors for this repo
  const contributorRepos = await prisma.contributorRepo.findMany({
    where: { repoId },
    include: {
      contributor: true,
    },
  });

  // Get commit counts per contributor
  const commitCounts = await Promise.all(
    contributorRepos.map(async (cr) => {
      const count = await prisma.commit.count({
        where: {
          repoId,
          contributorId: cr.contributorId,
        },
      });
      return {
        contributorId: cr.contributorId,
        login: cr.contributor.login,
        avatarUrl: cr.contributor.avatarUrl,
        commitCount: count,
      };
    })
  );

  // Sort by commit count descending
  const topCommitters = commitCounts
    .sort((a, b) => b.commitCount - a.commitCount)
    .map((c) => ({
      id: c.contributorId,
      login: c.login,
      avatarUrl: c.avatarUrl,
      commitCount: c.commitCount,
    }));

  // Get distinct days with commits
  const commits = await prisma.commit.findMany({
    where: { repoId },
    select: {
      committedAt: true,
    },
  });

  const distinctDays = new Set(
    commits.map((c) => c.committedAt.toISOString().split("T")[0])
  );
  const activeDays = distinctDays.size;

  // Calculate inactive periods (simplified - days with no commits)
  // For now, return empty array as placeholder
  const inactivePeriods: Array<{ start: string; end: string }> = [];

  return {
    topCommitters,
    topReviewers: [], // Placeholder for now
    activeDays,
    inactivePeriods,
  };
}

// ----------------------------------------
// 8. Get Daily Metrics
// ----------------------------------------
async function getDailyMetrics(repoId: string) {
  const metrics = await prisma.metricsDaily.findMany({
    where: { repoId },
    select: {
      day: true,
      commitsCount: true,
      prsOpened: true,
      prsMerged: true,
      issuesOpened: true,
      issuesClosed: true,
      linesAdded: true,
      linesDeleted: true,
    },
    orderBy: {
      day: "asc",
    },
  });

  return metrics.map((m) => ({
    day: m.day.toISOString().split("T")[0], // Format as YYYY-MM-DD
    commitsCount: m.commitsCount,
    prsOpened: m.prsOpened,
    prsMerged: m.prsMerged,
    issuesOpened: m.issuesOpened,
    issuesClosed: m.issuesClosed,
    linesAdded: m.linesAdded,
    linesDeleted: m.linesDeleted,
  }));
}

// ----------------------------------------
// Export all functions
// ----------------------------------------
export {
  getRepoBasicInfo,
  getRepoContributors,
  getCommitTimeline,
  getPRTimeline,
  getIssueTimeline,
  getHotspots,
  getContributorStats,
  getDailyMetrics,
};

