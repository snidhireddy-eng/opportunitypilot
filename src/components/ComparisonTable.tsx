import type { Agent, Metric } from '@/types/benchmark';

type ComparisonTableProps = {
  metrics: Metric[];
  agents: Agent[];
};

function formatScore(value: number, unit: string) {
  if (unit === '$') {
    return `$${value.toFixed(2)}`;
  }
  if (unit === 's') {
    return `${value}s`;
  }
  return `${value}${unit}`;
}

function isLowerBetter(unit: string) {
  return unit === 's' || unit === '$';
}

function highlightClass(isBest: boolean) {
  return isBest ? 'text-accent' : '';
}

export default function ComparisonTable({ metrics, agents }: ComparisonTableProps) {
  const bestByMetric = new Map<string, number>();
  for (const metric of metrics) {
    const scores = agents.map((agent) => {
      const entry = agent.scores.find((score) => score.metric === metric.key);
      return entry ? entry.score : 0;
    });
    const best = isLowerBetter(metric.unit) ? Math.min(...scores) : Math.max(...scores);
    bestByMetric.set(metric.key, best);
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-ink">
              <th scope="col" className="py-4 pr-4 font-mono text-xs uppercase tracking-[0.15em] text-ink/65">
                Metric
              </th>
              {agents.map((agent) => (
                <th
                  key={agent.key}
                  scope="col"
                  className="py-4 pl-4 font-sans text-lg font-extrabold tracking-[-0.01em] text-ink"
                >
                  {agent.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.key} className="border-t border-ink/20">
                <th scope="row" className="py-5 pr-4 text-left text-base font-extrabold tracking-tight text-ink align-top">
                  {metric.label}
                </th>
                {agents.map((agent) => {
                  const entry = agent.scores.find((score) => score.metric === metric.key);
                  if (!entry) {
                    return (
                      <td key={agent.key} className="py-5 pl-4 text-base text-ink/65">
                        &mdash;
                      </td>
                    );
                  }
                  const isBest = entry.score === bestByMetric.get(metric.key);
                  return (
                    <td
                      key={agent.key}
                      className={`py-5 pl-4 font-mono text-base ${highlightClass(isBest)}`}
                    >
                      {formatScore(entry.score, entry.unit)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-6 font-mono text-xs uppercase tracking-[0.12em] text-ink/65">
        Orange values mark the stronger result for each metric. For response time and cost, lower is better.
      </p>
    </>
  );
}
