import type {
  ResearchAgentRequest,
  ResearchOutput,
  ResearchTokenUsage,
} from '../../../src/types/agent2.js';

export class Agent1NotConfiguredError extends Error {
  constructor() {
    super('Research Agent 1 is not connected. Set AGENT1_API_URL when Person 2 provides its API.');
    this.name = 'Agent1NotConfiguredError';
  }
}

export type Agent1Output = {
  research: ResearchOutput;
  model: string | null;
  usage: ResearchTokenUsage | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function asStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function parseSources(value: unknown): ResearchOutput['sources'] | null {
  if (!Array.isArray(value)) return null;
  const sources: ResearchOutput['sources'] = [];
  for (const item of value) {
    if (!isRecord(item) || typeof item.url !== 'string') return null;
    try {
      const url = new URL(item.url);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
      sources.push({ title: typeof item.title === 'string' ? item.title : null, url: url.toString() });
    } catch {
      return null;
    }
  }
  return sources;
}

function parseOutput(value: unknown): Agent1Output | null {
  if (!isRecord(value)) return null;
  const keyFindings = value.keyFindings;
  const deadlines = value.deadlines;
  const sources = parseSources(value.sources);

  if (
    typeof value.title !== 'string' ||
    typeof value.executiveSummary !== 'string' ||
    !Array.isArray(keyFindings) ||
    !keyFindings.every(
      (finding) =>
        isRecord(finding) &&
        typeof finding.title === 'string' &&
        typeof finding.detail === 'string'
    ) ||
    !asStringArray(value.eligibilityCriteria) ||
    !Array.isArray(deadlines) ||
    !deadlines.every(
      (deadline) =>
        isRecord(deadline) &&
        typeof deadline.name === 'string' &&
        typeof deadline.date === 'string' &&
        typeof deadline.detail === 'string'
    ) ||
    !asStringArray(value.uncertainInformation) ||
    !sources
  ) {
    return null;
  }

  const usage = isRecord(value.usage) ? value.usage : null;
  const promptTokens =
    usage && typeof usage.promptTokens === 'number' && Number.isInteger(usage.promptTokens) && usage.promptTokens >= 0
      ? usage.promptTokens
      : undefined;
  const responseTokens =
    usage && typeof usage.responseTokens === 'number' && Number.isInteger(usage.responseTokens) && usage.responseTokens >= 0
      ? usage.responseTokens
      : undefined;
  const totalTokens =
    usage && typeof usage.totalTokens === 'number' && Number.isInteger(usage.totalTokens) && usage.totalTokens >= 0
      ? usage.totalTokens
      : undefined;
  const tokenUsage =
    promptTokens !== undefined || responseTokens !== undefined || totalTokens !== undefined
      ? { promptTokens, responseTokens, totalTokens }
      : null;

  return {
    research: {
      title: value.title,
      executiveSummary: value.executiveSummary,
      keyFindings,
      eligibilityCriteria: value.eligibilityCriteria,
      deadlines,
      uncertainInformation: value.uncertainInformation,
      sources,
    },
    model: typeof value.model === 'string' ? value.model : null,
    usage: tokenUsage,
  };
}

export async function runAgent1(input: ResearchAgentRequest): Promise<Agent1Output> {
  const endpoint = process.env.AGENT1_API_URL?.trim();
  if (!endpoint) throw new Agent1NotConfiguredError();

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const apiKey = process.env.AGENT1_API_KEY?.trim();
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(90_000),
    });
  } catch {
    throw new Error('Research Agent 1 could not be reached.');
  }

  if (!response.ok) {
    throw new Error(`Research Agent 1 returned HTTP ${response.status}.`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Research Agent 1 returned invalid JSON.');
  }
  const output = parseOutput(payload);
  if (!output) {
    throw new Error('Research Agent 1 response does not match the documented adapter contract.');
  }

  return output;
}
