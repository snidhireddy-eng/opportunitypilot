
import { MEETING_TYPE_OPTIONS } from '@/data/preparation';
import { SAMPLE_OVERVIEW, SAMPLE_RESEARCH } from '@/data/sampleBriefing';
import type {
  Briefing,
  BriefingNote,
  BriefingSource,
  ResearchContent,
} from '@/types/briefing';
import type { PreparationRequest } from '@/types/preparation';

const NOT_PROVIDED = 'Not provided';

type BackendSource = {
  title?: string;
  url?: string;
  publishedDate?: string;
};

export type MeetingBriefingResponse = {
  success: boolean;
  briefing: string;
  sources: BackendSource[];
};

export function buildBriefing(
  request: PreparationRequest | null
): Briefing {
  if (!request) {
    return {
      isSample: true,
      overview: SAMPLE_OVERVIEW,
      inputs: null,
      research: SAMPLE_RESEARCH,
    };
  }

  const meetingTypeLabel =
    MEETING_TYPE_OPTIONS.find(
      (option) => option.value === request.meetingType
    )?.label ?? NOT_PROVIDED;

  return {
    isSample: false,
    overview: {
      company: request.company || NOT_PROVIDED,
      person: request.personName || NOT_PROVIDED,
      designation: request.personRole || NOT_PROVIDED,
      meetingType: meetingTypeLabel,
    },
    inputs: {
      purpose: request.purpose,
      background: request.background,
      goals: request.goals || NOT_PROVIDED,
    },
    research: null,
  };
}

function cleanText(value: string): string {
  return value
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`/g, '')
    .replace(/^[-*]\s+/, '')
    .replace(/^\d+[.)]\s+/, '')
    .trim();
}

function getSection(markdown: string, names: string[]): string {
  const lines = markdown.split(/\r?\n/);
  let capturing = false;
  const collected: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,6}\s+(.+)$/);

    if (headingMatch) {
      if (capturing) break;

      const heading = headingMatch[1]
        .replace(/^\d+[.)]\s*/, '')
        .replace(/[*_]/g, '')
        .trim()
        .toLowerCase();

      if (names.some((name) => heading.includes(name.toLowerCase()))) {
        capturing = true;
      }

      continue;
    }

    if (capturing) collected.push(line);
  }

  return collected.join('\n').trim();
}

function splitItems(section: string): string[] {
  if (!section.trim()) return [];

  const lines = section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const listItems = lines
    .filter((line) => /^([-*]|\d+[.)])\s+/.test(line))
    .map(cleanText);

  if (listItems.length > 0) return listItems;

  return section
    .split(/\n\s*\n/)
    .map(cleanText)
    .filter(Boolean);
}

function makeNotes(
  section: string,
  defaultTitle: string
): BriefingNote[] {
  return splitItems(section).map((item, index) => {
    const separator = item.search(/:\s| — | – /);

    if (separator > 0) {
      return {
        title: item.slice(0, separator).trim(),
        detail: item
          .slice(separator)
          .replace(/^:\s*|^[—–]\s*/, '')
          .trim(),
      };
    }

    return {
      title: `${defaultTitle} ${index + 1}`,
      detail: item,
    };
  });
}

function makeQuestions(section: string): string[] {
  return splitItems(section).map((item) =>
    item.replace(/^["']|["']$/g, '')
  );
}

function getPublisher(url?: string): string {
  if (!url) return 'Unknown publisher';

  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Unknown publisher';
  }
}

export function buildLiveBriefing(
  request: PreparationRequest,
  response: MeetingBriefingResponse
): Briefing {
  if (!response.briefing || typeof response.briefing !== 'string') {
    throw new Error('The backend returned an empty briefing.');
  }

  const markdown = response.briefing;

  const companySection = getSection(markdown, ['company background']);
  const roleContext = getSection(markdown, ['role and internship context']);
  const executiveSummary = getSection(markdown, ['executive summary']);
  const recentDevelopments = getSection(markdown, ['recent developments']);
  const insights = getSection(markdown, ['key insights', 'important insights']);
  const questions = getSection(markdown, ['suggested questions']);
  const talkingPoints = getSection(markdown, [
    'personalised talking points',
    'personalized talking points',
  ]);
  const informationGaps = getSection(markdown, ['information gaps']);

  const companyBackground = [
    ...splitItems(companySection),
    ...splitItems(roleContext),
    ...splitItems(executiveSummary),
    ...splitItems(recentDevelopments),
  ].filter(Boolean);

  const sources: BriefingSource[] = Array.isArray(response.sources)
    ? response.sources.map((source) => ({
        title: source.title || 'Research article',
        publisher: getPublisher(source.url),
        url: source.url,
        publishedDate: source.publishedDate,
      }))
    : [];

  const research: ResearchContent = {
    companyBackground:
      companyBackground.length > 0
        ? companyBackground
        : ['No company background was provided in the generated briefing.'],
    keyInsights: makeNotes(insights, 'Insight'),
    suggestedQuestions: makeQuestions(questions),
    talkingPoints: makeNotes(talkingPoints, 'Talking point'),
    sources,
    informationGaps: splitItems(informationGaps),
  };

  return {
    ...buildBriefing(request),
    research,
  };
}
