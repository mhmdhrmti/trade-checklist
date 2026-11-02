'use client';

import { useState } from 'react';
import styles from './Calendar.module.css';

interface CalendarProps {
  /** Selected date, `YYYY-MM-DD` (may be empty). */
  value: string;
  /** Highlighted as "today", `YYYY-MM-DD`. */
  today: string;
  onSelect: (date: string) => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthFormat = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

const pad = (n: number) => String(n).padStart(2, '0');
const toIso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

function parseMonth(date: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})/.exec(date);
  return match ? { year: Number(match[1]), month: Number(match[2]) - 1 } : null;
}

/** Gregorian month grid (Monday-first). Always LTR so month arrows and weekday order read naturally. */
export function Calendar({ value, today, onSelect }: CalendarProps) {
  const [view, setView] = useState(() => parseMonth(value) ?? parseMonth(today) ?? { year: 2026, month: 0 });

  const shiftMonth = (delta: number) =>
    setView(({ year, month }) => {
      const d = new Date(Date.UTC(year, month + delta, 1));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    });

  const leadingBlanks = (new Date(Date.UTC(view.year, view.month, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate();

  return (
    <div className={styles.calendar} dir="ltr">
      <div className={styles.header}>
        <button type="button" className={styles.nav} onClick={() => shiftMonth(-1)} aria-label="Previous month">
          ‹
        </button>
        <strong aria-live="polite">{monthFormat.format(new Date(Date.UTC(view.year, view.month, 1)))}</strong>
        <button type="button" className={styles.nav} onClick={() => shiftMonth(1)} aria-label="Next month">
          ›
        </button>
      </div>

      <div className={styles.grid}>
        {WEEKDAYS.map((day) => (
          <span key={day} className={styles.weekday}>
            {day}
          </span>
        ))}
        {Array.from({ length: leadingBlanks }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const iso = toIso(view.year, view.month, i + 1);
          return (
            <button
              key={iso}
              type="button"
              className={styles.day}
              data-selected={iso === value || undefined}
              data-today={iso === today || undefined}
              aria-label={iso}
              aria-pressed={iso === value}
              aria-current={iso === today ? 'date' : undefined}
              onClick={() => onSelect(iso)}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
