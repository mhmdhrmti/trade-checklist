import { describe, expect, it } from 'vitest';
import { createDraft } from '@/hooks/useTradeForm';
import { tradePayloadSchema } from './schema';
import { parseDecimal } from './number';
import { toPayload, validateDraft } from './validation';
import type { TradeDraft } from '@/types/trade';

const NOW = new Date('2026-11-03T10:00:00Z');

const complete = (overrides: Partial<TradeDraft> = {}): TradeDraft => ({
  ...createDraft(180, NOW),
  symbol: 'XAUUSD',
  setup: 'SP2L',
  session: 'London',
  timeWindow: '13–15:30',
  cycle: 'Spike',
  direction: 'Buy',
  outcome: 'SL',
  ...overrides,
});

describe('createDraft', () => {
  it('defaults to today and Istanbul time (UTC+3)', () => {
    const draft = createDraft(undefined, NOW);
    expect(draft).toMatchObject({ date: '2026-11-03', time: '13:00', utcOffset: 180 });
  });
});

describe('validateDraft', () => {
  it('requires every field except notes', () => {
    const errors = validateDraft(createDraft(180, NOW));
    expect(Object.keys(errors).sort()).toEqual(
      ['cycle', 'direction', 'outcome', 'session', 'setup', 'symbol', 'timeWindow'].sort(),
    );
  });

  it('accepts a complete SL trade without notes', () => {
    expect(validateDraft(complete())).toEqual({});
  });

  it('requires at least one valid R for TP outcomes', () => {
    expect(validateDraft(complete({ outcome: 'TP', tpEntries: [''] })).tpEntries).toBeTruthy();
    expect(validateDraft(complete({ outcome: 'TP', tpEntries: ['2', '0'] })).tpEntries).toBeTruthy();
    expect(validateDraft(complete({ outcome: 'TP', tpEntries: ['2', '۳'] }))).toEqual({});
  });
});

describe('toPayload + schema', () => {
  it('builds a payload the server schema accepts (Persian digits normalised)', () => {
    const payload = toPayload(complete({ outcome: 'TP', tpEntries: ['۱٫۵', '3'], checklist: ['breakout'], notes: ' hi ' }));
    expect(payload).toMatchObject({ outcome: 'TP', tpEntries: [1.5, 3], notes: 'hi' });
    expect(tradePayloadSchema.safeParse(payload).success).toBe(true);
  });

  it('drops TP entries for SL', () => {
    expect(toPayload(complete({ outcome: 'SL', tpEntries: ['2'] }))?.tpEntries).toEqual([]);
  });

  it('rejects tampered payloads on the server', () => {
    const base = toPayload(complete({ outcome: 'TP', tpEntries: ['2'] }));
    expect(base).not.toBeNull();
    const bad = [
      { ...base, symbol: 'EURUSD' },
      { ...base, tpEntries: [1, 2, 3, 4] },
      { ...base, tpEntries: [] },
      { ...base, outcome: 'SL' },
      { ...base, checklist: ['not-an-item'] },
      { ...base, utcOffsetMinutes: 181 },
      { ...base, date: '2026-13-40' },
    ];
    for (const payload of bad) expect(tradePayloadSchema.safeParse(payload).success).toBe(false);
  });
});

describe('parseDecimal', () => {
  it('parses plain, Persian and comma-decimal numbers only', () => {
    expect(parseDecimal('2.5')).toBe(2.5);
    expect(parseDecimal('۲٫۵')).toBe(2.5);
    expect(parseDecimal('2,5')).toBe(2.5);
    expect(parseDecimal('abc')).toBeNull();
    expect(parseDecimal('-1')).toBeNull();
    expect(parseDecimal('')).toBeNull();
  });
});
