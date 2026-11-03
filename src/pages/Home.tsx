import Button from '@/components/Button';
import Eyebrow from '@/components/Eyebrow';
import Section from '@/components/Section';

const FEATURES = [
  { number: '01', title: 'Preparation form', body: 'Tell us who you are meeting and why.' },
  { number: '02', title: 'Live research progress', body: 'Follow each research stage as it happens.' },
  {
    number: '03',
    title: 'Meeting briefing',
    body: 'A printable dossier with insights, questions, talking points and sources.',
  },
  {
    number: '04',
    title: 'Agent benchmarking',
    body: 'Accuracy, relevance, completeness, speed, cost and reliability, compared.',
  },
];

const STEPS = [
  { number: '01', title: 'Brief', body: 'Describe the meeting.' },
  { number: '02', title: 'Research', body: 'Search the web for current, relevant sources.' },
  { number: '03', title: 'Reason', body: 'An AI agent reads the sources and writes the briefing.' },
  { number: '04', title: 'Cite', body: 'Every claim links back to its source.' },
  {
    number: '05',
    title: 'Evaluate',
    body: 'The same brief goes to two agents and their outputs are scored side by side.',
  },
];

export default function Home() {
  return (
    <>
      <section className="py-16 md:py-28 lg:py-36">
        <div className="page-container">
          <Eyebrow>AI MEETING PREPARATION</Eyebrow>
          <h1 className="mt-6 max-w-4xl text-[3.25rem] sm:text-7xl lg:text-8xl">
            Walk in knowing the room.
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-[1.5] text-ink/80 md:text-xl">
            OpportunityPilot researches the company and the people, writes your briefing with sources,
            and shows you how reliable the research is.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button to="/prepare" className="w-full sm:w-auto">
              Start a briefing →
            </Button>
            <Button to="/benchmark" variant="secondary" className="w-full sm:w-auto">
              See how agents compare
            </Button>
          </div>
        </div>
      </section>

      <Section>
        <Eyebrow>WHAT IT DOES</Eyebrow>
        <ul className="mt-10 border-b border-ink/20">
          {FEATURES.map((feature) => (
            <li
              key={feature.number}
              className="grid grid-cols-[3rem_1fr] gap-x-4 border-t border-ink/20 py-8 md:grid-cols-[5rem_1fr_1.2fr] md:gap-x-8 md:py-10"
            >
              <span className="font-mono text-base text-accent">{feature.number}</span>
              <h3 className="text-2xl md:text-3xl">{feature.title}</h3>
              <p className="col-start-2 mt-3 text-lg leading-[1.5] text-ink/80 md:col-start-auto md:mt-0 md:self-center">
                {feature.body}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <Eyebrow>HOW IT WORKS</Eyebrow>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step) => (
            <article key={step.number} className="flex flex-col border border-ink/20 p-6 md:p-7">
              <span className="font-mono text-base text-accent">{step.number}</span>
              <h3 className="mt-6 text-xl">{step.title}</h3>
              <p className="mt-3 text-base leading-[1.5] text-ink/80">{step.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <p className="max-w-4xl font-serif text-4xl leading-[1.2] tracking-[-0.01em] md:text-6xl lg:text-7xl">
          Preparation used to take an evening. <span className="text-accent">Now it takes a minute.</span>
        </p>
        <div className="mt-10">
          <Button to="/prepare">Start a briefing →</Button>
        </div>
      </Section>

      <Section>
        <div className="max-w-2xl border border-ink/20 bg-note p-6 md:p-8">
          <Eyebrow>PROTOTYPE</Eyebrow>
          <p className="mt-4 text-lg leading-[1.5] text-ink">
            This version runs on sample data. Live research is not connected yet.
          </p>
        </div>
      </Section>
    </>
  );
}
