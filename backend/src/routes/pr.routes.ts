import { Router } from "express";
import * as prController from "../controllers/pr.controller";

const router = Router();

// List PRs for a repo
router.get("/repo/:repoId", prController.getPullRequests);

// Get details for a specific PR
router.get("/:prId", prController.getPullRequestById);

// Generate an AI summary for the PR
router.post("/:prId/summarize", prController.generatePRSummary);

export default router;
