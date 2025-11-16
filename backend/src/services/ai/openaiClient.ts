import Groq from "groq-sdk";
import { ENV } from "../../config/env";

// ----------------------------------------
// Create Groq Client
// ----------------------------------------
export const groq = new Groq({
  apiKey: ENV.GROQ_API_KEY,
});

// ----------------------------------------
// Generic LLM TEXT helper (chat-based)
// ----------------------------------------
export async function generateText({
  system,
  user,
  model = "llama-3.3-70b-versatile",
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

  const response = await groq.chat.completions.create({
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
  model = "llama-3.3-70b-versatile",
}: {
  system?: string;
  user: string;
  schema?: any; // keep param for future if you want, or remove
  model?: string;
}): Promise<T> {
  const messages: Array<{ role: "system" | "user"; content: string }> = [];
  if (system) {
    messages.push({ role: "system", content: system });
  }
  
  // Add JSON mode instruction to user prompt
  const userPromptWithJson = `${user}\n\nReturn ONLY a single valid JSON object. No extra text, no code fences, no explanation.`;
  messages.push({ role: "user", content: userPromptWithJson });

  // Groq supports OpenAI-compatible API, but response_format may not be supported
  // We rely on prompt instructions for JSON output
  const response = await groq.chat.completions.create({
    model,
    messages,
    temperature: 0.3,
  });

  const text = response.choices[0].message.content;
  if (!text) {
    throw new Error("Groq returned empty structured output");
  }

  try {
    // Clean up the response - remove markdown code fences if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    
    return JSON.parse(cleanedText) as T;
  } catch (err: any) {
    console.error("Failed to parse JSON from Groq:", text);
    throw new Error("Failed to parse structured JSON: " + err.message);
  }
}

