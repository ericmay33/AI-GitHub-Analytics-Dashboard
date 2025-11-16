// Type definitions for API responses

export interface Repository {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  htmlUrl: string;
  lastSyncedAt: string | null;
  createdAt: string;
  hasAnalytics?: boolean;
}

export interface RepositoryOverview {
  repo: {
    id: string;
    owner: string;
    name: string;
    fullName: string;
    htmlUrl: string;
    defaultBranch: string | null;
    createdAt: string;
    updatedAt: string;
    lastSyncedAt: string | null;
  };
  recentMetrics: Array<{
    day: string;
    commitsCount: number;
    prsOpened: number;
    prsMerged: number;
    issuesOpened: number;
    issuesClosed: number;
    linesAdded: number;
    linesDeleted: number;
  }>;
  topContributors: Array<{
    id: string;
    login: string;
    avatarUrl: string | null;
    commitCount: number;
  }>;
}

export interface Contributor {
  id: string;
  login: string;
  avatarUrl: string | null;
  htmlUrl?: string;
  totalCommits?: number;
  totalPRs?: number;
  totalIssues?: number;
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  additions: number | null;
  deletions: number | null;
  changedFiles: number | null;
  createdAt: string;
  mergedAt: string | null;
  closedAt: string | null;
  repoId: string;
  contributorId: string | null;
  repository?: {
    id: string;
    owner: string;
    name: string;
    fullName: string;
    htmlUrl: string;
  };
  contributor?: {
    id: string;
    login: string;
    avatarUrl: string | null;
    htmlUrl?: string;
  };
  aiSummary?: {
    id: string;
    summary: string;
    metadata: any;
    createdAt: string;
  } | null;
}

export interface PullRequestListResponse {
  pullRequests: PullRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Issue {
  id: string;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  createdAt: string;
  closedAt: string | null;
  repoId: string;
  contributorId: string | null;
  contributor?: {
    id: string;
    login: string;
    avatarUrl: string | null;
  };
}

export interface IssueListResponse {
  issues: Issue[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SyncRepositoryRequest {
  repoUrl: string;
}

export interface SyncRepositoryResponse {
  message: string;
  result: {
    repoId: string;
    contributors: number;
    commits: number;
    prs: number;
    issues: number;
    metrics: any;
  };
}

export interface FullRepositoryAnalytics {
  repo: {
    id: string;
    owner: string;
    name: string;
    fullName: string;
    htmlUrl: string;
    defaultBranch: string | null;
    createdAt: string;
    updatedAt: string;
    lastSyncedAt: string | null;
  };
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
  contributors: Array<{
    id: string;
    login: string;
    avatarUrl: string | null;
    totalCommits: number;
    totalPRs: number;
    totalIssues: number;
  }>;
  timeline: {
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
  };
  hotspots: Array<{
    prId: string;
    number: number;
    title: string;
    additions: number;
    deletions: number;
    totalChanges: number;
    createdAt: string;
    mergedAt: string | null;
  }>;
  quality: {
    totalCommits: number;
    totalPRsOpened: number;
    totalPRsMerged: number;
    prMergeRate: number;
    totalIssuesOpened: number;
    totalIssuesClosed: number;
    issueCloseRate: number;
    activeDays: number;
    totalContributors: number;
  };
  ai: {
    repoAnalysis: {
      healthScore: number;
      riskLevel: 'low' | 'medium' | 'high';
      summary: string;
      strengths: string[];
      weaknesses: string[];
      hotspots: Array<{ file: string; churn: number }>;
      contributorInsights: string[];
      recommendations: string[];
    };
    weeklyReport: {
      highlights: string[];
      keyPRs: Array<{ id: string; title: string }>;
      keyIssues: Array<{ id: string; title: string }>;
      activeContributors: string[];
      riskAlerts: string[];
      velocitySummary: string;
      suggestedNextSteps: string[];
    };
  };
}

export interface PRSummaryResponse {
  message: string;
  summary: {
    id: string;
    summary: string;
    metadata: any;
    createdAt: string;
  };
}

