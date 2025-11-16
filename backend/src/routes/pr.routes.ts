import { Router } from "express";
import * as prController from "../controllers/pr.controller";

const router = Router();

router.get("/repo/:repoId", prController.getPullRequests);
router.get("/:prId", prController.getPullRequestById);
router.post("/:prId/summarize", prController.generatePRSummary);

export default router;
