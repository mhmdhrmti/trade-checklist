'use client';

import { useEffect, useState } from 'react';
import { clockParts, offsetLabel } from '@/lib/time';
import { ClockIcon } from './icons';
import styles from './LiveClock.module.css';

interface LiveClockProps {
  /** UTC offset in minutes of the clock to show. */
  utcOffset: number;
}

/** Ticks once per second, aligned to the system second boundary. Renders a placeholder until mounted (no hydration mismatch). */
export function LiveClock({ utcOffset }: LiveClockProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let timer: number;
    const tick = () => {
      setNow(new Date());
      timer = window.setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    tick();
    return () => window.clearTimeout(timer);
  }, []);

  const parts = now ? clockParts(utcOffset, now) : null;
  const [hours = '--', minutes = '--', seconds = '--'] = parts?.time.split(':') ?? [];

  return (
    <div className={styles.clock} role="timer" aria-label="ساعت زنده">
      <p className={styles.caption}>
        <ClockIcon width={16} height={16} />
        <span>ساعت زنده</span>
        <span className={styles.zone} dir="ltr">
          {offsetLabel(utcOffset)}
        </span>
      </p>
      <p className={styles.time} dir="ltr">
        <span>{hours}</span>
        <span className={styles.colon}>:</span>
        <span>{minutes}</span>
        <span className={styles.colon}>:</span>
        <span className={styles.seconds}>{seconds}</span>
      </p>
      <p className={styles.meta} dir="ltr">
        <span>{parts ? `${parts.weekday} · ${parts.date}` : ' '}</span>
        <span className={styles.utc}>UTC {parts?.utcTime ?? '--:--:--'}</span>
      </p>
    </div>
  );
}
