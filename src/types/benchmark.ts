export type AgentKey = 'alpha' | 'beta';

export type MetricKey =
  | 'accuracy'
  | 'relevance'
  | 'completeness'
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
  score: number;
  unit: string;
};

export type Agent = {
  key: AgentKey;
  name: string;
  tagline: string;
  scores: AgentScore[];
  overall: number;
};

export type HowItWorksStep = {
  number: string;
  title: string;
  body: string;
};
