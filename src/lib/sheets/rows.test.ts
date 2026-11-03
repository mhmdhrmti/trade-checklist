import { describe, expect, it } from 'vitest';
import { SETUP_VALUES } from '@/config/options';
import type { TradePayload } from '@/types/trade';
import { asText, buildHeaders, buildRow } from './rows';

const payload = (overrides: Partial<TradePayload> = {}): TradePayload => ({
  date: '2026-11-03',
  time: '01:30',
  utcOffsetMinutes: 180,
  symbol: 'US30USD',
  setup: 'Pro BTB',
  checklist: ['valid-sp2l-leg', 'with-the-trend'],
  session: 'New York',
  timeWindow: '16:30–18',
  cycle: 'Trading Range',
  direction: 'Sell',
  outcome: 'TP',
  tpEntries: [1.5, 3],
  notes: '=HYPERLINK("http://x")',
  ...overrides,
});

describe('sheet rows', () => {
  it('writes the window as read on the chosen clock plus the UTC+3 original', () => {
    const headers = buildHeaders('SP2L');
    const row = buildRow(payload({ setup: 'SP2L', utcOffsetMinutes: 0, timeWindow: '13–15:30', checklist: [] }));
    expect(row[headers.indexOf('Time Window')]).toBe("'10–12:30");
    expect(row[headers.indexOf('Time Window (UTC+3)')]).toBe("'13–15:30");
  });

  it('keeps headers and rows the same width for every setup', () => {
    for (const setup of SETUP_VALUES) {
      expect(buildRow(payload({ setup, checklist: [] })).length).toBe(buildHeaders(setup).length);
    }
  });

  it('uses one checklist column per item', () => {
    expect(buildHeaders('MicroMap').slice(15, 18)).toEqual(['Valid SP2L Leg', 'EMA Confirmation', 'With the Trend']);
    expect(buildHeaders('SP2L')).toContain('Follow-through Candle');
  });

  it('writes local + UTC time, TP entries and ticked items', () => {
    const headers = buildHeaders('Pro BTB');
    const row = buildRow(payload(), new Date('2026-11-03T05:06:07Z'));
    const cell = (name: string) => row[headers.indexOf(name)];
    expect(cell('Date')).toBe('2026-11-03');
    expect(cell('Time')).toBe('01:30');
    expect(cell('UTC DateTime')).toBe('2026-11-02 22:30');
    expect(cell('TP1 (R)')).toBe(1.5);
    expect(cell('TP2 (R)')).toBe(3);
    expect(cell('TP3 (R)')).toBe('');
    expect(cell('Time Window')).toBe("'16:30–18"); // leading ' keeps Sheets from re-parsing it; Sheets strips it
    expect(cell('Valid SP2L Leg')).toBe('✓');
    expect(cell('EMA Confirmation')).toBe('✗');
    expect(cell('Logged At (UTC)')).toBe('2026-11-03 05:06:07');
  });

  it('blocks formula injection and date coercion in text cells', () => {
    expect(asText('=1+1')).toBe("'=1+1");
    expect(asText('10–13')).toBe("'10–13");
    expect(asText('')).toBe('');
    expect(asText('London')).toBe('London');
    const row = buildRow(payload());
    expect(row[row.length - 2]).toBe(`'=HYPERLINK("http://x")`);
  });

  it('leaves TP columns empty for SL', () => {
    const headers = buildHeaders('SP2L');
    const row = buildRow(payload({ setup: 'SP2L', outcome: 'SL', tpEntries: [], checklist: [] }));
    expect(['TP1 (R)', 'TP2 (R)', 'TP3 (R)'].map((h) => row[headers.indexOf(h)])).toEqual(['', '', '']);
  });
});
