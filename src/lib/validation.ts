import { REQUIRE_FULL_CHECKLIST } from '@/config/options';
import { getChecklist } from '@/config/checklists';
import type { TradeDraft, TradePayload } from '@/types/trade';
import { parseDecimal } from './number';
import { isValidDate, isValidTime } from './time';

export const MAX_R_VALUE = 1000;

export type DraftErrors = Partial<
  Record<
    | 'date'
    | 'time'
    | 'symbol'
    | 'setup'
    | 'checklist'
    | 'session'
    | 'timeWindow'
    | 'cycle'
    | 'direction'
    | 'outcome'
    | 'tpEntries',
    string
  >
>;

/** Parses the R inputs of a TP outcome; `null` if any is missing or not a positive number. */
export function parseTpEntries(entries: readonly string[]): number[] | null {
  if (entries.length === 0) return null;
  const parsed = entries.map(parseDecimal);
  return parsed.every((n): n is number => n !== null && n > 0 && n <= MAX_R_VALUE) ? parsed : null;
}

/** Client-side validation. Every field is mandatory except notes. */
export function validateDraft(draft: TradeDraft): DraftErrors {
  const errors: DraftErrors = {};

  if (!isValidDate(draft.date)) errors.date = 'تاریخ را انتخاب کن';
  if (!isValidTime(draft.time)) errors.time = 'ساعت را وارد کن';
  if (!draft.symbol) errors.symbol = 'نماد را انتخاب کن';
  if (!draft.setup) errors.setup = 'Setup را انتخاب کن';
  else if (REQUIRE_FULL_CHECKLIST && draft.checklist.length < getChecklist(draft.setup).length) {
    errors.checklist = 'همه‌ی موارد چک‌لیست باید تیک بخورند';
  }
  if (!draft.session) errors.session = 'Session را انتخاب کن';
  if (!draft.timeWindow) errors.timeWindow = 'Time Window را انتخاب کن';
  if (!draft.cycle) errors.cycle = 'Cycle را انتخاب کن';
  if (!draft.direction) errors.direction = 'جهت معامله را انتخاب کن';
  if (!draft.outcome) errors.outcome = 'نتیجه‌ی معامله را مشخص کن';
  else if (draft.outcome === 'TP' && !parseTpEntries(draft.tpEntries)) {
    errors.tpEntries = 'مقدار R هر ورود را به‌صورت عدد مثبت وارد کن';
  }

  return errors;
}

/** Builds the API payload from a draft, or `null` when the draft is incomplete. */
export function toPayload(draft: TradeDraft): TradePayload | null {
  if (Object.keys(validateDraft(draft)).length > 0) return null;
  const { symbol, setup, session, timeWindow, cycle, direction, outcome } = draft;
  if (!symbol || !setup || !session || !timeWindow || !cycle || !direction || !outcome) return null;

  return {
    date: draft.date,
    time: draft.time,
    utcOffsetMinutes: draft.utcOffset,
    symbol,
    setup,
    checklist: draft.checklist,
    session,
    timeWindow,
    cycle,
    direction,
    outcome,
    tpEntries: outcome === 'TP' ? (parseTpEntries(draft.tpEntries) ?? []) : [],
    notes: draft.notes.trim(),
  };
}
