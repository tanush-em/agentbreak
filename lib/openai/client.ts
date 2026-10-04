import OpenAI from "openai";

export function isDemoMode(): boolean {
  return !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === "";
}

export function getOpenAIModel(): string {
  return process.env.OPENAI_MODEL || "gpt-4o-mini";
}

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI | null {
  if (isDemoMode()) return null;
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export async function chatCompletion(params: {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
}): Promise<{ content: string; demo: boolean }> {
  const openai = getOpenAIClient();
  if (!openai) {
    return { content: "", demo: true };
  }

  try {
    const response = await openai.chat.completions.create({
      model: getOpenAIModel(),
      temperature: params.temperature ?? 0.2,
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userPrompt },
      ],
    });

    return {
      content: response.choices[0]?.message?.content ?? "",
      demo: false,
    };
  } catch (error) {
    console.error("OpenAI request failed, falling back to demo mode:", error);
    return { content: "", demo: true };
  }
}
