import { Router } from "express";
import * as repoController from "../controllers/repo.controller";

const router = Router();

router.get("/", repoController.getRepositories);
router.get("/:repoId", repoController.getRepositoryOverview);
router.get("/:repoId/analytics", repoController.getRepositoryAnalytics);

export default router;
