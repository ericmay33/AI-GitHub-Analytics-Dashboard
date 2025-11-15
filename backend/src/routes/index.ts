import { Router } from "express";
import repoRoutes from "./repo.routes";
import prRoutes from "./pr.routes";
import issueRoutes from "./issue.routes";
import syncRoutes from "./sync.routes";

const router = Router();

router.use("/repos", repoRoutes);
router.use("/prs", prRoutes);
router.use("/issues", issueRoutes);
router.use("/sync", syncRoutes);'

export default router;
