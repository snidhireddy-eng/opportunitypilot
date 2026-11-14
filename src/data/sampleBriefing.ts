import type { BriefingOverview, ResearchContent } from '@/types/briefing';

export const SAMPLE_OVERVIEW: BriefingOverview = {
  company: 'Harbor & Pine Analytics (sample)',
  person: 'Jordan Ellis (sample)',
  designation: 'Head of Talent (sample)',
  meetingType: 'Job Interview',
};

export const SAMPLE_RESEARCH: ResearchContent = {
  companyBackground: [
    'Harbor & Pine Analytics is an illustrative example organisation used to demonstrate the layout of a briefing. A live briefing would describe the organisation’s products, size, recent news and history, each linked to a cited source.',
    'This example does not describe a real organisation. Names, details and sources are placeholders.',
  ],
  keyInsights: [
    {
      title: 'Hiring focus (sample)',
      detail: 'The example team is described as expanding its data platform group this year.',
    },
    {
      title: 'Culture signal (sample)',
      detail: 'The sample profile emphasises clear communication and small cross-functional teams.',
    },
    {
      title: 'Competitive pressure (sample)',
      detail: 'A fictional competitor in the same market is described as growing quickly.',
    },
  ],
  suggestedQuestions: [
    'What does success look like for this role in the first six months?',
    'How does the team currently measure the quality of its analysis?',
    'Which problem would you most like the next hire to solve first?',
    'How do analysts and product teams usually work together here?',
  ],
  talkingPoints: [
    {
      title: 'Relevant experience (sample)',
      detail: 'Connect one project from your background to the priority the team has named.',
    },
    {
      title: 'Motivation (sample)',
      detail: 'Explain what draws you to this organisation’s mission and what you want to do next.',
    },
    {
      title: 'Prepared questions (sample)',
      detail: 'Use two or three of your questions to show that you have done your research.',
    },
  ],
  sources: [
    { title: 'Sample company profile (fictional)', publisher: 'Sample data' },
    { title: 'Sample news item (fictional)', publisher: 'Sample data' },
  ],
};
