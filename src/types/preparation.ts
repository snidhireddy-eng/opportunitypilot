export type MeetingType =
  | 'job_interview'
  | 'internship_interview'
  | 'networking'
  | 'professional_meeting'
  | 'other';

export type PreparationFormValues = {
  company: string;
  personName: string;
  personRole: string;
  meetingType: MeetingType;
  purpose: string;
  background: string;
  goals: string;
};

export type PreparationErrors = Partial<Record<keyof PreparationFormValues, string>>;

export type PreparationRequest = PreparationFormValues & {
  id: string;
  submittedAt: string;
};
