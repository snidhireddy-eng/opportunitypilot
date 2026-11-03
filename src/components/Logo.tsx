import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5" aria-label="OpportunityPilot home">
      <span className="flex h-8 w-8 items-center justify-center bg-ink font-sans text-sm font-extrabold tracking-tight text-paper">
        OP
      </span>
      <span className="text-lg font-extrabold tracking-[-0.02em] text-ink">
        Opportunity<span className="text-accent">Pilot</span>
      </span>
    </Link>
  );
}
