import { Request, Response } from "express";
import { ingestRepository } from "../services/ingestion/repoIngestion.service";

export const addRepository = async (req: Request, res: Response) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ message: "repoUrl is required" });
    }

    const repo = await ingestRepository(repoUrl);
    return res.status(200).json(repo);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};


export const syncRepository = async (req: Request, res: Response) => {
  return res.status(501).json({ message: "Not implemented yet" });
};

export const getRepositories = async (req: Request, res: Response) => {
  return res.status(501).json({ message: "Not implemented yet" });
};

export const getRepositoryOverview = async (req: Request, res: Response) => {
  return res.status(501).json({ message: "Not implemented yet" });
};
