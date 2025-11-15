export function parseRepoUrl(url: string): { owner: string; name: string } {
  try {
    const cleaned = url.replace(/\/$/, "");
    const parts = cleaned.split("github.com/")[1].split("/");

    const owner = parts[0];
    const name = parts[1];

    if (!owner || !name) {
      throw new Error("Invalid GitHub repository URL");
    }

    return { owner, name };
  } catch (e) {
    throw new Error("Failed to parse GitHub repository URL");
  }
}
