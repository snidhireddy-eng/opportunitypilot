export type ResearchAgentRequest = {
  researchQuestion: string;
  opportunityCategory: string;
  targetAudience: string;
  additionalRequirements?: string;
};

export type ResearchFinding = {
  title: string;
  detail: string;
};

export type ResearchDeadline = {
  name: string;
  date: string;
  detail: string;
};

export type ResearchSource = {
  title: string | null;
  url: string;
  groundingChunkIndex?: number;
};

export type ResearchGroundingSupport = {
  text: string | null;
  sourceIndices: number[];
  confidenceScores: number[];
};

export type ResearchGrounding = {
  webSearchQueries: string[];
  supports: ResearchGroundingSupport[];
};

export type ResearchOutput = {
  title: string;
  executiveSummary: string;
  keyFindings: ResearchFinding[];
  eligibilityCriteria: string[];
  deadlines: ResearchDeadline[];
  uncertainInformation: string[];
  sources: ResearchSource[];
  grounding?: ResearchGrounding;
};

export type ResearchTokenUsage = {
  promptTokens?: number;
  responseTokens?: number;
  totalTokens?: number;
};

export type ResearchAgentResult = ResearchOutput & {
  agent: 'agent2';
  status: 'completed' | 'partial';
  executionMs: number;
  model: string;
  usage: {
    promptTokens?: number;
    responseTokens?: number;
    totalTokens?: number;
  } | null;
};
