import Button from '@/components/Button';
import BriefingSection from '@/components/BriefingSection';
import Eyebrow from '@/components/Eyebrow';
import Section from '@/components/Section';

const HOW_STEPS = [
  {
    number: '01',
    title: 'Research',
    body: 'Tavily searches the web for current, relevant sources about the company and the people you are meeting.',
  },
  {
    number: '02',
    title: 'Reason',
    body: 'An AI agent reads those sources and writes a structured briefing with insights, questions and talking points.',
  },
  {
    number: '03',
    title: 'Cite',
    body: 'Every claim in the briefing links back to the source it came from, so you can check it yourself.',
  },
  {
    number: '04',
    title: 'Evaluate',
    body: 'The same brief goes to two agents and their outputs are scored side by side on accuracy, relevance, completeness, speed, cost and reliability.',
  },
];

export default function About() {
  return (
    <>
      <section className="py-16 md:py-24">
        <div className="page-container">
          <div className="max-w-3xl">
            <Eyebrow>ABOUT</Eyebrow>
            <h1 className="mt-6 text-5xl sm:text-6xl md:text-7xl">About OpportunityPilot</h1>
            <p className="mt-8 text-lg leading-[1.5] text-ink/80 md:text-xl">
              OpportunityPilot is a meeting preparation tool. It researches the company and the people you are
              meeting, writes a source-backed briefing, and shows you how reliable that research is.
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
        </div>
      </section>

      <BriefingSection number="01" title="What it is">
        <p className="text-lg leading-[1.5] text-ink/80">
          OpportunityPilot takes a few details about an upcoming meeting &mdash; the company, the person, the
          purpose &mdash; and turns them into a printable briefing. The briefing covers company background, key
          insights, suggested questions and personalised talking points, each tied to the source it came from.
        </p>
        <p className="mt-5 text-lg leading-[1.5] text-ink/80">
          Alongside the briefing, two AI research agents are given the same task and scored against each other,
          so you can see not just what the research says but how trustworthy the process behind it is.
        </p>
      </BriefingSection>

      <BriefingSection number="02" title="The problem">
        <p className="text-lg leading-[1.5] text-ink/80">
          Most people walk into interviews, pitches and client meetings without enough preparation. Searching
          takes time, notes get scattered, and it is hard to tell whether what you found is current or even
          correct.
        </p>
        <p className="mt-5 text-lg leading-[1.5] text-ink/80">
          The result is avoidable stress and missed opportunities. You know the meeting matters, but the evening
          before it is spent piecing together fragments from a dozen tabs. OpportunityPilot is built to take that
          work off your plate.
        </p>
      </BriefingSection>

      <BriefingSection number="03" title="How it works">
        <p className="text-lg leading-[1.5] text-ink/80">
          The same preparation brief moves through four stages. Nothing here is connected yet &mdash; this
          describes the intended flow.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {HOW_STEPS.map((step) => (
            <article key={step.number} className="flex flex-col border border-ink/20 p-6 md:p-7">
              <span className="font-mono text-base text-accent">{step.number}</span>
              <h3 className="mt-6 text-xl">{step.title}</h3>
              <p className="mt-3 text-base leading-[1.5] text-ink/80">{step.body}</p>
            </article>
          ))}
        </div>
      </BriefingSection>

      <BriefingSection number="04" title="Why reliability and sources matter">
        <p className="text-lg leading-[1.5] text-ink/80">
          A briefing is only useful if you can trust it. If a claim about a company is wrong, outdated or
          invented, it can do more harm than having no briefing at all &mdash; especially in an interview or a
          client conversation.
        </p>
        <p className="mt-5 text-lg leading-[1.5] text-ink/80">
          That is why every claim in an OpportunityPilot briefing is meant to link back to a source you can open
          and check. And it is why two agents are scored side by side: so the reliability of the research is
          visible, not hidden.
        </p>
      </BriefingSection>

      <BriefingSection number="05" title="The vision">
        <p className="text-lg leading-[1.5] text-ink/80">
          The long-term goal is simple: preparation that used to take an evening should take a minute, and you
          should be able to see exactly where the information came from.
        </p>
        <p className="mt-5 text-lg leading-[1.5] text-ink/80">
          Meeting preparation should not be a privilege of the people who have the time to do it well. It should
          be fast, transparent and available to anyone who has a room to walk into.
        </p>
      </BriefingSection>

      <Section>
        <p className="max-w-4xl font-serif text-4xl leading-[1.2] tracking-[-0.01em] md:text-6xl lg:text-7xl">
          Preparation should be fast, transparent and <span className="text-accent">open to anyone.</span>
        </p>
        <div className="mt-10">
          <Button to="/prepare">Start a briefing →</Button>
        </div>
      </Section>

      <Section>
        <div className="max-w-2xl border border-ink bg-note p-6 md:p-8">
          <Eyebrow>PROTOTYPE</Eyebrow>
          <p className="mt-4 text-lg leading-[1.5] text-ink">
            OpportunityPilot is a hackathon prototype. Live research and agent benchmarking are not connected
            yet, and some content on this site is sample data.
          </p>
        </div>
      </Section>
    </>
  );
}
