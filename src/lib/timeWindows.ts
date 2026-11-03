import { TIME_WINDOW_OPTIONS, TIME_WINDOW_RANGES, type Option, type TimeWindow } from '@/config/options';
import { DEFAULT_UTC_OFFSET } from './time';

const DAY = 1440;
const wrap = (minutes: number) => ((minutes % DAY) + DAY) % DAY;

/** `600` → `10`, `930` → `15:30`. */
function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}:${String(m).padStart(2, '0')}` : String(h);
}

/** The window as it reads on a clock set to `offsetMinutes` (windows are defined on UTC+3). */
export function windowLabelAt(window: TimeWindow, offsetMinutes: number): string {
  const [start, end] = TIME_WINDOW_RANGES[window];
  const delta = offsetMinutes - DEFAULT_UTC_OFFSET;
  return `${formatMinutes(wrap(start + delta))}–${formatMinutes(wrap(end + delta))}`;
}

/** Chip options for the time-window picker: stable values, labels shifted to the chosen offset. */
export function getTimeWindowOptions(offsetMinutes: number): Option<TimeWindow>[] {
  const shifted = offsetMinutes !== DEFAULT_UTC_OFFSET;
  return TIME_WINDOW_OPTIONS.map((option) => ({
    value: option.value,
    label: windowLabelAt(option.value, offsetMinutes),
    hint: shifted ? `UTC+3 · ${option.label}` : undefined,
  }));
}
