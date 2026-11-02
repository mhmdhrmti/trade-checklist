import { JWT } from 'google-auth-library';
import type { ApiErrorCode, TradePayload } from '@/types/trade';
import { buildHeaders, buildRow, sheetNameForSetup } from './rows';

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export class SheetsError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'SheetsError';
  }
}

interface SheetsConfig {
  sheetId: string;
  email: string;
  privateKey: string;
}

function readConfig(): SheetsConfig {
  const sheetId = process.env.GOOGLE_SHEET_ID?.trim();
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  // Hosting dashboards store the key on one line with literal "\n" and sometimes wrap it in quotes.
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.trim().replace(/^"|"$/g, '').replace(/\\n/g, '\n');
  if (!sheetId || !email || !privateKey) throw new SheetsError('sheets_not_configured');
  return { sheetId, email, privateKey };
}

let cachedClient: { key: string; client: JWT } | null = null;

function getClient({ email, privateKey }: SheetsConfig): JWT {
  const key = `${email}:${privateKey.length}`;
  if (cachedClient?.key !== key) {
    cachedClient = { key, client: new JWT({ email, key: privateKey, scopes: SCOPES }) };
  }
  return cachedClient.client;
}

/** Tabs whose existence and header row were already confirmed by this server instance. */
const preparedTabs = new Set<string>();

const quoteTab = (tab: string) => `'${tab.replace(/'/g, "''")}'`;
const rangeUrl = (base: string, range: string) => `${base}/values/${encodeURIComponent(range)}`;

function toSheetsError(error: unknown): SheetsError {
  if (error instanceof SheetsError) return error;
  const status = (error as { status?: number; response?: { status?: number } }).status
    ?? (error as { response?: { status?: number } }).response?.status;
  if (status === 403) return new SheetsError('sheets_forbidden');
  if (status === 404) return new SheetsError('sheets_not_found');
  return new SheetsError('sheets_error', error instanceof Error ? error.message : undefined);
}

interface SpreadsheetMeta {
  sheets?: { properties?: { sheetId?: number; title?: string } }[];
}

/** Makes sure the tab exists and has its header row (bold, frozen). Safe to call repeatedly. */
async function ensureTab(client: JWT, base: string, tab: string, headers: string[]): Promise<void> {
  const cacheKey = `${base}|${tab}`;
  if (preparedTabs.has(cacheKey)) return;

  const meta = await client.request<SpreadsheetMeta>({
    url: base,
    params: { fields: 'sheets.properties(sheetId,title)' },
  });
  let sheetId = meta.data.sheets?.find((s) => s.properties?.title === tab)?.properties?.sheetId;

  if (sheetId === undefined) {
    const created = await client.request<{ replies?: { addSheet?: { properties?: { sheetId?: number } } }[] }>({
      url: `${base}:batchUpdate`,
      method: 'POST',
      data: { requests: [{ addSheet: { properties: { title: tab } } }] },
    });
    sheetId = created.data.replies?.[0]?.addSheet?.properties?.sheetId;
  }

  const firstCell = await client.request<{ values?: string[][] }>({
    url: rangeUrl(base, `${quoteTab(tab)}!A1`),
  });
  if (!firstCell.data.values?.[0]?.[0]) {
    await client.request({
      url: rangeUrl(base, `${quoteTab(tab)}!A1`),
      method: 'PUT',
      params: { valueInputOption: 'RAW' },
      data: { values: [headers] },
    });
    if (sheetId !== undefined) await styleHeader(client, base, sheetId, headers.length);
  }

  preparedTabs.add(cacheKey);
}

/** Bold + frozen header row. Cosmetic, so a failure here never blocks logging a trade. */
async function styleHeader(client: JWT, base: string, sheetId: number, columns: number): Promise<void> {
  try {
    await client.request({
      url: `${base}:batchUpdate`,
      method: 'POST',
      data: {
        requests: [
          { updateSheetProperties: { properties: { sheetId, gridProperties: { frozenRowCount: 1 } }, fields: 'gridProperties.frozenRowCount' } },
          {
            repeatCell: {
              range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: columns },
              cell: { userEnteredFormat: { textFormat: { bold: true } } },
              fields: 'userEnteredFormat.textFormat.bold',
            },
          },
        ],
      },
    });
  } catch {
    /* cosmetic only */
  }
}

/** Appends a trade to the tab that matches its setup (SP2L / Pro BTB / MicroMap). */
export async function appendTrade(payload: TradePayload): Promise<void> {
  const config = readConfig();
  const client = getClient(config);
  const base = `${SHEETS_API}/${encodeURIComponent(config.sheetId)}`;
  const tab = sheetNameForSetup(payload.setup);

  try {
    await ensureTab(client, base, tab, buildHeaders(payload.setup));
    await client.request({
      url: `${rangeUrl(base, `${quoteTab(tab)}!A:A`)}:append`,
      method: 'POST',
      params: { valueInputOption: 'USER_ENTERED', insertDataOption: 'INSERT_ROWS' },
      data: { values: [buildRow(payload)] },
    });
  } catch (error) {
    // A tab deleted behind our back must be recreated on the next attempt.
    preparedTabs.delete(`${base}|${tab}`);
    throw toSheetsError(error);
  }
}
