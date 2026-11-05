import { describe, expect, it } from 'vitest';
import { formatOffset, isValidDate, nowInOffset, toUtc, UTC_OFFSET_OPTIONS } from './time';

describe('time helpers', () => {
  it('formats offsets', () => {
    expect(formatOffset(180)).toBe('UTC+3');
    expect(formatOffset(210)).toBe('UTC+3:30');
    expect(formatOffset(-300)).toBe('UTC-5');
    expect(formatOffset(0)).toBe('UTC+0');
  });

  it('includes Istanbul (UTC+3) as an option', () => {
    expect(UTC_OFFSET_OPTIONS.find((o) => o.value === 180)?.label).toBe('UTC+3 · Istanbul');
  });

  it('reads the clock of the chosen offset, crossing midnight', () => {
    const now = new Date('2026-11-02T22:30:00Z');
    expect(nowInOffset(180, now)).toEqual({
      date: '2026-11-03',
      time: '01:30',
    });
    expect(nowInOffset(0, now)).toEqual({ date: '2026-11-02', time: '22:30' });
    expect(nowInOffset(-300, now)).toEqual({
      date: '2026-11-02',
      time: '17:30',
    });
  });

  it('converts wall-clock time to UTC', () => {
    expect(toUtc('2026-11-03', '01:30', 180)).toEqual({
      date: '2026-11-02',
      time: '22:30',
    });
    expect(toUtc('2026-11-03', '14:00', 210)).toEqual({
      date: '2026-11-03',
      time: '10:30',
    });
  });

  it('validates calendar dates', () => {
    expect(isValidDate('2026-02-28')).toBe(true);
    expect(isValidDate('2026-02-30')).toBe(false);
    expect(isValidDate('26-02-01')).toBe(false);
  });
});
