import { Type, type Schema } from '@google/genai';
import type {
  ResearchAgentRequest,
  ResearchAgentResult,
  ResearchOutput,
} from '../../../src/types/agent2.js';
import { generateGeminiContent } from './gemini.js';

const researchSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    executiveSummary: { type: Type.STRING },
    keyFindings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          detail: { type: Type.STRING },
        },
        required: ['title', 'detail'],
      },
    },
    eligibilityCriteria: { type: Type.ARRAY, items: { type: Type.STRING } },
    deadlines: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          date: { type: Type.STRING },
          detail: { type: Type.STRING },
        },
        required: ['name', 'date', 'detail'],
      },
    },
    uncertainInformation: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [
    'title',
    'executiveSummary',
    'keyFindings',
    'eligibilityCriteria',
    'deadlines',
    'uncertainInformation',
  ],
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function parseStructuredResult(text: string): Omit<ResearchOutput, 'sources'> {
  const parsed: unknown = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Gemini returned an invalid structured research response.');
  }

  const value = parsed as Record<string, unknown>;
  if (
    !isNonEmptyString(value.title) ||
    !isNonEmptyString(value.executiveSummary) ||
    !Array.isArray(value.keyFindings) ||
    !value.keyFindings.every(
      (finding) =>
        finding &&
        typeof finding === 'object' &&
        isNonEmptyString((finding as Record<string, unknown>).title) &&
        isNonEmptyString((finding as Record<string, unknown>).detail)
    ) ||
    !Array.isArray(value.eligibilityCriteria) ||
    !value.eligibilityCriteria.every((item) => typeof item === 'string') ||
    !Array.isArray(value.deadlines) ||
    !value.deadlines.every(
      (deadline) =>
        deadline &&
        typeof deadline === 'object' &&
        isNonEmptyString((deadline as Record<string, unknown>).name) &&
        isNonEmptyString((deadline as Record<string, unknown>).date) &&
        isNonEmptyString((deadline as Record<string, unknown>).detail)
    ) ||
    !Array.isArray(value.uncertainInformation) ||
    !value.uncertainInformation.every((item) => typeof item === 'string')
  ) {
    throw new Error('Gemini returned research data that did not match the required format.');
  }

  return {
    title: value.title,
    executiveSummary: value.executiveSummary,
    keyFindings: value.keyFindings as ResearchOutput['keyFindings'],
    eligibilityCriteria: value.eligibilityCriteria as string[],
    deadlines: value.deadlines as ResearchOutput['deadlines'],
    uncertainInformation: value.uncertainInformation as string[],
  };
}

export async function runResearchAgent2(input: ResearchAgentRequest): Promise<ResearchAgentResult> {
  const prompt = [
    'Research the opportunity described below using current web sources.',
    'Return the requested JSON fields only.',
    'Report findings supported by sources. Do not invent facts, source names, URLs, or deadlines.',
    'For unknown information, use empty arrays and explain the uncertainty in uncertainInformation.',
    'Keep eligibility criteria and deadlines empty when not applicable or not verifiable.',
    '',
    `Research question: ${input.researchQuestion}`,
    `Opportunity category: ${input.opportunityCategory}`,
    `Target audience: ${input.targetAudience}`,
    `Additional requirements: ${input.additionalRequirements || 'None provided'}`,
  ].join('\n');

  const generated = await generateGeminiContent(prompt, {
    useGoogleSearch: true,
    responseSchema: researchSchema,
  });
  const structured = parseStructuredResult(generated.text);
  const sources = [...new Map(generated.sources.map((source) => [source.url, source])).values()];
  const uncertainInformation = [...structured.uncertainInformation];
  if (sources.length === 0) {
    uncertainInformation.push('No verifiable source links were returned by Google Search grounding.');
  }

  return {
    agent: 'agent2',
    ...structured,
    uncertainInformation,
    sources,
    status: sources.length > 0 ? 'completed' : 'partial',
    executionMs: generated.executionMs,
    model: generated.model,
    usage: generated.usage,
    grounding: generated.grounding,
  };
}
