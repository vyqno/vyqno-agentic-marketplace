import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEmbedding } from "./embeddings";
import { getChatCompletion, getChatCompletionStream } from "./groq";

let supabaseClient: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
    if (supabaseClient) return supabaseClient;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        // Only throw if NOT in build mode
        if (process.env.NODE_ENV === "production" && !process.env.CI) {
            throw new Error("Missing Supabase environment variables");
        }
        // Placeholder for build time analysis
        return createClient(
            "https://placeholder-url.supabase.co",
            "placeholder-key"
        );
    }

    supabaseClient = createClient(url, key);
    return supabaseClient;
}

export async function runAgentQuery(
    agentId: string,
    agentName: string,
    agentDescription: string,
    question: string
): Promise<string> {
    const supabase = getSupabase();
    const embedding = await getEmbedding(question);

    const { data: memories, error } = await supabase.rpc("match_agent_memories", {
        query_embedding: embedding,
        filter_agent_id: agentId,
        match_count: 5,
    });

    if (error) {
        console.error("Error fetching memories:", error);
    }

    const context = memories?.map((m: any) => m.content).join("\n\n") || "None provided.";

    const systemPrompt = `You are a specialized AI agent named @${agentName}.
You belong to the AgentNet decentralized economy.

Your Core Identity:
${agentDescription}

Provided Context (RAG):
The following information was retrieved from your private knowledge base to help you answer the user's specific request.
---
${context}
---

Instructions:
- Use the context if relevant, but remain conversational and maintain your persona.
- Keep the response professional yet technically sharp.
- If you don't know the answer, admit it and offer to search further.
- Format your response clearly using markdown.
`;

    return getChatCompletion(systemPrompt, question);
}

export async function streamAgentQuery(
    agentId: string,
    agentName: string,
    agentDescription: string,
    question: string
): Promise<ReadableStream<string>> {
    const supabase = getSupabase();
    const embedding = await getEmbedding(question);

    const { data: memories, error } = await supabase.rpc("match_agent_memories", {
        query_embedding: embedding,
        filter_agent_id: agentId,
        match_count: 5,
    });

    if (error) {
        console.error("Error fetching memories:", error);
    }

    const context = memories?.map((m: any) => m.content).join("\n\n") || "None provided.";

    const systemPrompt = `You are a specialized AI agent named @${agentName}.
You belong to the AgentNet decentralized economy.

Your Core Identity:
${agentDescription}

Provided Context (RAG):
The following information was retrieved from your private knowledge base to help you answer the user's specific request.
---
${context}
---

Instructions:
- Use the context if relevant, but remain conversational and maintain your persona.
- Keep the response professional yet technically sharp.
- If you don't know the answer, admit it and offer to search further.
- Format your response clearly using markdown.
`;

    return getChatCompletionStream(systemPrompt, question);
}

export async function seedAgentMemory(
    agentId: string,
    content: string,
    source: string = "Initial Seed"
) {
    const supabase = getSupabase();
    // Simple chunking strategy (e.g., 500 chars)
    const chunkSize = 500;
    const overlap = 50;
    const chunks: string[] = [];

    for (let i = 0; i < content.length; i += chunkSize - overlap) {
        chunks.push(content.slice(i, i + chunkSize));
    }

    const memoryEntries = await Promise.all(
        chunks.map(async (chunk) => {
            const embedding = await getEmbedding(chunk);
            return {
                agent_id: agentId,
                content: chunk,
                embedding: embedding,
                source: source,
                access: "public",
            };
        })
    );

    const { error } = await supabase.from("agent_memories").insert(memoryEntries);

    if (error) throw error;
    return chunks.length;
}
