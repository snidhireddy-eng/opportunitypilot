import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Button from '@/components/Button';
import Logo from '@/components/Logo';
import MobileMenu from '@/components/MobileMenu';
import { NAV_ITEMS } from '@/data/navigation';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-ink bg-paper print:hidden">
      <div className="page-container flex h-16 items-center justify-between md:h-20">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `border-b-2 pb-1 font-mono text-xs uppercase tracking-[0.15em] transition-colors ${
                  isActive
                    ? 'border-accent text-ink'
                    : 'border-transparent text-ink/65 hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Button to="/prepare" size="sm">
            Start a briefing
          </Button>
        </nav>

        <button
          type="button"
          className="-mr-2 flex h-11 w-11 items-center justify-center text-ink md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </div>

      {menuOpen && <MobileMenu onNavigate={closeMenu} />}
    </header>
  );
}
