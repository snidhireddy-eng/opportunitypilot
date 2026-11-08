import type {
  AgentKey,
  AgentScore,
  BenchmarkAgentRun,
  BenchmarkRunResult,
  MetricKey,
} from '../../../src/types/benchmark.js';
import type {
  ResearchAgentRequest,
  ResearchOutput,
  ResearchTokenUsage,
} from '../../../src/types/agent2.js';
import { Agent1NotConfiguredError, runAgent1 } from './agent1Adapter.js';
import { runResearchAgent2 } from './researchAgent2.js';

const qualityMetricKeys: MetricKey[] = ['completeness', 'relevance', 'sourceQuality'];
const lowerIsBetter = new Set<MetricKey>(['responseTime', 'cost']);
const stopWords = new Set([
  'about', 'after', 'also', 'and', 'are', 'can', 'for', 'from', 'have', 'how', 'into',
  'its', 'more', 'need', 'opportunity', 'that', 'the', 'their', 'them', 'this', 'what',
  'when', 'where', 'which', 'with', 'your',
]);

type AgentPayload = {
  research: ResearchOutput;
  model: string | null;
  usage: ResearchTokenUsage | null;
};

type AgentAttempt = {
  key: AgentKey;
  name: string;
  tagline: string;
  execute: () => Promise<AgentPayload>;
  startTime: number;
};

export type BenchmarkAdapters = {
  agent1: (input: ResearchAgentRequest) => Promise<AgentPayload>;
  agent2: (input: ResearchAgentRequest) => Promise<AgentPayload>;
};

function termSet(text: string): Set<string> {
  return new Set(
    (text.toLocaleLowerCase().match(/[a-z0-9]{3,}/g) ?? []).filter((word) => !stopWords.has(word))
  );
}

function scoreCompleteness(output: ResearchOutput): number {
  const sections = [
    output.title.trim().length > 0,
    output.executiveSummary.trim().length > 0,
    output.keyFindings.length > 0,
    output.eligibilityCriteria.length > 0 || output.uncertainInformation.length > 0,
    output.deadlines.length > 0 || output.uncertainInformation.length > 0,
    output.sources.length > 0,
  ];
  return Math.round((sections.filter(Boolean).length / sections.length) * 100);
}

function scoreRelevance(request: ResearchAgentRequest, output: ResearchOutput): number | null {
  const expected = termSet(
    [
      request.researchQuestion,
      request.opportunityCategory,
      request.targetAudience,
      request.additionalRequirements ?? '',
    ].join(' ')
  );
  if (expected.size === 0) return null;

  const text = [
    output.title,
    output.executiveSummary,
    ...output.keyFindings.flatMap((finding) => [finding.title, finding.detail]),
    ...output.eligibilityCriteria,
    ...output.deadlines.flatMap((deadline) => [deadline.name, deadline.date, deadline.detail]),
  ].join(' ');
  const actual = termSet(text);
  const covered = [...expected].filter((term) => actual.has(term)).length;
  return Math.round((covered / expected.size) * 100);
}

function scoreSourceQuality(output: ResearchOutput): number {
  if (output.sources.length === 0) return 0;
  const auditable = output.sources.filter((source) => {
    if (!source.title?.trim()) return false;
    try {
      const url = new URL(source.url);
      return url.protocol === 'https:' && Boolean(url.hostname);
    } catch {
      return false;
    }
  }).length;
  return Math.round((auditable / output.sources.length) * 100);
}

function configuredPrice(name: string): number | null {
  const value = process.env[name]?.trim();
  if (!value) return null;
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : null;
}

function calculateCost(agent: AgentKey, usage: ResearchTokenUsage | null): number | null {
  if (usage?.promptTokens === undefined || usage.responseTokens === undefined) return null;
  const prefix = agent === 'alpha' ? 'AGENT1' : 'GEMINI';
  const inputPrice = configuredPrice(`${prefix}_INPUT_USD_PER_MILLION`);
  const outputPrice = configuredPrice(`${prefix}_OUTPUT_USD_PER_MILLION`);
  if (inputPrice === null || outputPrice === null) return null;
  return (usage.promptTokens * inputPrice + usage.responseTokens * outputPrice) / 1_000_000;
}

function buildScores(
  request: ResearchAgentRequest,
  output: ResearchOutput | null,
  executionMs: number | null,
  usage: ResearchTokenUsage | null,
  key: AgentKey
): AgentScore[] {
  return [
    { metric: 'accuracy', score: null, unit: '/100' },
    {
      metric: 'completeness',
      score: output ? scoreCompleteness(output) : null,
      unit: '/100',
    },
    {
      metric: 'relevance',
      score: output ? scoreRelevance(request, output) : null,
      unit: '/100',
    },
    {
      metric: 'sourceQuality',
      score: output ? scoreSourceQuality(output) : null,
      unit: '/100',
    },
    { metric: 'responseTime', score: output ? executionMs : null, unit: 'ms' },
    { metric: 'cost', score: output ? calculateCost(key, usage) : null, unit: '$' },
  ];
}

async function executeAgent(attempt: AgentAttempt, request: ResearchAgentRequest): Promise<BenchmarkAgentRun> {
  try {
    const result = await attempt.execute();
    const executionMs = Math.round(performance.now() - attempt.startTime);
    const scores = buildScores(request, result.research, executionMs, result.usage, attempt.key);
    const qualityScores = qualityMetricKeys
      .map((metric) => scores.find((score) => score.metric === metric)?.score ?? null)
      .filter((score): score is number => score !== null);
    const overall =
      qualityScores.length > 0
        ? Math.round(qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length)
        : null;

    return {
      key: attempt.key,
      name: attempt.name,
      tagline: attempt.tagline,
      status: 'completed',
      scores,
      overall,
      research: result.research,
      model: result.model,
      usage: result.usage,
    };
  } catch (error) {
    const status = error instanceof Agent1NotConfiguredError ? 'not_configured' : 'failed';
    const message = error instanceof Error ? error.message : 'The agent request failed.';
    console.error(`${attempt.name} benchmark run failed:`, error);
    return {
      key: attempt.key,
      name: attempt.name,
      tagline: attempt.tagline,
      status,
      error: message,
      scores: buildScores(request, null, null, null, attempt.key),
      overall: null,
      research: null,
      model: null,
      usage: null,
    };
  }
}

function findWinners(agents: BenchmarkAgentRun[]): BenchmarkRunResult['winners'] {
  const winners: BenchmarkRunResult['winners'] = {
    accuracy: null,
    completeness: null,
    relevance: null,
    sourceQuality: null,
    responseTime: null,
    cost: null,
    reliability: null,
  };

  for (const metric of Object.keys(winners) as MetricKey[]) {
    const first = agents[0].scores.find((score) => score.metric === metric)?.score ?? null;
    const second = agents[1].scores.find((score) => score.metric === metric)?.score ?? null;
    if (first === null || second === null) continue;
    if (first === second) {
      winners[metric] = 'tie';
    } else {
      const firstWins = lowerIsBetter.has(metric) ? first < second : first > second;
      winners[metric] = firstWins ? agents[0].key : agents[1].key;
    }
  }
  return winners;
}

export async function runBenchmark(
  request: ResearchAgentRequest,
  adapters: BenchmarkAdapters = {
    agent1: runAgent1,
    agent2: async (input) => {
      const result = await runResearchAgent2(input);
      return { research: result, model: result.model, usage: result.usage };
    },
  }
): Promise<BenchmarkRunResult> {
  const first: AgentAttempt = {
    key: 'alpha',
    name: 'Research Agent 1',
    tagline: 'Configured research agent',
    execute: () => adapters.agent1(request),
    startTime: performance.now(),
  };
  const second: AgentAttempt = {
    key: 'beta',
    name: 'Research Agent 2',
    tagline: 'Google Gemini with Search grounding',
    execute: () => adapters.agent2(request),
    startTime: performance.now(),
  };

  const agents = await Promise.all([
    executeAgent(first, request),
    executeAgent(second, request),
  ]);
  return {
    researchQuestion: request.researchQuestion,
    completedAt: new Date().toISOString(),
    rubric:
      'Same input to both agents. Accuracy is unavailable without an independent reference. Completeness measures required sections; relevance measures question-term coverage; source quality checks grounded source titles and HTTPS links. Cost requires token usage and configured per-token pricing.',
    agents: agents as [BenchmarkAgentRun, BenchmarkAgentRun],
    winners: findWinners(agents),
  };
}
