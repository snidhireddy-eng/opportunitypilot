import Button from '@/components/Button';
import Eyebrow from '@/components/Eyebrow';
import Section from '@/components/Section';

export default function NotFound() {
  return (
    <Section>
      <Eyebrow>ERROR 404</Eyebrow>
      <h1 className="mt-6 text-5xl md:text-7xl">Page not found</h1>
      <p className="mt-8 text-lg text-ink/65">The page you are looking for does not exist.</p>
      <div className="mt-10">
        <Button to="/">Back to home →</Button>
      </div>
    </Section>
  );
}
