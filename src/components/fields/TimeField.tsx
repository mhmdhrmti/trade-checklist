import { useId } from 'react';
import { Field } from '@/components/ui/Field';

interface TimeFieldProps {
  /** 24h `HH:mm`. */
  value: string;
  onChange: (time: string) => void;
  error?: string;
}

export function TimeField({ value, onChange, error }: TimeFieldProps) {
  const inputId = useId();
  return (
    <Field id="time" label="ساعت" htmlFor={inputId} error={error}>
      <input
        id={inputId}
        className="control"
        type="time"
        step={60}
        dir="ltr"
        value={value}
        aria-invalid={error ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}
