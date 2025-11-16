import { prisma } from "../../prisma/client";
import { generateStructured } from "./openaiClient";

// -------------------------------
// PR SUMMARY SCHEMA (our fields)
// -------------------------------
interface PRSummaryAIOutput {
  summary: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  complexity: number; // 1–10
  keyChanges: string[];
  affectedAreas: string[];
  recommendedTests: string[];
  reviewerNotes: string;
}

// -------------------------------
// Generate AI Summary for PR
// -------------------------------
export async function generatePRSummary(prId: string): Promise<PRSummaryAIOutput> {
  // 1. Load PR from DB
  const pr = await prisma.pullRequest.findUnique({
    where: { id: prId },
    include: {
      repository: true,
      contributor: true,
    },
  });

  if (!pr) {
    throw new Error("PR not found");
  }

  // Prepare context for LLM
  const repoName = pr.repository.fullName;
  const author = pr.contributor?.login ?? "Unknown";
  const diffStats = `
Additions: ${pr.additions ?? 0}
Deletions: ${pr.deletions ?? 0}
Changed Files: ${pr.changedFiles ?? 0}
`;

  // -------------------------------
  // Build AI prompt
  // -------------------------------
  const systemPrompt = `
You are an expert senior software engineer reviewing GitHub pull requests.
Your job is to summarize the PR and generate useful engineering insights for reviewers.

Return ONLY valid JSON.
`;

  const userPrompt = `
Repository: ${repoName}
PR #${pr.number}
Author: ${author}

Title:
${pr.title}

Description:
${pr.body ?? "(no description)"}

Diff Stats:
${diffStats}

Generate:
- High-quality summary (2–4 sentences)
- Risk level (LOW, MEDIUM, HIGH)
- Complexity score (1–10)
- Key changes (bullet list)
- Affected areas or modules
- Recommended test cases
- Reviewer notes
`;

  // -------------------------------
  // Call OpenAI
  // -------------------------------
  const aiOutput = await generateStructured<PRSummaryAIOutput>({
    system: systemPrompt,
    user: userPrompt,
  });

  // -------------------------------
  // Upsert into AISummary table
  // -------------------------------
  await prisma.aISummary.upsert({
    where: {
      prId: pr.id,
    },
    update: {
      entityType: "PR",
      summary: aiOutput.summary,
      metadata: {
        riskLevel: aiOutput.riskLevel,
        complexity: aiOutput.complexity,
        keyChanges: aiOutput.keyChanges,
        affectedAreas: aiOutput.affectedAreas,
        recommendedTests: aiOutput.recommendedTests,
        reviewerNotes: aiOutput.reviewerNotes,
      },
    },
    create: {
      entityType: "PR",
      prId: pr.id,
      summary: aiOutput.summary,
      metadata: {
        riskLevel: aiOutput.riskLevel,
        complexity: aiOutput.complexity,
        keyChanges: aiOutput.keyChanges,
        affectedAreas: aiOutput.affectedAreas,
        recommendedTests: aiOutput.recommendedTests,
        reviewerNotes: aiOutput.reviewerNotes,
      },
    },
  });

  return aiOutput;
}
