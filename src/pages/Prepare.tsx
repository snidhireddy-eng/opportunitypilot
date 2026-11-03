import Eyebrow from '@/components/Eyebrow';
import PreparationForm from '@/components/PreparationForm';

export default function Prepare() {
  return (
    <>
      <section className="py-16 md:py-24">
        <div className="page-container">
          <div className="max-w-3xl">
            <Eyebrow>PREPARE</Eyebrow>
            <h1 className="mt-6 text-5xl sm:text-6xl md:text-7xl">
              Prepare for the room you’re walking into.
            </h1>
            <p className="mt-8 text-lg leading-[1.5] text-ink/80 md:text-xl">
              Tell us about your upcoming meeting. OpportunityPilot will use these details to prepare
              relevant research and a personalised briefing.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-ink/20 py-16 md:py-24">
        <div className="page-container">
          <div className="max-w-3xl">
            <PreparationForm />
          </div>
        </div>
      </section>
    </>
  );
}
