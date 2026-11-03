'use client';

import { useCallback, useId, useRef, useState } from 'react';
import { Calendar } from '@/components/ui/Calendar';
import { Field } from '@/components/ui/Field';
import { useDismiss } from '@/hooks/useDismiss';
import { nowInOffset } from '@/lib/time';
import styles from './DateField.module.css';

interface DateFieldProps {
  value: string;
  onChange: (date: string) => void;
  /** UTC offset (minutes) used to decide what "today" is. */
  utcOffset: number;
  error?: string;
}

const weekdayFormat = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' });

/** Gregorian date picker. Custom (not `<input type="date">`) so a Persian-locale browser can never switch it to the Jalali calendar. */
export function DateField({ value, onChange, utcOffset, error }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonId = useId();
  const today = nowInOffset(utcOffset).date;

  const close = useCallback(() => setOpen(false), []);
  useDismiss(rootRef, open, close);

  const select = (date: string) => {
    onChange(date);
    setOpen(false);
  };

  const weekday = value ? weekdayFormat.format(new Date(`${value}T00:00:00Z`)) : '';

  return (
    <Field id="date" label="تاریخ" htmlFor={buttonId} error={error}>
      <div className={styles.root} ref={rootRef}>
        <button
          id={buttonId}
          type="button"
          className={`control ${styles.trigger}`}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-invalid={error ? true : undefined}
          onClick={() => setOpen((o) => !o)}
        >
          <span dir="ltr">{value || '—'}</span>
          {weekday && <small className={styles.weekday}>{weekday}</small>}
        </button>

        {open && (
          <div className={styles.popover} role="dialog" aria-label="Select date">
            <Calendar value={value} today={today} onSelect={select} />
            <button type="button" className={styles.today} onClick={() => select(today)}>
              Today
            </button>
          </div>
        )}
      </div>
    </Field>
  );
}
