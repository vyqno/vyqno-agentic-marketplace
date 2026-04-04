import { pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";

let extractor: FeatureExtractionPipeline | null = null;

export async function getEmbedding(text: string): Promise<number[]> {
  if (!extractor) {
    // Model: all-MiniLM-L6-v2 (384 dimensions)
    // We use the Xenova prefix as per @huggingface/transformers convention for ONNX models
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }

  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data as Float32Array);
}
