import { MEETING_TYPE_OPTIONS } from '@/data/preparation';
import { SAMPLE_OVERVIEW, SAMPLE_RESEARCH } from '@/data/sampleBriefing';
import type { Briefing } from '@/types/briefing';
import type { PreparationRequest } from '@/types/preparation';

const NOT_PROVIDED = 'Not provided';

export function buildBriefing(request: PreparationRequest | null): Briefing {
  if (!request) {
    return { isSample: true, overview: SAMPLE_OVERVIEW, inputs: null, research: SAMPLE_RESEARCH };
  }

  const meetingTypeLabel =
    MEETING_TYPE_OPTIONS.find((option) => option.value === request.meetingType)?.label ?? NOT_PROVIDED;

  return {
    isSample: false,
    overview: {
      company: request.company,
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
