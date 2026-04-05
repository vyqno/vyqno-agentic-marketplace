// Generates embeddings via HuggingFace Inference API (router.huggingface.co)
// Requires HF_TOKEN env var. Falls back to null so RAG skips vector search gracefully.
export async function getEmbedding(text: string): Promise<number[] | null> {
  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) return null;

  try {
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${hfToken}`,
        },
        body: JSON.stringify({ inputs: text }),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return Array.isArray(data[0]) ? data[0] : data;
  } catch {
    return null;
  }
}
