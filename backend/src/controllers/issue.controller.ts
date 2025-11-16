import { Request, Response } from "express";
import { prisma } from "../prisma/client";

// ----------------------------------------
// GET /api/issues/repo/:repoId
// List issues for a repository
// ----------------------------------------
export const getIssues = async (req: Request, res: Response) => {
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

    // Fetch issues with contributor info
    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
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
      prisma.issue.count({ where }),
    ]);

    return res.status(200).json({
      issues,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error("Error fetching issues:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch issues" });
  }
};
