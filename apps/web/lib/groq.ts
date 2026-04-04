import Groq from "groq-sdk";

let groq: Groq | null = null;

function getGroqClient(): Groq {
  if (groq) return groq;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    // Only throw if we are NOT in the build process
    if (process.env.NODE_ENV === "production" && !process.env.CI) {
        throw new Error("Missing GROQ_API_KEY");
    }
    // Fallback for build time
    return new Groq({ apiKey: "placeholder" });
  }

  groq = new Groq({
    apiKey: apiKey,
  });
  return groq;
}

export async function getChatCompletion(
  systemPrompt: string,
  userMessage: string,
  model: string = "llama-3.3-70b-versatile"
): Promise<string> {
  const client = getGroqClient();
  const completion = await client.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    model: model,
    temperature: 0.7,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content || "I am unable to generate a response at this time.";
}
