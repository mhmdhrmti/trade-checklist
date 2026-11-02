/** UTC offset in minutes of Istanbul (UTC+3) — the app's default. */
export const DEFAULT_UTC_OFFSET = 180;

export interface UtcOffsetOption {
  /** Offset in minutes. */
  value: number;
  label: string;
}

const pad = (n: number, length = 2) => String(n).padStart(length, '0');

/** `180` → `UTC+3`, `210` → `UTC+3:30`, `-300` → `UTC-5`, `0` → `UTC+0`. */
export function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}${m ? `:${pad(m)}` : ''}`;
}

const OFFSET_HINTS: Record<number, string> = {
  [-300]: 'New York (winter)',
  [-240]: 'New York (summer)',
  0: 'GMT / London (winter)',
  60: 'London (summer)',
  180: 'Istanbul',
  210: 'Tehran',
  240: 'Dubai',
  540: 'Tokyo',
};

const HALF_HOUR_OFFSETS = [-210, 210, 270, 330, 345, 570];

export const UTC_OFFSET_OPTIONS: readonly UtcOffsetOption[] = [
  ...Array.from({ length: 27 }, (_, i) => (i - 12) * 60),
  ...HALF_HOUR_OFFSETS,
]
  .sort((a, b) => a - b)
  .map((value) => {
    const hint = OFFSET_HINTS[value];
    return { value, label: hint ? `${formatOffset(value)} · ${hint}` : formatOffset(value) };
  });

/** Today's date and current time as seen on a clock set to the given UTC offset. */
export function nowInOffset(offsetMinutes: number, now: Date = new Date()): { date: string; time: string } {
  const shifted = new Date(now.getTime() + offsetMinutes * 60_000);
  return {
    date: `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`,
    time: `${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}`,
  };
}

/** True for a real Gregorian calendar date in `YYYY-MM-DD` form. */
export function isValidDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

export const isValidTime = (value: string): boolean => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

/** Converts a wall-clock date/time in `offsetMinutes` to UTC. */
export function toUtc(date: string, time: string, offsetMinutes: number): { date: string; time: string } {
  const [y = 0, m = 1, d = 1] = date.split('-').map(Number);
  const [hh = 0, mm = 0] = time.split(':').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, hh, mm) - offsetMinutes * 60_000);
  return {
    date: `${utc.getUTCFullYear()}-${pad(utc.getUTCMonth() + 1)}-${pad(utc.getUTCDate())}`,
    time: `${pad(utc.getUTCHours())}:${pad(utc.getUTCMinutes())}`,
  };
}
