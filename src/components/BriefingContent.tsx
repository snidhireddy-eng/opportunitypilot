
import BriefingSection from '@/components/BriefingSection';
import type { Briefing, BriefingNote } from '@/types/briefing';

type BriefingContentProps = {
  briefing: Briefing;
};

function PendingNote() {
  return (
    <p className="border border-ink/20 px-5 py-4 text-base leading-[1.5] text-ink/80">
      Live research is not connected yet. This part of the briefing will appear once research runs.
    </p>
  );
}

function NoteList({ items }: { items: BriefingNote[] }) {
  return (
    <ul className="border-b border-ink/20">
      {items.map((item, index) => (
        <li
          key={`${item.title}-${index}`}
          className="border-t border-ink/20 py-6"
        >
          <h3 className="text-xl md:text-2xl">{item.title}</h3>
          <p className="mt-2 text-base leading-[1.5] text-ink/80 md:text-lg">
            {item.detail}
          </p>
        </li>
      ))}
    </ul>
  );
}

export default function BriefingContent({
  briefing,
}: BriefingContentProps) {
  const { overview, inputs, research } = briefing;

  const overviewRows = [
    { label: 'Company / Organisation', value: overview.company },
    { label: 'Person you are meeting', value: overview.person },
    { label: 'Their role / designation', value: overview.designation },
    { label: 'Meeting type', value: overview.meetingType },
  ];

  const inputRows = inputs
    ? [
        { label: 'Purpose of the meeting', value: inputs.purpose },
        { label: 'Your background', value: inputs.background },
        { label: 'Additional goals or questions', value: inputs.goals },
      ]
    : [];

  return (
    <>
      <BriefingSection number="01" title="Meeting overview">
        <dl className="grid border-b border-ink/20 sm:grid-cols-2">
          {overviewRows.map((row) => (
            <div
              key={row.label}
              className="border-t border-ink/20 py-5"
            >
              <dt className="font-mono text-xs uppercase tracking-[0.15em] text-ink/65">
                {row.label}
              </dt>
              <dd className="mt-2 text-lg font-extrabold tracking-[-0.01em] text-ink">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        {inputRows.length > 0 && (
          <dl className="mt-10 space-y-6">
            {inputRows.map((row) => (
              <div
                key={row.label}
                className="border-t border-ink/20 pt-6"
              >
                <dt className="font-mono text-xs uppercase tracking-[0.15em] text-ink/65">
                  {row.label}
                </dt>
                <dd className="mt-3 whitespace-pre-line text-base leading-[1.5] text-ink">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </BriefingSection>

      <BriefingSection number="02" title="Company background">
        {research ? (
          <div className="space-y-5">
            {research.companyBackground.map((paragraph, index) => (
              <p
                key={index}
                className="text-lg leading-[1.5] text-ink/80"
              >
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          <PendingNote />
        )}
      </BriefingSection>

      <BriefingSection number="03" title="Key insights">
        {research ? (
          <NoteList items={research.keyInsights} />
        ) : (
          <PendingNote />
        )}
      </BriefingSection>

      <BriefingSection number="04" title="Suggested questions to ask">
        {research ? (
          <ol className="border-b border-ink/20">
            {research.suggestedQuestions.map((question, index) => (
              <li
                key={`${question}-${index}`}
                className="grid grid-cols-[3rem_1fr] gap-x-2 border-t border-ink/20 py-5"
              >
                <span className="font-mono text-sm text-accent">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-lg leading-[1.5] text-ink">
                  {question}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <PendingNote />
        )}
      </BriefingSection>

      <BriefingSection number="05" title="Personalised talking points">
        {research ? (
          <NoteList items={research.talkingPoints} />
        ) : (
          <PendingNote />
        )}
      </BriefingSection>

      <BriefingSection number="06" title="Information gaps">
        {research ? (
          (research.informationGaps?.length ?? 0) > 0 ? (
            <ul className="list-disc space-y-3 pl-6 text-base leading-[1.5] text-ink/80">
              {(research.informationGaps ?? []).map((gap, index) => (
                <li key={index}>{gap}</li>
              ))}
            </ul>
          ) : (
            <p className="text-base text-ink/70">
              No specific information gaps were identified.
            </p>
          )
        ) : (
          <PendingNote />
        )}
      </BriefingSection>

      <BriefingSection number="07" title="Sources">
        {research ? (
          <ul className="border-b border-ink/20">
            {research.sources.map((source, index) => (
              <li
                key={`${source.title}-${index}`}
                className="flex flex-col gap-2 border-t border-ink/20 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <div>
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg text-ink underline underline-offset-4"
                    >
                      {source.title}
                    </a>
                  ) : (
                    <span className="text-lg text-ink">
                      {source.title}
                    </span>
                  )}

                  {source.publishedDate && (
                    <p className="mt-2 text-xs text-ink/65">
                      Published: {source.publishedDate}
                    </p>
                  )}
                </div>

                <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink/65">
                  {source.publisher}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <PendingNote />
        )}
      </BriefingSection>
    </>
  );
}
