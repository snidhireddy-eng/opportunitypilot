import { useState, type FormEvent } from 'react';
import Button from '@/components/Button';
import ComparisonTable from '@/components/ComparisonTable';
import Eyebrow from '@/components/Eyebrow';
import ResearchResultCard from '@/components/ResearchResultCard';
import ScoreCard from '@/components/ScoreCard';
import Section from '@/components/Section';
import { researchWithAgent2 } from '@/services/agent2';
import { runBenchmark } from '@/services/benchmark';
import type { ResearchAgentRequest, ResearchAgentResult } from '@/types/agent2';
import type { Metric } from '@/types/benchmark';
import type { BenchmarkRunResult } from '@/types/benchmark';
import { AGENTS, HOW_IT_WORKS_STEPS, METRICS } from '@/data/sampleBenchmark';

const LIVE_METRICS: Metric[] = [
  {
    key: 'accuracy',
    label: 'Accuracy',
    description: 'Unavailable until results can be checked against independent reference evidence.',
    unit: '/100',
  },
  {
    key: 'completeness',
    label: 'Completeness',
    description: 'Share of six required report sections present; this measures structure, not factual completeness.',
    unit: '/100',
  },
  {
    key: 'relevance',
    label: 'Relevance',
    description: 'Keyword overlap between important question terms and the returned research text.',
    unit: '/100',
  },
  {
    key: 'sourceQuality',
    label: 'Source quality',
    description: 'Share of source links with a title and HTTPS URL; this is not an independent fact-check.',
    unit: '/100',
  },
  {
    key: 'citationValidity',
    label: 'Citation validity',
    description: 'Share of inline source-title citations that exactly match supplied Tavily source titles; this checks traceability, not factual truth.',
    unit: '/100',
  },
  {
    key: 'responseTime',
    label: 'Response time',
    description: 'Measured wall-clock time for each model request.',
    unit: 'ms',
  },
  {
    key: 'cost',
    label: 'API cost',
    description: 'Unavailable until current model-specific pricing is verified; no estimated billing amount is presented.',
    unit: '$',
  },
  {
    key: 'reliability',
    label: 'Reliability',
    description: 'Whether each model request completed successfully; this is not a quality score.',
    unit: '/100',
  },
];
const EMPTY_REQUEST: ResearchAgentRequest = {
  researchQuestion: '',
  opportunityCategory: '',
  targetAudience: '',
  additionalRequirements: '',
};

export default function Benchmark() {
  const [request, setRequest] = useState(EMPTY_REQUEST);
  const [run, setRun] = useState<BenchmarkRunResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agent2Result, setAgent2Result] = useState<ResearchAgentResult | null>(null);
  const [agent2Loading, setAgent2Loading] = useState(false);
  const [agent2Error, setAgent2Error] = useState<string | null>(null);
  const isBusy = loading || agent2Loading;

  const updateRequest = <K extends keyof ResearchAgentRequest>(
    key: K,
    value: ResearchAgentRequest[K]
  ) => setRequest((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setAgent2Result(null);
    setAgent2Error(null);
    setRun(null);
    try {
      setRun(await runBenchmark(request));
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'The benchmark could not be completed.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAgent2Only = async () => {
    if (isBusy) return;
    setAgent2Result(null);
    setAgent2Error(null);
    setError(null);
    if (
      !request.researchQuestion.trim() ||
      !request.opportunityCategory.trim() ||
      !request.targetAudience.trim()
    ) {
      setAgent2Error('Enter a research question, opportunity category, and target audience first.');
      return;
    }

    setAgent2Loading(true);
    try {
      setAgent2Result(await researchWithAgent2(request));
    } catch (requestError) {
      setAgent2Error(
        requestError instanceof Error ? requestError.message : 'Research Agent 2 could not complete the request.'
      );
    } finally {
      setAgent2Loading(false);
    }
  };

  return (
    <>
      <section className="py-16 md:py-24">
        <div className="page-container">
          <div className="max-w-3xl">
            <Eyebrow>BENCHMARK</Eyebrow>
            <h1 className="mt-6 text-5xl sm:text-6xl md:text-7xl">Compare AI agents</h1>
            <p className="mt-8 text-lg leading-[1.5] text-ink/80 md:text-xl">
              Send the same opportunity question and evaluation requirements to both Gemini models, then compare
              their live outputs. The live run requires Vercel server-side Tavily and Gemini API keys.
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
        <Eyebrow number="01">RUN A LIVE BENCHMARK</Eyebrow>
        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block font-extrabold">Research question</span>
              <textarea
                required
                maxLength={2000}
                value={request.researchQuestion}
                onChange={(event) => updateRequest('researchQuestion', event.target.value)}
                className="field-control min-h-32"
                placeholder="e.g. Which currently open STEM scholarships are available?"
              />
            </label>
            <label className="block">
              <span className="mb-2 block font-extrabold">Opportunity category</span>
              <input
                required
                maxLength={120}
                value={request.opportunityCategory}
                onChange={(event) => updateRequest('opportunityCategory', event.target.value)}
                className="field-control"
                placeholder="e.g. Scholarship"
              />
            </label>
            <label className="block">
              <span className="mb-2 block font-extrabold">Target audience</span>
              <input
                required
                maxLength={300}
                value={request.targetAudience}
                onChange={(event) => updateRequest('targetAudience', event.target.value)}
                className="field-control"
                placeholder="e.g. Undergraduate students in India"
              />
            </label>
            <label className="block">
              <span className="mb-2 block font-extrabold">Additional requirements (optional)</span>
              <textarea
                maxLength={3000}
                value={request.additionalRequirements}
                onChange={(event) => updateRequest('additionalRequirements', event.target.value)}
                className="field-control min-h-24"
                placeholder="Dates, location, eligibility preferences, or other constraints"
              />
            </label>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={isBusy}>
              {loading ? 'Running both agents…' : 'Run benchmark →'}
            </Button>
            <Button type="button" variant="secondary" onClick={handleAgent2Only} disabled={isBusy}>
              {agent2Loading ? 'Running Agent 2…' : 'Run Agent 2 only'}
            </Button>
          </div>
          {isBusy && (
            <p role="status" aria-live="polite" className="text-sm text-ink/75">
              {loading
                ? 'Running both agents with the same input. This may take a little while.'
                : 'Research Agent 2 is researching. This may take a little while.'}
            </p>
          )}
          {error && (
            <p role="alert" className="border border-error px-5 py-4 text-base text-error">
              {error}
            </p>
          )}
          {agent2Error && (
            <p role="alert" className="border border-error px-5 py-4 text-base text-error">
              {agent2Error}
            </p>
          )}
        </form>

        {agent2Result && (
          <div className="mt-12">
            <Eyebrow>INDEPENDENT AGENT 2 RUN · {agent2Result.status}</Eyebrow>
            <div className="mt-5">
              <ResearchResultCard
                agent={{
                  name: 'Research Agent 2',
                  research: agent2Result,
                  model: agent2Result.model,
                  usage: agent2Result.usage,
                }}
              />
            </div>
          </div>
        )}

        {run && (
          <div className="mt-14 space-y-10">
            <div className="border border-ink/20 bg-note p-5 md:p-6">
              <Eyebrow>LIVE RUN · {new Date(run.completedAt).toLocaleString()}</Eyebrow>
              <p className="mt-3 font-extrabold">{run.researchQuestion}</p>
              <p className="mt-3 text-sm leading-[1.5] text-ink/80">{run.rubric}</p>
            </div>

            <section aria-labelledby="live-agent-results">
              <h2 id="live-agent-results" className="text-2xl md:text-3xl">Agent status and scores</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {run.agents.map((agent) => (
                  <ScoreCard
                    key={agent.key}
                    agent={agent}
                    status={agent.status}
                    error={agent.error}
                  />
                ))}
              </div>
            </section>

            <section aria-labelledby="live-comparison">
              <h2 id="live-comparison" className="text-2xl md:text-3xl">Live metric comparison</h2>
              <div className="mt-6">
                <ComparisonTable metrics={LIVE_METRICS} agents={run.agents} />
              </div>
            </section>

            <section aria-labelledby="live-agent-output">
              <h2 id="live-agent-output" className="text-2xl md:text-3xl">Research outputs</h2>
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {run.agents.map((agent) => (
                  <ResearchResultCard key={agent.key} agent={agent} />
                ))}
              </div>
            </section>
          </div>
        )}
      </Section>

      <Section>
        <Eyebrow number="02">DEMO AGENTS · FICTIONAL DATA</Eyebrow>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {AGENTS.map((agent) => (
            <ScoreCard key={agent.key} agent={agent} showScore={false} />
          ))}
        </div>
      </Section>

      <Section>
        <Eyebrow number="03">DEMO METRICS</Eyebrow>
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
        <Eyebrow number="04">DEMO COMPARISON TABLE</Eyebrow>
        <div className="mt-10">
          <ComparisonTable metrics={METRICS} agents={AGENTS} />
        </div>
      </Section>

      <Section>
        <Eyebrow number="05">DEMO OVERALL SCORES</Eyebrow>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {AGENTS.map((agent) => (
            <ScoreCard key={agent.key} agent={agent} />
          ))}
        </div>
        <p className="mt-6 text-base leading-[1.5] text-ink/80">
          These fictional scores are for layout demonstration only. Live runs show individual checks instead of
          an overall score because structural completeness, keyword overlap, and source metadata do not establish
          factual quality. Response time and reliability are shown separately; cost and factual accuracy remain
          unavailable until independently verified.
        </p>
      </Section>

      <Section>
        <Eyebrow number="06">HOW IT WORKS</Eyebrow>
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
          <Eyebrow>SAMPLE DATA ONLY</Eyebrow>
          <p className="mt-4 text-lg leading-[1.5] text-ink">
            The comparison below is fictional sample data and is separate from any live benchmark run above.
          </p>
        </div>
      </Section>
    </>
  );
}
