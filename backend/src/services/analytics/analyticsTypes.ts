export interface RepoAnalyticsBase {
    healthScore: number;
    dimensions: Array<{ key: string; label: string; score: number }>;
    hotspots: Array<{ path: string; score: number; commits: number; issues: number }>;
    timeline: Array<{
      day: string;
      commits: number;
      prsOpened: number;
      prsMerged: number;
      issuesOpened: number;
      issuesClosed: number;
    }>;
    contributors: Array<{
      id: string;
      login: string;
      commits: number;
      prs: number;
      issues: number;
    }>;
  }
  