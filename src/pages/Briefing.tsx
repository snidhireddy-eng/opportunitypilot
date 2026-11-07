import { useMemo } from 'react';
import Button from '@/components/Button';
import BriefingContent from '@/components/BriefingContent';
import DemoNotice from '@/components/DemoNotice';
import Eyebrow from '@/components/Eyebrow';
import { usePreparation } from '@/context/usePreparation';
import { buildBriefing } from '@/services/briefing';

export default function Briefing() {
  const { request } = usePreparation();
  const briefing = useMemo(() => buildBriefing(request), [request]);

  return (
    <>
      <section className="py-16 md:py-24">
        <div className="page-container">
          <div className="max-w-3xl">
            <Eyebrow>BRIEFING</Eyebrow>
            <h1 className="mt-6 text-5xl sm:text-6xl md:text-7xl">Your meeting briefing</h1>
            <p className="mt-8 text-lg leading-[1.5] text-ink/80 md:text-xl">
              A printable dossier for your meeting: the overview, company background, insights, questions and
              talking points, with the sources behind them.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-3 print:hidden sm:flex-row">
            <Button to="/prepare" variant="secondary" className="w-full sm:w-auto">
              ← Back to Prepare
            </Button>
            <Button onClick={() => window.print()} className="w-full sm:w-auto">
              Print Briefing
            </Button>
          </div>

          <div className="mt-10 max-w-3xl">
            <DemoNotice isSample={briefing.isSample} />
          </div>
        </div>
      </section>

      <BriefingContent briefing={briefing} />
    </>
  );
}
