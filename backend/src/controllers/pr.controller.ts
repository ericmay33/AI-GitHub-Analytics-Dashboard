import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { generatePRSummary as aiGeneratePRSummary } from "../services/ai/aiPrSummary.service";

export const getPullRequests = async (req: Request, res: Response) => {};

export const getPullRequestById = async (req: Request, res: Response) => {};

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
