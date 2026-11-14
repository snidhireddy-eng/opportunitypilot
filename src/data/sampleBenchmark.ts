import type { Agent, HowItWorksStep, Metric } from '@/types/benchmark';

export const METRICS: Metric[] = [
  {
    key: 'accuracy',
    label: 'Factual accuracy',
    description: 'Whether the claims in the briefing are correct and verifiable against real sources.',
    unit: '/100',
  },
  {
    key: 'relevance',
    label: 'Source relevance',
    description: 'How closely the retrieved sources match the meeting and the people involved.',
    unit: '/100',
  },
  {
    key: 'completeness',
    label: 'Completeness',
    description: 'How much of the useful, available context the briefing actually covers.',
    unit: '/100',
  },
  {
    key: 'responseTime',
    label: 'Response time',
    description: 'How long the agent takes to produce a finished briefing from the same brief.',
    unit: 's',
  },
  {
    key: 'cost',
    label: 'Cost',
    description: 'Estimated cost in USD to produce one briefing at the current sample load.',
    unit: '$',
  },
  {
    key: 'reliability',
    label: 'Reliability',
    description: 'How consistently the agent produces a usable briefing across repeated runs.',
    unit: '/100',
  },
];

export const AGENTS: Agent[] = [
  {
    key: 'alpha',
    name: 'Agent Alpha',
    tagline: 'Thorough and source-first',
    overall: 82,
    scores: [
      { metric: 'accuracy', score: 88, unit: '/100' },
      { metric: 'relevance', score: 84, unit: '/100' },
      { metric: 'completeness', score: 90, unit: '/100' },
      { metric: 'responseTime', score: 42, unit: 's' },
      { metric: 'cost', score: 0.12, unit: '$' },
      { metric: 'reliability', score: 80, unit: '/100' },
    ],
  },
  {
    key: 'beta',
    name: 'Agent Beta',
    tagline: 'Fast and concise',
    overall: 76,
    scores: [
      { metric: 'accuracy', score: 80, unit: '/100' },
      { metric: 'relevance', score: 78, unit: '/100' },
      { metric: 'completeness', score: 72, unit: '/100' },
      { metric: 'responseTime', score: 18, unit: 's' },
      { metric: 'cost', score: 0.07, unit: '$' },
      { metric: 'reliability', score: 86, unit: '/100' },
    ],
  },
];

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    number: '01',
    title: 'Same brief',
    body: 'Both agents receive the identical preparation brief, so the comparison is fair.',
  },
  {
    number: '02',
    title: 'Same research context',
    body: 'Both models receive the same research question, requirements and Tavily sources. Each generates its own response independently; neither sees the other\u2019s output.',
  },
  {
    number: '03',
    title: 'Scored on the same metrics',
    body: 'Both outputs are graded on accuracy, relevance, completeness, response time, cost and reliability.',
  },
  {
    number: '04',
    title: 'Side by side',
    body: 'The scores are shown next to each other so you can see where each agent is stronger.',
  },
];
