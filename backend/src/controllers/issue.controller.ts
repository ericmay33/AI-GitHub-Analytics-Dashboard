import { Request, Response } from "express";

export const getIssues = async (req: Request, res: Response) => {
  return res.status(501).json({ message: "Not implemented yet" });
};
