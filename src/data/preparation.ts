import type { MeetingType, PreparationFormValues } from '@/types/preparation';

export const MEETING_TYPE_OPTIONS: { value: MeetingType; label: string }[] = [
  { value: 'job_interview', label: 'Job Interview' },
  { value: 'internship_interview', label: 'Internship Interview' },
  { value: 'networking', label: 'Networking' },
  { value: 'professional_meeting', label: 'Professional Meeting' },
  { value: 'other', label: 'Other' },
];

export const PREPARATION_FIELD_LIMITS = {
  company: 120,
  personName: 120,
  personRole: 120,
  purpose: 1000,
  background: 2000,
  goals: 1000,
} as const;

export const EMPTY_PREPARATION_VALUES: PreparationFormValues = {
  company: '',
  personName: '',
  personRole: '',
  meetingType: 'job_interview',
  purpose: '',
  background: '',
  goals: '',
};
