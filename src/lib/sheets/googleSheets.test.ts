import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TradePayload } from '@/types/trade';

const calls: { url: string; method?: string; params?: unknown; data?: any }[] = [];
let existingTabs: string[] = [];
let headerPresent = false;
let failWith: number | null = null;

vi.mock('google-auth-library', () => ({
  JWT: class {
    async request(opts: { url: string; method?: string; params?: unknown; data?: any }) {
      calls.push(opts);
      if (failWith) throw Object.assign(new Error('boom'), { status: failWith });
      if (opts.url.endsWith('A1')) return { data: { values: headerPresent ? [['Date']] : undefined } };
      if (opts.url.includes(':batchUpdate') && opts.data?.requests?.[0]?.addSheet)
        return {
          data: { replies: [{ addSheet: { properties: { sheetId: 42 } } }] },
        };
      if (!opts.method && !opts.url.includes('/values/'))
        return {
          data: {
            sheets: existingTabs.map((title, i) => ({
              properties: { title, sheetId: i },
            })),
          },
        };
      return { data: {} };
    }
  },
}));

const payload: TradePayload = {
  date: '2026-11-03',
  time: '14:00',
  utcOffsetMinutes: 180,
  symbol: 'XAUUSD',
  setup: 'MicroMap',
  checklist: ['ema-confirmation'],
  session: 'London',
  timeWindow: '13–15:30',
  cycle: 'Spike',
  direction: 'Buy',
  outcome: 'SL',
  tpR: null,
  notes: '',
};

async function load() {
  vi.resetModules();
  return import('./googleSheets');
}

beforeEach(() => {
  calls.length = 0;
  existingTabs = [];
  headerPresent = false;
  failWith = null;
  process.env.GOOGLE_SHEET_ID = 'sheet123';
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'bot@x.iam.gserviceaccount.com';
  process.env.GOOGLE_PRIVATE_KEY = '"-----BEGIN-----\\nabc\\n-----END-----\\n"';
});

describe('appendTrade', () => {
  it('creates the setup tab, writes headers, then appends to that tab', async () => {
    const { appendTrade } = await load();
    await appendTrade(payload);
    const summary = calls.map((c) => `${c.method ?? 'GET'} ${decodeURIComponent(c.url).replace(/^.*sheet123/, '')}`);
    expect(summary[0]).toBe('GET ');
    expect(summary[1]).toBe('POST :batchUpdate');
    expect(calls[1]?.data.requests[0].addSheet.properties.title).toBe('MicroMap');
    expect(summary).toContain("PUT /values/'MicroMap'!A1");
    const header = calls.find((c) => c.method === 'PUT')?.data.values[0];
    expect(header).toContain('EMA Confirmation');
    const append = calls.at(-1)!;
    expect(decodeURIComponent(append.url)).toContain("/values/'MicroMap'!A:A:append");
    expect(append.params).toMatchObject({ valueInputOption: 'USER_ENTERED' });
    expect(append.data.values[0].length).toBe(header.length);
  });

  it('skips setup work for an existing tab with headers, and caches it', async () => {
    existingTabs = ['MicroMap'];
    headerPresent = true;
    const { appendTrade } = await load();
    await appendTrade(payload);
    expect(calls.some((c) => c.method === 'PUT')).toBe(false);
    const before = calls.length;
    await appendTrade(payload);
    expect(calls.length - before).toBe(1); // only the append
  });

  it('maps Google errors to API codes', async () => {
    const { appendTrade } = await load();
    failWith = 403;
    await expect(appendTrade(payload)).rejects.toMatchObject({
      code: 'sheets_forbidden',
    });
    failWith = 404;
    await expect(appendTrade(payload)).rejects.toMatchObject({
      code: 'sheets_not_found',
    });
    failWith = 500;
    await expect(appendTrade(payload)).rejects.toMatchObject({
      code: 'sheets_error',
    });
  });

  it('reports missing configuration', async () => {
    delete process.env.GOOGLE_SHEET_ID;
    const { appendTrade } = await load();
    await expect(appendTrade(payload)).rejects.toMatchObject({
      code: 'sheets_not_configured',
    });
  });
});
