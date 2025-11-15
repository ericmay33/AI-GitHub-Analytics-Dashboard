import axios, { AxiosError } from "axios";
import { ENV } from "../../config/env";

// -----------------------------------------------
// Create Axios Instance for GitHub API
// -----------------------------------------------
const client = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Authorization: `Bearer ${ENV.GITHUB_TOKEN}`,
    "User-Agent": "AI-GitHub-Analytics-Dashboard",
    Accept: "application/vnd.github+json",
  },
  timeout: 15000,
});

// -----------------------------------------------
// Centralized GitHub Request Handler
// -----------------------------------------------
async function safeGithubRequest<T>(fn: () => Promise<{ data: T }>): Promise<T> {
  try {
    const response = await fn();
    return response.data;
  } catch (err) {
    const error = err as AxiosError;

    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        throw new Error(
          "GitHub API Unauthorized — check your GITHUB_TOKEN"
        );
      }

      if (status === 403) {
        throw new Error(
          "GitHub API rate limit exceeded — try again later"
        );
      }

      if (status === 404) {
        throw new Error("GitHub repo or resource not found");
      }

      throw new Error(
        `GitHub API Error (${status}): ${
          JSON.stringify(error.response.data) || "Unknown error"
        }`
      );
    }

    // Network / Axios error
    throw new Error(`GitHub request failed: ${error.message}`);
  }
}

// -----------------------------------------------
// Simple GET Wrapper
// -----------------------------------------------
export async function githubGet<T>(
  path: string,
  params?: Record<string, any>
): Promise<T> {
  return safeGithubRequest<T>(() => client.get(path, { params }));
}

// -----------------------------------------------
// Pagination Wrapper — handles GitHub pagination
// -----------------------------------------------
export async function githubPaginate<T>(path: string, params: Record<string, any> = {}): Promise<T[]> {
  const results: T[] = [];
  let page = 1;

  while (true) {
    const pageData = await safeGithubRequest<T[]>(() =>
      client.get(path, {
        params: { ...params, per_page: 100, page },
      })
    );

    if (!pageData || pageData.length === 0) break;

    results.push(...pageData);
    page++;
  }

  return results;
}

export const githubClient = client;
