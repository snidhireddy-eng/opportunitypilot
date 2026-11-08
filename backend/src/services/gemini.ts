import { GoogleGenAI, type Schema } from '@google/genai';
import type { ResearchGrounding, ResearchSource } from '../../../src/types/agent2.js';

export type GeminiUsage = {
  promptTokens?: number;
  responseTokens?: number;
  totalTokens?: number;
};

export type GeminiResult = {
  text: string;
  sources: ResearchSource[];
  grounding: ResearchGrounding;
  usage: GeminiUsage | null;
  model: string;
  executionMs: number;
};

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('Gemini is not configured. Set GEMINI_API_KEY in the backend environment.');
  }

  client ??= new GoogleGenAI({ apiKey });
  return client;
}

function getModel(): string {
  return process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';
}

export async function generateGeminiContent(
  prompt: string,
  options: { useGoogleSearch?: boolean; responseSchema?: Schema } = {}
): Promise<GeminiResult> {
  const model = getModel();
  const startedAt = performance.now();
  const response = await getClient().models.generateContent({
    model,
    contents: prompt,
    config: {
      ...(options.useGoogleSearch ? { tools: [{ googleSearch: {} }] } : {}),
      ...(options.responseSchema
        ? { responseMimeType: 'application/json', responseSchema: options.responseSchema }
        : {}),
    },
  });
  const executionMs = Math.round(performance.now() - startedAt);
  const candidate = response.candidates?.[0];
  const groundingMetadata = candidate?.groundingMetadata;
  const sources = (groundingMetadata?.groundingChunks ?? []).flatMap((chunk, index) => {
    if (!chunk.web?.uri) return [];
    try {
      const url = new URL(chunk.web.uri);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') return [];
      return [
        {
          title: chunk.web.title ?? null,
          url: url.toString(),
          groundingChunkIndex: index,
        },
      ];
    } catch {
      return [];
    }
  });
  const grounding: ResearchGrounding = {
    webSearchQueries: groundingMetadata?.webSearchQueries ?? [],
    supports: (groundingMetadata?.groundingSupports ?? []).map((support) => ({
      text: support.segment?.text ?? null,
      sourceIndices: support.groundingChunkIndices ?? [],
      confidenceScores: support.confidenceScores ?? [],
    })),
  };
  const usageMetadata = response.usageMetadata;

  if (!response.text) {
    throw new Error('Gemini returned an empty response.');
  }

  return {
    text: response.text,
    sources,
    grounding,
    usage: usageMetadata
      ? {
          ...(usageMetadata.promptTokenCount !== undefined
            ? { promptTokens: usageMetadata.promptTokenCount }
            : {}),
          ...(usageMetadata.candidatesTokenCount !== undefined
            ? { responseTokens: usageMetadata.candidatesTokenCount }
            : {}),
          ...(usageMetadata.totalTokenCount !== undefined
            ? { totalTokens: usageMetadata.totalTokenCount }
            : {}),
        }
      : null,
    model,
    executionMs,
  };
}
