import { useEffect, useRef } from 'react';
import Button from '@/components/Button';
import Eyebrow from '@/components/Eyebrow';
import { MEETING_TYPE_OPTIONS } from '@/data/preparation';
import type { PreparationRequest } from '@/types/preparation';
import { ArrowRight } from 'lucide-react';

type PreparationSummaryProps = {
  request: PreparationRequest;
  onEdit: () => void;
  onClear: () => void;
};

const MISSING_TEXT = 'Not provided';

export default function PreparationSummary({ request, onEdit, onClear }: PreparationSummaryProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const meetingTypeLabel =
    MEETING_TYPE_OPTIONS.find((option) => option.value === request.meetingType)?.label ?? MISSING_TEXT;

  const rows: { label: string; value: string }[] = [
    { label: 'Company / Organisation', value: request.company },
    { label: 'Person you are meeting', value: request.personName || MISSING_TEXT },
    { label: 'Their role / designation', value: request.personRole || MISSING_TEXT },
    { label: 'Meeting type', value: meetingTypeLabel },
    { label: 'Purpose of the meeting', value: request.purpose },
    { label: 'Your background', value: request.background },
    { label: 'Additional goals or questions', value: request.goals || MISSING_TEXT },
  ];

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <Eyebrow>Details collected</Eyebrow>
        <h2 ref={headingRef} tabIndex={-1} className="text-3xl outline-none md:text-4xl">
          Your preparation details are collected.
        </h2>
        <p className="border border-ink/20 bg-note px-5 py-4 text-base leading-[1.5] text-ink">
          Live research has not started and no briefing has been generated. Research is not connected yet.
        </p>
      </div>

      <dl className="border-b border-ink/20">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-2 border-t border-ink/20 py-5 sm:grid-cols-[14rem_1fr] sm:gap-6"
          >
            <dt className="font-mono text-xs uppercase tracking-[0.15em] text-ink/65">{row.label}</dt>
            <dd className="whitespace-pre-line text-base leading-[1.5] text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button to="/briefing" className="w-full sm:w-auto">
          View Meeting Briefing <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button variant="secondary" onClick={onEdit} className="w-full sm:w-auto">
          Edit details
        </Button>
        <Button variant="secondary" onClick={onClear} className="w-full sm:w-auto">
          Clear form
        </Button>
      </div>
    </div>
  );
}
