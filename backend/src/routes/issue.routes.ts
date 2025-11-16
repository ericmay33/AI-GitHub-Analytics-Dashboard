import { Router } from "express";
import * as issueController from "../controllers/issue.controller";

const router = Router();

router.get("/repo/:repoId", issueController.getIssues);

export default router;
