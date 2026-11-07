import Button from '@/components/Button';
import ComparisonTable from '@/components/ComparisonTable';
import Eyebrow from '@/components/Eyebrow';
import ScoreCard from '@/components/ScoreCard';
import Section from '@/components/Section';
import { AGENTS, HOW_IT_WORKS_STEPS, METRICS } from '@/data/sampleBenchmark';

export default function Benchmark() {
  return (
    <>
      <section className="py-16 md:py-24">
        <div className="page-container">
          <div className="max-w-3xl">
            <Eyebrow>BENCHMARK</Eyebrow>
            <h1 className="mt-6 text-5xl sm:text-6xl md:text-7xl">Compare AI agents</h1>
            <p className="mt-8 text-lg leading-[1.5] text-ink/80 md:text-xl">
              OpportunityPilot sends the same preparation brief to two AI research agents and scores their
              briefings side by side. This page shows how that comparison will look.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button to="/prepare" className="w-full sm:w-auto">
                Start a briefing →
              </Button>
              <Button to="/briefing" variant="secondary" className="w-full sm:w-auto">
                View a sample briefing
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Section>
        <Eyebrow number="01">THE AGENTS</Eyebrow>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {AGENTS.map((agent) => (
            <ScoreCard key={agent.key} agent={agent} showScore={false} />
          ))}
        </div>
      </Section>

      <Section>
        <Eyebrow number="02">THE METRICS</Eyebrow>
        <ul className="mt-10 border-b border-ink/20">
          {METRICS.map((metric) => (
            <li key={metric.key} className="border-t border-ink/20 py-6 md:py-8">
              <div className="grid gap-2 md:grid-cols-[16rem_1fr] md:gap-8">
                <h3 className="text-xl md:text-2xl">{metric.label}</h3>
                <p className="text-base leading-[1.5] text-ink/80 md:text-lg">{metric.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <Eyebrow number="03">COMPARISON TABLE</Eyebrow>
        <div className="mt-10">
          <ComparisonTable metrics={METRICS} agents={AGENTS} />
        </div>
      </Section>

      <Section>
        <Eyebrow number="04">OVERALL SCORES</Eyebrow>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {AGENTS.map((agent) => (
            <ScoreCard key={agent.key} agent={agent} />
          ))}
        </div>
        <p className="mt-6 text-base leading-[1.5] text-ink/80">
          The overall score is a simple average of the accuracy, relevance, completeness and reliability
          scores. Response time and cost are shown separately because they are not on the same scale.
        </p>
      </Section>

      <Section>
        <Eyebrow number="05">HOW IT WORKS</Eyebrow>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <article key={step.number} className="flex flex-col border border-ink/20 p-6 md:p-7">
              <span className="font-mono text-base text-accent">{step.number}</span>
              <h3 className="mt-6 text-xl">{step.title}</h3>
              <p className="mt-3 text-base leading-[1.5] text-ink/80">{step.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <div className="max-w-2xl border border-ink bg-note p-6 md:p-8">
          <Eyebrow>DEMO DATA</Eyebrow>
          <p className="mt-4 text-lg leading-[1.5] text-ink">
            All scores on this page are fictional sample data, not actual test results. No real benchmarking
            has been run yet.
          </p>
        </div>
      </Section>
    </>
  );
}
