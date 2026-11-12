
import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/Button';
import BriefingContent from '@/components/BriefingContent';
import DemoNotice from '@/components/DemoNotice';
import Eyebrow from '@/components/Eyebrow';
import { usePreparation } from '@/context/usePreparation';
import {
  buildBriefing,
  buildLiveBriefing,
  type MeetingBriefingResponse,
} from '@/services/briefing';
import type { Briefing } from '@/types/briefing';

export default function Briefing() {
  const { request } = usePreparation();

  const briefing = useMemo(() => buildBriefing(request), [request]);

  const [liveBriefing, setLiveBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!request) {
      setLiveBriefing(null);
      setError('');
      setLoading(false);
      return;
    }

    const currentRequest = request;
    const controller = new AbortController();

    async function generateBriefing() {
      setLoading(true);
      setError('');
      setLiveBriefing(null);

      try {
        const companyOrPerson =
          currentRequest.company?.trim() ||
          currentRequest.personName?.trim();

        const meetingPurpose = [
          currentRequest.purpose,
          currentRequest.background
            ? `My background: ${currentRequest.background}`
            : '',
          currentRequest.goals
            ? `My goals: ${currentRequest.goals}`
            : '',
        ]
          .filter(Boolean)
          .join('\n\n');

        if (!companyOrPerson) {
          throw new Error('Please provide a company or person name.');
        }

        if (!meetingPurpose.trim()) {
          throw new Error('Please provide your meeting purpose.');
        }

        const response = await fetch('/api/briefing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(currentRequest),
           
            
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || 'Unable to generate your meeting briefing.'
          );
        }

        const result = data as MeetingBriefingResponse;

        if (!result.success || !result.briefing) {
          throw new Error('The backend returned an invalid briefing.');
        }

        setLiveBriefing(buildLiveBriefing(currentRequest, result));
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : 'Something went wrong while generating your briefing.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    generateBriefing();

    return () => controller.abort();
  }, [request]);

  return (
    <>
      <section className="py-16 md:py-24">
        <div className="page-container">
          <div className="max-w-3xl">
            <Eyebrow>BRIEFING</Eyebrow>

            <h1 className="mt-6 text-5xl sm:text-6xl md:text-7xl">
              Your meeting briefing
            </h1>

            <p className="mt-8 text-lg leading-[1.5] text-ink/80 md:text-xl">
              A printable dossier for your meeting: company background,
              recent insights, suggested questions and talking points,
              with the sources behind them.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-3 print:hidden sm:flex-row">
            <Button
              to="/prepare"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              ← Back to Prepare
            </Button>

            <Button
              onClick={() => window.print()}
              className="w-full sm:w-auto"
            >
              Print Briefing
            </Button>
          </div>

          <div className="mt-10 max-w-3xl">
            <DemoNotice
              isSample={(liveBriefing ?? briefing).isSample}
            />
          </div>
        </div>
      </section>

      {request && loading && (
        <div className="page-container pb-8">
          <p className="border border-ink/20 px-5 py-4">
            Generating your meeting briefing using Tavily and Gemini. Please
            wait...
          </p>
        </div>
      )}

      {request && error && (
        <div className="page-container pb-8">
          <p className="border border-red-500/50 px-5 py-4 text-red-600">
            {error}
          </p>
        </div>
      )}

      <BriefingContent briefing={liveBriefing ?? briefing} />
    </>
  );
}
