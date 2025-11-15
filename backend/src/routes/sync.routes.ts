import { Router } from "express";
import { syncRepository } from "../controllers/sync.controller";

const router = Router();

router.post("/", syncRepository);

export default router;
