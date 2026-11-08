import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type ButtonProps = {
  children: ReactNode;
  to?: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'md' | 'sm';
  className?: string;
};

const BASE =
  'inline-flex items-center justify-center gap-2 border font-sans font-extrabold tracking-tight transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60';

const VARIANTS = {
  primary: 'border-ink bg-ink text-paper hover:bg-ink/85',
  secondary: 'border-ink bg-transparent text-ink hover:bg-ink hover:text-paper',
};

const SIZES = {
  md: 'px-6 py-3.5 text-base',
  sm: 'px-5 py-2.5 text-sm',
};

export default function Button({
  children,
  to,
  type = 'button',
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
}: ButtonProps) {
  const classes = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
