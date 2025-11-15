import { Router } from "express";
import * as repoController from "../controllers/repo.controller";

const router = Router();

// Add a new repo and trigger initial sync
router.post("/", repoController.addRepository);

// Manually sync a repo
router.post("/:id/sync", repoController.syncRepository);

// Get list of repos
router.get("/", repoController.getRepositories);

// Get repo overview
router.get("/:id", repoController.getRepositoryOverview);

export default router;
