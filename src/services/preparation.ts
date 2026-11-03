import { PREPARATION_FIELD_LIMITS } from '@/data/preparation';
import type {
  PreparationErrors,
  PreparationFormValues,
  PreparationRequest,
} from '@/types/preparation';

const LENGTH_MESSAGE = (limit: number) => `Keep this under ${limit} characters.`;

export function validatePreparation(values: PreparationFormValues): PreparationErrors {
  const errors: PreparationErrors = {};
  const company = values.company.trim();
  const purpose = values.purpose.trim();
  const background = values.background.trim();

  if (!company) {
    errors.company = 'Enter the company or organisation you are meeting.';
  } else if (company.length > PREPARATION_FIELD_LIMITS.company) {
    errors.company = LENGTH_MESSAGE(PREPARATION_FIELD_LIMITS.company);
  }

  if (values.personName.trim().length > PREPARATION_FIELD_LIMITS.personName) {
    errors.personName = LENGTH_MESSAGE(PREPARATION_FIELD_LIMITS.personName);
  }

  if (values.personRole.trim().length > PREPARATION_FIELD_LIMITS.personRole) {
    errors.personRole = LENGTH_MESSAGE(PREPARATION_FIELD_LIMITS.personRole);
  }

  if (!purpose) {
    errors.purpose = 'Describe what the meeting is about so the preparation can focus.';
  } else if (purpose.length > PREPARATION_FIELD_LIMITS.purpose) {
    errors.purpose = LENGTH_MESSAGE(PREPARATION_FIELD_LIMITS.purpose);
  }

  if (!background) {
    errors.background = 'Add a short description of your background.';
  } else if (background.length > PREPARATION_FIELD_LIMITS.background) {
    errors.background = LENGTH_MESSAGE(PREPARATION_FIELD_LIMITS.background);
  }

  if (values.goals.trim().length > PREPARATION_FIELD_LIMITS.goals) {
    errors.goals = LENGTH_MESSAGE(PREPARATION_FIELD_LIMITS.goals);
  }

  return errors;
}

export function createPreparationRequest(values: PreparationFormValues): PreparationRequest {
  return {
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    company: values.company.trim(),
    personName: values.personName.trim(),
    personRole: values.personRole.trim(),
    meetingType: values.meetingType,
    purpose: values.purpose.trim(),
    background: values.background.trim(),
    goals: values.goals.trim(),
  };
}
