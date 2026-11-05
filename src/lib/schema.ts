import { z } from 'zod';
import { getChecklist } from '@/config/checklists';
import {
  CYCLE_VALUES,
  DIRECTION_VALUES,
  MAX_NOTES_LENGTH,
  OUTCOME_VALUES,
  SESSION_VALUES,
  SETUP_VALUES,
  SYMBOL_VALUES,
  TIME_WINDOW_VALUES,
} from '@/config/options';
import type { TradePayload } from '@/types/trade';
import { MAX_R_VALUE } from './validation';
import { isValidDate, isValidTime } from './time';

/** Server-side contract for `/api/trades`; never trust the client. */
export const tradePayloadSchema = z
  .object({
    date: z.string().refine(isValidDate, 'invalid date'),
    time: z.string().refine(isValidTime, 'invalid time'),
    utcOffsetMinutes: z
      .number()
      .int()
      .min(-12 * 60)
      .max(14 * 60)
      .refine((v) => v % 15 === 0, 'invalid offset'),
    symbol: z.enum(SYMBOL_VALUES),
    setup: z.enum(SETUP_VALUES),
    checklist: z.array(z.string()).max(20),
    session: z.enum(SESSION_VALUES),
    timeWindow: z.enum(TIME_WINDOW_VALUES),
    cycle: z.enum(CYCLE_VALUES),
    direction: z.enum(DIRECTION_VALUES),
    outcome: z.enum(OUTCOME_VALUES),
    tpR: z.number().positive().max(MAX_R_VALUE).nullable(),
    notes: z.string().max(MAX_NOTES_LENGTH),
  })
  .superRefine((payload, ctx) => {
    if (payload.outcome === 'TP' && payload.tpR === null) {
      ctx.addIssue({
        code: 'custom',
        path: ['tpR'],
        message: 'TP needs an R value',
      });
    }
    if (payload.outcome === 'SL' && payload.tpR !== null) {
      ctx.addIssue({
        code: 'custom',
        path: ['tpR'],
        message: 'SL cannot have a TP value',
      });
    }
    const allowed = new Set(getChecklist(payload.setup).map((item) => item.id));
    if (
      payload.checklist.some((id) => !allowed.has(id)) ||
      new Set(payload.checklist).size !== payload.checklist.length
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['checklist'],
        message: 'unknown checklist item',
      });
    }
  });

/** Compile-time guard: the schema output must stay assignable to the shared `TradePayload` type. */
export const _schemaMatchesPayload = (p: z.infer<typeof tradePayloadSchema>): TradePayload => p;
