import Eyebrow from '@/components/Eyebrow';
import Section from '@/components/Section';

type PagePlaceholderProps = {
  label: string;
  heading: string;
};

export default function PagePlaceholder({ label, heading }: PagePlaceholderProps) {
  return (
    <Section>
      <Eyebrow>{label}</Eyebrow>
      <h1 className="mt-6 text-5xl md:text-7xl">{heading}</h1>
      <p className="mt-8 text-lg text-ink/65">This page is built in the next step.</p>
    </Section>
  );
}
