import { Request, Response } from "express";
import { syncRepo } from "../services/sync/syncRepo.service";

export async function syncRepository(req: Request, res: Response) {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: "repoUrl is required" });
    }

    const result = await syncRepo(repoUrl);

    return res.json({
      message: "Repository synced successfully",
      result,
    });
  } catch (err: any) {
    console.error("Sync error:", err);
    return res.status(500).json({ error: err.message });
  }
}