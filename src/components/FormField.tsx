import type { ReactNode } from 'react';

type FormFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
};

export default function FormField({ id, label, required = false, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-base font-extrabold tracking-tight">
          {label}
        </label>
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink/65">
          {required ? 'Required' : 'Optional'}
        </span>
      </div>
      <div className="mt-3">{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm leading-[1.5] text-error">
          {error}
        </p>
      )}
    </div>
  );
}
