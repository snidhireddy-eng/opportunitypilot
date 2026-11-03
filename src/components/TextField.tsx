import FormField from '@/components/FormField';

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  multiline?: boolean;
  error?: string;
};

export default function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  required = false,
  multiline = false,
  error,
}: TextFieldProps) {
  const describedBy = error ? `${id}-error` : undefined;
  const invalid = error ? 'true' : undefined;

  return (
    <FormField id={id} label={label} required={required} error={error}>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          required={required}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          rows={4}
          className="field-control min-h-32 resize-y leading-[1.5]"
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          required={required}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          autoComplete="off"
          className="field-control h-12"
        />
      )}
    </FormField>
  );
}
