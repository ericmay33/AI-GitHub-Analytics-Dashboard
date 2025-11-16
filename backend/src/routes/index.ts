import { Router } from "express";
import syncRoutes from "./sync.routes";
import repoRoutes from "./repo.routes";
import prRoutes from "./pr.routes";
import issueRoutes from "./issue.routes";

const router = Router();

router.use("/sync", syncRoutes);
router.use("/repos", repoRoutes);
router.use("/prs", prRoutes);
router.use("/issues", issueRoutes);

export default router;
