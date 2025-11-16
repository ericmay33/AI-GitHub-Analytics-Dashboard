import OpenAI from "openai";
import { ENV } from "../../config/env";

// ----------------------------------------
// Create OpenAI Client
// ----------------------------------------
export const openai = new OpenAI({
  apiKey: ENV.OPENAI_API_KEY,
});

// ----------------------------------------
// Generic LLM TEXT helper (chat-based)
// ----------------------------------------
export async function generateText({
  system,
  user,
  model = "gpt-4.1-mini",
  temperature = 0.3,
}: {
  system?: string;
  user: string;
  model?: string;
  temperature?: number;
}) {
  const messages: Array<{ role: "system" | "user"; content: string }> = [];
  if (system) {
    messages.push({ role: "system", content: system });
  }
  messages.push({ role: "user", content: user });

  const response = await openai.chat.completions.create({
    model,
    temperature,
    messages,
  });

  return response.choices[0].message.content ?? "";
}

// ----------------------------------------
// Generic STRUCTURED JSON helper
// ----------------------------------------
export async function generateStructured<T>({
  system,
  user,
  model = "gpt-4.1-mini",
}: {
  system?: string;
  user: string;
  schema?: any; // keep param for future if you want, or remove
  model?: string;
}): Promise<T> {
  // Build a plain text prompt — NOT chat messages
  let prompt = "";
  if (system) prompt += `System:\n${system}\n\n`;
  prompt += `User:\n${user}\n\n`;
  prompt +=
    "Return ONLY a single valid JSON object. No extra text, no code fences, no explanation.";

  const response = await openai.responses.create({
    model,
    input: prompt,
  });

  const text = response.output_text;
  if (!text) {
    throw new Error("OpenAI returned empty structured output");
  }

  try {
    return JSON.parse(text) as T;
  } catch (err: any) {
    console.error("Failed to parse JSON from OpenAI:", text);
    throw new Error("Failed to parse structured JSON: " + err.message);
  }
}

