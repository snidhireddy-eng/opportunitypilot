import type { Agent } from '@/types/benchmark';

type ScoreCardProps = {
  agent: Agent;
  showScore?: boolean;
};

export default function ScoreCard({ agent, showScore = true }: ScoreCardProps) {
  return (
    <article className="flex flex-col border border-ink/20 p-6 md:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h3 className="text-2xl md:text-3xl">{agent.name}</h3>
          <p className="mt-2 text-base leading-[1.5] text-ink/80">{agent.tagline}</p>
        </div>
        {showScore && (
          <div className="text-right">
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-ink/65">Overall</span>
            <p className="mt-1 font-sans text-4xl font-extrabold tracking-[-0.02em] text-accent md:text-5xl">
              {agent.overall}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
