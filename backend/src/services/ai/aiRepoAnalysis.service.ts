import { RepoAnalyticsBase } from "../analytics/analyticsTypes";

export async function generateAIRepoAnalysis(repoId: string, base: RepoAnalyticsBase) {
  return {
    summary: "",
    risks: [],
    strengths: [],
    recommendedActions: [],
  };
}
