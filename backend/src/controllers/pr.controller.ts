import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { generatePRSummary as aiGeneratePRSummary } from "../services/ai/aiPrSummary.service";

// ----------------------------------------
// GET /api/prs/repo/:repoId
// List pull requests for a repository
// ----------------------------------------
export const getPullRequests = async (req: Request, res: Response) => {
  try {
    const { repoId } = req.params;

    if (!repoId) {
      return res.status(400).json({ error: "Repository ID is required" });
    }

    // Parse query parameters for pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Optional state filter
    const state = req.query.state as string | undefined;

    const where: any = { repoId };
    if (state && (state === "open" || state === "closed")) {
      where.state = state;
    }

    // Fetch PRs with contributor info
    const [pullRequests, total] = await Promise.all([
      prisma.pullRequest.findMany({
        where,
        include: {
          contributor: {
            select: {
              id: true,
              login: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.pullRequest.count({ where }),
    ]);

    return res.status(200).json({
      pullRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error("Error fetching pull requests:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch pull requests" });
  }
};

// ----------------------------------------
// GET /api/prs/:prId
// Get single pull request details
// ----------------------------------------
export const getPullRequestById = async (req: Request, res: Response) => {
  try {
    const { prId } = req.params;

    if (!prId) {
      return res.status(400).json({ error: "Pull Request ID is required" });
    }

    const pullRequest = await prisma.pullRequest.findUnique({
      where: { id: prId },
      include: {
        repository: {
          select: {
            id: true,
            owner: true,
            name: true,
            fullName: true,
            htmlUrl: true,
          },
        },
        contributor: {
          select: {
            id: true,
            login: true,
            avatarUrl: true,
            htmlUrl: true,
          },
        },
        aiSummary: {
          select: {
            id: true,
            summary: true,
            metadata: true,
            createdAt: true,
          },
        },
      },
    });

    if (!pullRequest) {
      return res.status(404).json({ error: "Pull Request not found" });
    }

    return res.status(200).json(pullRequest);
  } catch (err: any) {
    console.error("Error fetching pull request:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch pull request" });
  }
};

export const generatePRSummary = async (req: Request, res: Response) => {
  try {
    const { prId } = req.params;

    if (!prId) {
      return res.status(400).json({ error: "PR ID is required" });
    }

    const pr = await prisma.pullRequest.findUnique({ where: { id: prId } });
    if (!pr) {
      return res.status(404).json({ error: "Pull Request not found" });
    }

    const summary = await aiGeneratePRSummary(prId);

    return res.status(200).json({
      message: "PR summary generated successfully",
      summary,
    });
  } catch (err: any) {
    console.error("PR Summary Error:", err.message);
    return res.status(500).json({
      error: "Failed to generate PR summary",
      details: err.message,
    });
  }
};
