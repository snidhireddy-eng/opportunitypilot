import type { ReactNode } from 'react';

type EyebrowProps = {
  children: ReactNode;
  number?: string;
  className?: string;
};

export default function Eyebrow({ children, number, className = '' }: EyebrowProps) {
  return (
    <p
      className={`font-mono text-xs uppercase tracking-[0.18em] text-ink/65 ${className}`}
    >
      {number && <span className="mr-3 text-base text-accent">{number}</span>}
      {children}
    </p>
  );
}
