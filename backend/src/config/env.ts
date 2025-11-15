import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || "4000", 10),
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || ""
};
