import { useState, type FormEvent } from 'react';
import Button from '@/components/Button';
import Eyebrow from '@/components/Eyebrow';
import PreparationSummary from '@/components/PreparationSummary';
import SelectField from '@/components/SelectField';
import TextField from '@/components/TextField';
import { usePreparation } from '@/context/usePreparation';
import { EMPTY_PREPARATION_VALUES, MEETING_TYPE_OPTIONS, PREPARATION_FIELD_LIMITS } from '@/data/preparation';
import { createPreparationRequest, validatePreparation } from '@/services/preparation';
import type {
  PreparationErrors,
  PreparationFormValues,
  PreparationRequest,
} from '@/types/preparation';

const FIELD_ORDER: (keyof PreparationFormValues)[] = [
  'company',
  'personName',
  'personRole',
  'meetingType',
  'purpose',
  'background',
  'goals',
];

const fieldId = (field: keyof PreparationFormValues) => `preparation-${field}`;

export default function PreparationForm() {
  const [values, setValues] = useState<PreparationFormValues>(EMPTY_PREPARATION_VALUES);
  const [errors, setErrors] = useState<PreparationErrors>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [submitted, setSubmitted] = useState<PreparationRequest | null>(null);
  const { setRequest: setSharedRequest } = usePreparation();

  const updateField = <K extends keyof PreparationFormValues>(
    field: K,
    value: PreparationFormValues[K]
  ) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (hasAttemptedSubmit) {
      setErrors(validatePreparation(next));
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validatePreparation(values);
    setHasAttemptedSubmit(true);
    setErrors(nextErrors);

    const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field]);
    if (firstInvalid) {
      document.getElementById(fieldId(firstInvalid))?.focus();
      return;
    }

    const request = createPreparationRequest(values);
    setSubmitted(request);
    setSharedRequest(request);
  };

  const handleClear = () => {
    setValues(EMPTY_PREPARATION_VALUES);
    setErrors({});
    setHasAttemptedSubmit(false);
    setSubmitted(null);
    setSharedRequest(null);
  };

  if (submitted) {
    return (
      <PreparationSummary
        request={submitted}
        onEdit={() => setSubmitted(null)}
        onClear={handleClear}
      />
    );
  }

  const showErrorSummary = hasAttemptedSubmit && Object.keys(errors).length > 0;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-14">
      {showErrorSummary && (
        <p
          role="alert"
          className="border border-error px-5 py-4 text-base leading-[1.5] text-error"
        >
          Please complete the highlighted fields to generate your briefing.
        </p>
      )}

      <section aria-labelledby="preparation-group-meeting" className="space-y-8">
        <header id="preparation-group-meeting" className="border-b border-ink/20 pb-4">
          <Eyebrow number="01">The meeting</Eyebrow>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          <TextField
            id={fieldId('company')}
            label="Company / Organisation"
            required
            value={values.company}
            onChange={(value) => updateField('company', value)}
            placeholder="e.g. Google, Microsoft, TCS"
            maxLength={PREPARATION_FIELD_LIMITS.company}
            error={errors.company}
          />
          <TextField
            id={fieldId('personName')}
            label="Person you're meeting"
            value={values.personName}
            onChange={(value) => updateField('personName', value)}
            placeholder="Interviewer or professional contact's name"
            maxLength={PREPARATION_FIELD_LIMITS.personName}
            error={errors.personName}
          />
          <TextField
            id={fieldId('personRole')}
            label="Their role / designation"
            value={values.personRole}
            onChange={(value) => updateField('personRole', value)}
            placeholder="e.g. Engineering Manager, HR Recruiter"
            maxLength={PREPARATION_FIELD_LIMITS.personRole}
            error={errors.personRole}
          />
          <SelectField
            id={fieldId('meetingType')}
            label="Meeting type"
            value={values.meetingType}
            onChange={(value) => updateField('meetingType', value)}
            options={MEETING_TYPE_OPTIONS}
            error={errors.meetingType}
          />
        </div>
      </section>

      <section aria-labelledby="preparation-group-context" className="space-y-8">
        <header id="preparation-group-context" className="border-b border-ink/20 pb-4">
          <Eyebrow number="02">Your context</Eyebrow>
        </header>

        <div className="space-y-8">
          <TextField
            id={fieldId('purpose')}
            label="Purpose of the meeting"
            required
            multiline
            value={values.purpose}
            onChange={(value) => updateField('purpose', value)}
            placeholder="Explain what the meeting is about and what you want to achieve."
            maxLength={PREPARATION_FIELD_LIMITS.purpose}
            error={errors.purpose}
          />
          <TextField
            id={fieldId('background')}
            label="Your background"
            required
            multiline
            value={values.background}
            onChange={(value) => updateField('background', value)}
            placeholder="Describe your education, skills, experience, projects, or relevant background."
            maxLength={PREPARATION_FIELD_LIMITS.background}
            error={errors.background}
          />
          <TextField
            id={fieldId('goals')}
            label="Additional goals or questions"
            multiline
            value={values.goals}
            onChange={(value) => updateField('goals', value)}
            placeholder="What would you particularly like to learn or prepare for?"
            maxLength={PREPARATION_FIELD_LIMITS.goals}
            error={errors.goals}
          />
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-ink/20 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="secondary" onClick={handleClear} className="w-full sm:w-auto">
          Clear form
        </Button>
        <Button type="submit" className="w-full sm:w-auto">
          Generate my briefing →
        </Button>
      </div>
    </form>
  );
}
