import { getChecklist } from '@/config/checklists';
import { MAX_TP_ENTRIES, type SetupId } from '@/config/options';
import type { TradePayload } from '@/types/trade';
import { formatOffset, toUtc } from '../time';
import { windowLabelAt } from '../timeWindows';

export type Cell = string | number;

const tpHeaders = Array.from({ length: MAX_TP_ENTRIES }, (_, i) => `TP${i + 1} (R)`);

const LEADING_HEADERS = [
  'Date',
  'Time',
  'UTC Offset',
  'UTC DateTime',
  'Symbol',
  'Setup',
  'Session',
  'Time Window',
  'Time Window (UTC+3)',
  'Cycle',
  'Direction',
  'Outcome',
  ...tpHeaders,
];

const TRAILING_HEADERS = ['Notes', 'Logged At (UTC)'];

/** The sheet tab for a setup is named after the setup itself. */
export const sheetNameForSetup = (setup: SetupId): string => setup;

/** Header row for a setup's tab: shared columns, one column per checklist item, then notes. */
export function buildHeaders(setup: SetupId): string[] {
  return [...LEADING_HEADERS, ...getChecklist(setup).map((item) => item.title), ...TRAILING_HEADERS];
}

/**
 * Forces Google Sheets (USER_ENTERED mode) to keep a value as text.
 * Prevents formula injection from notes and stops values such as "10–13" or "SP2L" being re-interpreted.
 */
export function asText(value: string): string {
  return value !== '' && (/^[=+\-@'\t\r]/.test(value) || /\d/.test(value)) ? `'${value}` : value;
}

/** One row of cells, aligned with `buildHeaders(payload.setup)`. */
export function buildRow(payload: TradePayload, now: Date = new Date()): Cell[] {
  const utc = toUtc(payload.date, payload.time, payload.utcOffsetMinutes);
  const checked = new Set(payload.checklist);
  const tp: Cell[] = Array.from({ length: MAX_TP_ENTRIES }, (_, i) => payload.tpEntries[i] ?? '');
  const loggedAt = now.toISOString().slice(0, 19).replace('T', ' ');

  return [
    payload.date,
    payload.time,
    asText(formatOffset(payload.utcOffsetMinutes)),
    `${utc.date} ${utc.time}`,
    asText(payload.symbol),
    asText(payload.setup),
    asText(payload.session),
    asText(windowLabelAt(payload.timeWindow, payload.utcOffsetMinutes)),
    asText(payload.timeWindow),
    asText(payload.cycle),
    asText(payload.direction),
    asText(payload.outcome),
    ...tp,
    ...getChecklist(payload.setup).map((item) => (checked.has(item.id) ? '✓' : '✗')),
    asText(payload.notes),
    loggedAt,
  ];
}
