
type DemoNoticeProps = {
  isSample: boolean;
};

export default function DemoNotice({ isSample }: DemoNoticeProps) {
  if (!isSample) {
    return null;
  }

  return (
    <div
      role="note"
      className="border border-ink bg-note px-5 py-4 md:px-6 md:py-5"
    >
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-ink">
        ILLUSTRATIVE EXAMPLE — Not live research.
      </p>

      <p className="mt-2 text-base leading-[1.5] text-ink">
        The names, details and sources shown here are placeholders for layout demonstration.
      </p>
    </div>
  );
}
