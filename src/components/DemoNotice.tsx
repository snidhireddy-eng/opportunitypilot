
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
        DEMO DATA — Live research is not connected yet.
      </p>

      <p className="mt-2 text-base leading-[1.5] text-ink">
        Every name, fact and source on this page is fictional.
      </p>
    </div>
  );
}
