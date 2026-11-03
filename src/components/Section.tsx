import type { ReactNode } from 'react';

type SectionProps = {
  children: ReactNode;
};

export default function Section({ children }: SectionProps) {
  return (
    <section className="border-t border-ink/20 py-16 md:py-24">
      <div className="page-container">{children}</div>
    </section>
  );
}
