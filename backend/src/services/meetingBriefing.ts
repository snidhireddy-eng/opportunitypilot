
import { generateGeminiContent } from './gemini.js';
import {
  researchMeeting,
  type MeetingResearchRequest,
} from './meetingResearch.js';

export type MeetingBriefingRequest = MeetingResearchRequest & {
  meetingDateTime?: string;
};

export type MeetingBriefingResult = {
  briefing: string;
  sources: Awaited<ReturnType<typeof researchMeeting>>['sources'];
  meetingDetails: {
    companyOrPerson: string;
    meetingPurpose: string;
    meetingDateTime: string;
  };
  generatedAt: string;
  model: string;
  executionMs: number;
  usage: Awaited<ReturnType<typeof generateGeminiContent>>['usage'];
};

export async function generateMeetingBriefing(
  input: MeetingBriefingRequest
): Promise<MeetingBriefingResult> {
  // Step 1: Research recent news using Tavily.
  const research = await researchMeeting({
    companyOrPerson: input.companyOrPerson,
    meetingPurpose: input.meetingPurpose,
  });

  if (research.sources.length === 0) {
    throw new Error(
      'No relevant recent articles were found. Try a more specific company or person name.'
    );
  }

  // Step 2: Prepare the research articles for Gemini.
  const sourceInformation = research.sources
    .map(
      (source, index) => `
SOURCE ${index + 1}
Title: ${source.title}
Published: ${source.publishedDate}
URL: ${source.url}
Content:
${source.content.slice(0, 5000)}
`
    )
    .join('\n');

  // Step 3: Ask Gemini to create the meeting briefing.
  const prompt = `
You are OpportunityPilot, an AI meeting preparation assistant.

Create a useful, professional meeting briefing using ONLY the
research sources provided below.

MEETING DETAILS
Company or person: ${input.companyOrPerson}
Meeting purpose: ${input.meetingPurpose}
Meeting date and time: ${input.meetingDateTime || 'Not provided'}

RESEARCH SOURCES
${sourceInformation}

INSTRUCTIONS

1. Cover important developments from the last 30 days.
2. Include relevant company news, launches, hiring, partnerships,
   leadership updates, and business developments when available.
3. Explain why each important development matters to this meeting.
4. Suggest thoughtful questions the user could ask.
5. Include useful talking points based on the user's meeting purpose.
6. Cite claims using source numbers such as [Source 1] or [Source 2].
7. Never invent facts, dates, people, or developments.
8. Clearly mention when information is unavailable or uncertain.
9. Do not present unsupported claims as facts.

Use this structure:

# Meeting Briefing

## 1. Executive Summary

## 2. Recent Developments

## 3. Important Insights

## 4. Suggested Questions

## 5. Personalised Talking Points

## 6. Information Gaps

Keep the briefing concise, clear, and useful for someone preparing
for a real meeting.
`;

  const generated = await generateGeminiContent(prompt);

  return {
    briefing: generated.text,
    sources: research.sources,
    meetingDetails: {
      companyOrPerson: input.companyOrPerson,
      meetingPurpose: input.meetingPurpose,
      meetingDateTime: input.meetingDateTime || 'Not provided',
    },
    generatedAt: new Date().toISOString(),
    model: generated.model,
    executionMs: generated.executionMs,
    usage: generated.usage,
  };
}
