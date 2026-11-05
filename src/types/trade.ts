import type { Cycle, Direction, Outcome, SetupId, Session, Symbol, TimeWindow } from '@/config/options';

/** Mutable form state. Fields are `null`/empty until the user chooses something. */
export interface TradeDraft {
  /** Gregorian `YYYY-MM-DD`, wall-clock date in the chosen UTC offset. */
  date: string;
  /** 24h `HH:mm`, wall-clock time in the chosen UTC offset. */
  time: string;
  /** UTC offset in minutes (Istanbul = 180). */
  utcOffset: number;
  symbol: Symbol | null;
  setup: SetupId | null;
  /** Ids of ticked items of the selected setup's checklist. */
  checklist: string[];
  session: Session | null;
  timeWindow: TimeWindow | null;
  cycle: Cycle | null;
  direction: Direction | null;
  outcome: Outcome | null;
  /** Raw R multiple of the single TP (string so half-typed values survive). Only used for TP outcomes. */
  tpR: string;
  notes: string;
}

export type DraftField = keyof TradeDraft;

/** Validated payload sent to `/api/trades`. */
export interface TradePayload {
  date: string;
  time: string;
  utcOffsetMinutes: number;
  symbol: Symbol;
  setup: SetupId;
  checklist: string[];
  session: Session;
  timeWindow: TimeWindow;
  cycle: Cycle;
  direction: Direction;
  outcome: Outcome;
  /** R multiple of the take profit; `null` for SL. */
  tpR: number | null;
  notes: string;
}

/** Error codes returned by the API; the client maps them to Persian messages. */
export type ApiErrorCode =
  'invalid_payload' | 'sheets_not_configured' | 'sheets_forbidden' | 'sheets_not_found' | 'sheets_error';

export type ApiResponse = { ok: true } | { ok: false; error: ApiErrorCode };
