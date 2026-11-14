import type { ResearchOutput, ResearchTokenUsage } from './agent2.js';

export type AgentKey = 'alpha' | 'beta';

export type MetricKey =
  | 'accuracy'
  | 'relevance'
  | 'completeness'
  | 'sourceQuality'
  | 'citationValidity'
  | 'responseTime'
  | 'cost'
  | 'reliability';

export type Metric = {
  key: MetricKey;
  label: string;
  description: string;
  unit: string;
};

export type AgentScore = {
  metric: MetricKey;
  score: number | null;
  unit: string;
};

export type Agent = {
  key: AgentKey;
  name: string;
  tagline: string;
  scores: AgentScore[];
  overall: number | null;
};

export type BenchmarkAgentStatus = 'completed' | 'not_configured' | 'failed';

export type FactCheckClaim = {
  id: string;
  claim: string;
  status: 'supported' | 'contradicted' | 'unverified';
  reason: string;
  sources: string[];
};

export type AgentFactCheck = {
  status: 'completed' | 'unavailable';
  score: number | null;
  supported: number;
  contradicted: number;
  unverified: number;
  claims: FactCheckClaim[];
  note: string;
};

export type BenchmarkAgentRun = Agent & {
  status: BenchmarkAgentStatus;
  factCheck?: AgentFactCheck;
  error?: string;
  research: ResearchOutput | null;
  model: string | null;
  usage: ResearchTokenUsage | null;
};

export type BenchmarkRunResult = {
  researchQuestion: string;
  completedAt: string;
  rubric: string;
  agents: [BenchmarkAgentRun, BenchmarkAgentRun];
  winners: Record<MetricKey, AgentKey | 'tie' | null>;
};

export type HowItWorksStep = {
  number: string;
  title: string;
  body: string;
};
