import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/Button';
import Logo from '@/components/Logo';
import { NAV_ITEMS } from '@/data/navigation';

type MobileMenuProps = {
  onNavigate: () => void;
};

export default function MobileMenu({ onNavigate }: MobileMenuProps) {
  return (
    <div
      id="mobile-menu"
      className="absolute inset-x-0 top-full h-[calc(100vh-4rem)] overflow-y-auto border-b border-ink bg-paper md:hidden"
    >
      <nav aria-label="Mobile" className="page-container flex flex-col pb-10 pt-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className="group flex items-center justify-between border-t border-ink/20 py-5 text-2xl font-extrabold tracking-[-0.02em] text-ink transition-colors hover:text-accent"
          >
            {item.label}
            <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        ))}
        <div className="border-t border-ink/20 pt-8">
          <Button to="/prepare" className="w-full" size="md" variant="primary">
            Start a briefing
          </Button>
        </div>
        <div className="mt-auto pt-12">
          <Logo />
        </div>
      </nav>
    </div>
  );
}
