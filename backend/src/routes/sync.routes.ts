import { Router } from "express";
import * as syncController from "../controllers/sync.controller";

const router = Router();

router.post("/", syncController.syncRepository);

export default router;
