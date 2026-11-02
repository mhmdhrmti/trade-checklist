/**
 * Single source of truth for every selectable option.
 * The form, the validation schema and the Google Sheets writer all derive from here,
 * so adding an option means editing this file only.
 */

export interface Option<V extends string = string> {
  value: V;
  /** Text shown on the chip. */
  label: string;
  /** Small secondary text (e.g. the ticker). */
  hint?: string;
  /** Colours the chip for outcomes / directions. */
  tone?: 'positive' | 'negative';
}

/** Tuple of option values, kept as a literal tuple so zod can build an enum from it. */
const values = <const T extends readonly Option[]>(options: T) =>
  options.map((o) => o.value) as unknown as { [K in keyof T]: T[K]['value'] };

export const SYMBOL_OPTIONS = [
  { value: 'XAUUSD', label: 'Gold', hint: 'XAUUSD' },
  { value: 'US30USD', label: 'Dow Jones', hint: 'US30USD' },
] as const satisfies readonly Option[];

export const SETUP_OPTIONS = [
  { value: 'SP2L', label: 'SP2L' },
  { value: 'Pro BTB', label: 'Pro BTB' },
  { value: 'MicroMap', label: 'MicroMap' },
] as const satisfies readonly Option[];

export const SESSION_OPTIONS = [
  { value: 'Tokyo', label: 'Tokyo' },
  { value: 'London', label: 'London' },
  { value: 'New York', label: 'New York' },
] as const satisfies readonly Option[];

export const TIME_WINDOW_OPTIONS = [
  { value: '10–13', label: '10–13' },
  { value: '13–15:30', label: '13–15:30' },
  { value: '15:30–16:30', label: '15:30–16:30' },
  { value: '16:30–18', label: '16:30–18' },
  { value: '18–21', label: '18–21' },
  { value: '21–23', label: '21–23' },
] as const satisfies readonly Option[];

export const CYCLE_OPTIONS = [
  { value: 'Spike', label: 'Spike' },
  { value: 'Channel', label: 'Channel' },
  { value: 'Trading Range', label: 'Trading Range' },
] as const satisfies readonly Option[];

export const DIRECTION_OPTIONS = [
  { value: 'Buy', label: 'Buy', tone: 'positive' },
  { value: 'Sell', label: 'Sell', tone: 'negative' },
] as const satisfies readonly Option[];

export const OUTCOME_OPTIONS = [
  { value: 'TP', label: 'TP', hint: 'Take Profit', tone: 'positive' },
  { value: 'SL', label: 'SL', hint: 'Stop Loss', tone: 'negative' },
] as const satisfies readonly Option[];

export type Symbol = (typeof SYMBOL_OPTIONS)[number]['value'];
export type SetupId = (typeof SETUP_OPTIONS)[number]['value'];
export type Session = (typeof SESSION_OPTIONS)[number]['value'];
export type TimeWindow = (typeof TIME_WINDOW_OPTIONS)[number]['value'];
export type Cycle = (typeof CYCLE_OPTIONS)[number]['value'];
export type Direction = (typeof DIRECTION_OPTIONS)[number]['value'];
export type Outcome = (typeof OUTCOME_OPTIONS)[number]['value'];

export const SYMBOL_VALUES = values(SYMBOL_OPTIONS);
export const SETUP_VALUES = values(SETUP_OPTIONS);
export const SESSION_VALUES = values(SESSION_OPTIONS);
export const TIME_WINDOW_VALUES = values(TIME_WINDOW_OPTIONS);
export const CYCLE_VALUES = values(CYCLE_OPTIONS);
export const DIRECTION_VALUES = values(DIRECTION_OPTIONS);
export const OUTCOME_VALUES = values(OUTCOME_OPTIONS);

/** A TP outcome may record between 1 and this many entries. */
export const MAX_TP_ENTRIES = 3;

/** Notes are optional and capped to keep sheet cells tidy. */
export const MAX_NOTES_LENGTH = 1000;

/**
 * When true the submit button is blocked until every checklist item of the chosen setup is ticked.
 * Left off by default so trades that broke a rule can still be logged honestly
 * (the sheet records which items were ticked).
 */
export const REQUIRE_FULL_CHECKLIST = false;
