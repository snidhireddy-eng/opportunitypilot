import type { ResearchOutput, ResearchTokenUsage } from '@/types/agent2';

type ResearchResultCardProps = {
  agent: {
    name: string;
    research: ResearchOutput | null;
    model: string | null;
    usage: ResearchTokenUsage | null;
  };
};

export default function ResearchResultCard({ agent }: ResearchResultCardProps) {
  if (!agent.research) return null;

  const result = agent.research;
  const promptTokens = agent.usage?.promptTokens;
  const responseTokens = agent.usage?.responseTokens;

  return (
    <article className="space-y-7 border border-ink/20 p-6 md:p-8">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-ink/65">{agent.name} output</p>
        <h3 className="mt-3 text-2xl md:text-3xl">{result.title}</h3>
        <p className="mt-4 text-base leading-[1.5] text-ink/80">{result.executiveSummary}</p>
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.1em] text-ink/65">
          {agent.model ? `${agent.model} · ` : ''}
          {promptTokens !== undefined && responseTokens !== undefined
            ? `${promptTokens + responseTokens} tokens`
            : 'Token usage unavailable'}
        </p>
      </header>

      <section>
        <h4 className="text-lg">Key findings</h4>
        {result.keyFindings.length > 0 ? (
          <ul className="mt-3 space-y-4">
            {result.keyFindings.map((finding, index) => (
              <li key={`${finding.title}-${index}`}>
                <h5 className="font-extrabold">{finding.title}</h5>
                <p className="mt-1 text-sm leading-[1.5] text-ink/80">{finding.detail}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink/70">No findings were returned.</p>
        )}
      </section>

      {(result.eligibilityCriteria.length > 0 || result.deadlines.length > 0) && (
        <section className="grid gap-6 sm:grid-cols-2">
          {result.eligibilityCriteria.length > 0 && (
            <div>
              <h4 className="text-lg">Eligibility</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/80">
                {result.eligibilityCriteria.map((criterion, index) => (
                  <li key={`${criterion}-${index}`}>{criterion}</li>
                ))}
              </ul>
            </div>
          )}
          {result.deadlines.length > 0 && (
            <div>
              <h4 className="text-lg">Deadlines</h4>
              <ul className="mt-2 space-y-2 text-sm text-ink/80">
                {result.deadlines.map((deadline, index) => (
                  <li key={`${deadline.name}-${index}`}>
                    <strong>{deadline.name}: {deadline.date}</strong>
                    <p>{deadline.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {result.uncertainInformation.length > 0 && (
        <section>
          <h4 className="text-lg">Uncertain or missing information</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/80">
            {result.uncertainInformation.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h4 className="text-lg">Source links</h4>
        {result.sources.length > 0 ? (
          <ul className="mt-2 space-y-2 text-sm">
            {result.sources.map((source, index) => (
              <li key={`${source.url}-${index}`}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent underline underline-offset-2"
                >
                  {source.title || source.url}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink/70">No source links were returned.</p>
        )}
      </section>

      {result.grounding &&
        (result.grounding.webSearchQueries.length > 0 || result.grounding.supports.length > 0) && (
          <section>
            <h4 className="text-lg">Google Search grounding</h4>
            {result.grounding.webSearchQueries.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/80">
                {result.grounding.webSearchQueries.map((query, index) => (
                  <li key={`${query}-${index}`}>{query}</li>
                ))}
              </ul>
            )}
            {result.grounding.supports.length > 0 && (
              <ul className="mt-4 space-y-3 text-sm text-ink/80">
                {result.grounding.supports.map((support, index) => {
                  const supportingSources = support.sourceIndices
                    .map((sourceIndex) =>
                      result.sources.find((source) => source.groundingChunkIndex === sourceIndex)
                    )
                    .filter((source) => source !== undefined);
                  return (
                    <li key={`${support.text}-${index}`}>
                      {support.text && <p>{support.text}</p>}
                      {supportingSources.length > 0 && (
                        <ul className="mt-1 list-disc pl-5">
                          {supportingSources.map((source) => (
                            <li key={source.url}>
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-accent underline underline-offset-2"
                              >
                                {source.title || source.url}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}
    </article>
  );
}
