import { describe, expect, it } from 'vitest';
import { clockParts } from './time';
import { getTimeWindowOptions, windowLabelAt } from './timeWindows';

describe('time windows follow the selected UTC offset', () => {
  it('keeps the original labels at UTC+3', () => {
    expect(getTimeWindowOptions(180).map((o) => o.label)).toEqual([
      '10–13',
      '13–15:30',
      '15:30–16:30',
      '16:30–18',
      '18–21',
      '21–23',
    ]);
    expect(getTimeWindowOptions(180).every((o) => o.hint === undefined)).toBe(true);
  });

  it('shifts every window with the offset', () => {
    expect(windowLabelAt('10–13', 0)).toBe('7–10');
    expect(windowLabelAt('13–15:30', 0)).toBe('10–12:30');
    expect(windowLabelAt('21–23', 540)).toBe('3–5');
    expect(windowLabelAt('16:30–18', 210)).toBe('17–18:30');
  });

  it('wraps past midnight and keeps stable values + a UTC+3 hint', () => {
    expect(windowLabelAt('21–23', 720)).toBe('6–8');
    expect(windowLabelAt('21–23', 300)).toBe('23–1');
    const first = getTimeWindowOptions(0)[0]!;
    expect(first).toMatchObject({
      value: '10–13',
      label: '7–10',
      hint: 'UTC+3 · 10–13',
    });
  });
});

describe('clockParts', () => {
  it('reads the same instant on two clocks', () => {
    const now = new Date('2026-11-02T22:30:05Z');
    expect(clockParts(180, now)).toMatchObject({
      date: '2026-11-03',
      time: '01:30:05',
      utcTime: '22:30:05',
      weekday: 'Tuesday',
    });
    expect(clockParts(-300, now)).toMatchObject({
      date: '2026-11-02',
      time: '17:30:05',
      weekday: 'Monday',
    });
  });
});
