import { ChevronDown } from 'lucide-react';
import FormField from '@/components/FormField';

type SelectFieldProps<T extends string> = {
  id: string;
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  error?: string;
};

export default function SelectField<T extends string>({
  id,
  label,
  value,
  onChange,
  options,
  error,
}: SelectFieldProps<T>) {
  return (
    <FormField id={id} label={label} required error={error}>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="field-control h-12 cursor-pointer appearance-none pr-12"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink"
          aria-hidden="true"
        />
      </div>
    </FormField>
  );
}
