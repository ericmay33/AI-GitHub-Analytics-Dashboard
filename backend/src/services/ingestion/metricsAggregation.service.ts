import { prisma } from "../../prisma/client";

// --------------------------------------------------------
// Generate daily metrics for a repo
// --------------------------------------------------------
export async function aggregateDailyMetrics(repoId: string) {
  // 1. Fetch commits, PRs, and issues for this repo
  const [commits, prs, issues] = await Promise.all([
    prisma.commit.findMany({
      where: { repoId },
      select: {
        committedAt: true,
        additions: true,
        deletions: true,
      },
    }),

    prisma.pullRequest.findMany({
      where: { repoId },
      select: {
        createdAt: true,
        mergedAt: true,
      },
    }),

    prisma.issue.findMany({
      where: { repoId },
      select: {
        createdAt: true,
        closedAt: true,
      },
    }),
  ]);

  // Helper: Convert a Date → YYYY-MM-DD key
  const dayKey = (d: Date) => d.toISOString().split("T")[0];

  // Storage map
  const days: Record<string, any> = {};

  // -----------------------------------------------------
  // Process commits
  // -----------------------------------------------------
  for (const c of commits) {
    const key = dayKey(c.committedAt);
    if (!days[key]) days[key] = baseDay();

    days[key].commitsCount += 1;
    days[key].linesAdded += c.additions ?? 0;
    days[key].linesDeleted += c.deletions ?? 0;
  }

  // -----------------------------------------------------
  // Process PRs
  // -----------------------------------------------------
  for (const pr of prs) {
    const openedKey = dayKey(pr.createdAt);
    if (!days[openedKey]) days[openedKey] = baseDay();
    days[openedKey].prsOpened += 1;

    if (pr.mergedAt) {
      const mergedKey = dayKey(pr.mergedAt);
      if (!days[mergedKey]) days[mergedKey] = baseDay();
      days[mergedKey].prsMerged += 1;
    }
  }

  // -----------------------------------------------------
  // Process Issues
  // -----------------------------------------------------
  for (const iss of issues) {
    const openedKey = dayKey(iss.createdAt);
    if (!days[openedKey]) days[openedKey] = baseDay();
    days[openedKey].issuesOpened += 1;

    if (iss.closedAt) {
      const closedKey = dayKey(iss.closedAt);
      if (!days[closedKey]) days[closedKey] = baseDay();
      days[closedKey].issuesClosed += 1;
    }
  }

  // -----------------------------------------------------
  // Flush to DB (upsert each day)
  // -----------------------------------------------------
  const upserts = Object.entries(days).map(([date, values]) =>
    prisma.metricsDaily.upsert({
      where: {
        repoId_day: {
          repoId,
          day: new Date(date),
        },
      },
      update: values,
      create: {
        repoId,
        day: new Date(date),
        ...values
      },
    })
  );

  await Promise.all(upserts);

  return { updatedDays: Object.keys(days).length };
}

// Base daily metrics object
function baseDay() {
  return {
    commitsCount: 0,
    prsOpened: 0,
    prsMerged: 0,
    issuesOpened: 0,
    issuesClosed: 0,
    linesAdded: 0,
    linesDeleted: 0,
    anomalies: null, // reserved for later AI-inferred anomalies
  };
}
