import type { ReactNode } from 'react';
import Section from '@/components/Section';

type BriefingSectionProps = {
  number: string;
  title: string;
  children: ReactNode;
};

export default function BriefingSection({ number, title, children }: BriefingSectionProps) {
  return (
    <Section>
      <div className="grid gap-8 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-4">
          <p className="font-mono text-base text-accent">{number}</p>
          <h2 className="mt-3 text-3xl md:text-4xl">{title}</h2>
        </div>
        <div className="md:col-span-8">{children}</div>
      </div>
    </Section>
  );
}
