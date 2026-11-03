'use client';

import { useId, useRef, type FocusEvent } from 'react';
import { Field } from '@/components/ui/Field';
import { normalizeDigits } from '@/lib/number';
import styles from './TimeField.module.css';

interface TimeFieldProps {
  /** 24h `HH:mm` (may be partially typed while editing). */
  value: string;
  onChange: (time: string) => void;
  /** Fills the field with the current time of the selected UTC offset. */
  onNow: () => void;
  error?: string;
}

const clampPart = (raw: string, max: number) => {
  const digits = normalizeDigits(raw).replace(/\D/g, '').slice(0, 2);
  return digits.length === 2 && Number(digits) > max ? String(max) : digits;
};

/** 24-hour time entry (two boxes) so it always matches the 24h clock and window labels, whatever the browser locale. */
export function TimeField({ value, onChange, onNow, error }: TimeFieldProps) {
  const hourId = useId();
  const minuteRef = useRef<HTMLInputElement>(null);
  const [hour = '', minute = ''] = value.split(':');

  const setHour = (raw: string) => {
    const next = clampPart(raw, 23);
    onChange(`${next}:${minute}`);
    // Defer so the blur of this box runs after the new value has rendered.
    if (next.length === 2) setTimeout(() => minuteRef.current?.focus(), 0);
  };
  const setMinute = (raw: string) => onChange(`${hour}:${clampPart(raw, 59)}`);
  const padHour = (e: FocusEvent<HTMLInputElement>) => onChange(`${e.currentTarget.value.padStart(2, '0')}:${minute}`);
  const padMinute = (e: FocusEvent<HTMLInputElement>) => onChange(`${hour}:${e.currentTarget.value.padStart(2, '0')}`);

  const common = {
    type: 'text',
    inputMode: 'numeric' as const,
    maxLength: 2,
    autoComplete: 'off',
    'aria-invalid': error ? true : undefined,
    onFocus: (event: FocusEvent<HTMLInputElement>) => event.target.select(),
  };

  return (
    <Field id="time" label="ساعت (24h)" htmlFor={hourId} error={error}>
      <div className={styles.row}>
        <div className={`control ${styles.box}`} dir="ltr" role="group" aria-label="Time, 24-hour" data-invalid={error ? true : undefined}>
          <input {...common} id={hourId} className={styles.part} aria-label="Hour" onBlur={padHour} placeholder="HH" value={hour} onChange={(e) => setHour(e.target.value)} />
          <span className={styles.colon} aria-hidden="true">:</span>
          <input {...common} ref={minuteRef} className={styles.part} aria-label="Minute" onBlur={padMinute} placeholder="mm" value={minute} onChange={(e) => setMinute(e.target.value)} />
        </div>
        <button type="button" className={styles.now} onClick={onNow}>
          اکنون
        </button>
      </div>
    </Field>
  );
}
