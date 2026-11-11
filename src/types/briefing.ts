export type BriefingOverview = {
  company: string;
  person: string;
  designation: string;
  meetingType: string;
};

export type BriefingInputs = {
  purpose: string;
  background: string;
  goals: string;
};

export type BriefingNote = {
  title: string;
  detail: string;
};

export type BriefingSource = {
  title: string;
  publisher: string;
  url?: string;
  publishedDate?: string;
};

export type ResearchContent = {
  companyBackground: string[];
  keyInsights: BriefingNote[];
  suggestedQuestions: string[];
  talkingPoints: BriefingNote[];
  informationGaps?: string[];
  sources: BriefingSource[];
};

export type Briefing = {
  isSample: boolean;
  overview: BriefingOverview;
  inputs: BriefingInputs | null;
  research: ResearchContent | null;
};