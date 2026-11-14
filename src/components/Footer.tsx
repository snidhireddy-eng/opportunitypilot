import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Logo from '@/components/Logo';

const PRODUCT_LINKS = [
  { label: 'Prepare', to: '/prepare' },
  { label: 'Meeting briefing', to: '/briefing' },
  { label: 'Agent benchmarking', to: '/benchmark' },
];

const COMPANY_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
];

type LinkColumnProps = {
  title: string;
  links: { label: string; to: string }[];
};

function LinkColumn({ title, links }: LinkColumnProps) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink/65">{title}</p>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="group inline-flex items-center gap-2 text-base text-ink transition-colors hover:text-accent"
            >
              {link.label}
              <ArrowRight
                className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-ink print:hidden">
      <div className="page-container py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-6">
            <Logo />
            <p className="mt-6 max-w-md text-lg leading-[1.5] text-ink/80">
              Research the room before you walk into it. Compare the agents that do the research.
            </p>
          </div>
          <div className="md:col-span-3">
            <LinkColumn title="Product" links={PRODUCT_LINKS} />
          </div>
          <div className="md:col-span-3">
            <LinkColumn title="Company" links={COMPANY_LINKS} />
          </div>
        </div>
      </div>
    </footer>
  );
}
