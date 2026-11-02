'use client';

import { useCallback, useEffect, useReducer, useState } from 'react';
import { MAX_TP_ENTRIES, type Outcome, type SetupId } from '@/config/options';
import { DEFAULT_UTC_OFFSET, nowInOffset } from '@/lib/time';
import { toPayload, validateDraft, type DraftErrors } from '@/lib/validation';
import type { ApiErrorCode, ApiResponse, DraftField, TradeDraft } from '@/types/trade';

/** Order in which errors are reported and scrolled to. */
const FIELD_ORDER: (keyof DraftErrors)[] = [
  'date',
  'time',
  'symbol',
  'setup',
  'checklist',
  'session',
  'timeWindow',
  'cycle',
  'direction',
  'outcome',
  'tpEntries',
];

const API_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  invalid_payload: 'اطلاعات واردشده معتبر نیست؛ فرم را بررسی کن.',
  sheets_not_configured: 'اتصال به Google Sheet هنوز تنظیم نشده است (متغیرهای محیطی سرور را بررسی کن).',
  sheets_forbidden: 'دسترسی به Google Sheet وجود ندارد؛ شیت را با ایمیل Service Account به‌عنوان Editor به‌اشتراک بگذار.',
  sheets_not_found: 'Google Sheet پیدا نشد؛ GOOGLE_SHEET_ID را بررسی کن.',
  sheets_error: 'ثبت در Google Sheet انجام نشد؛ چند لحظه بعد دوباره تلاش کن.',
};

const OFFLINE_MESSAGE = 'اتصال اینترنت برقرار نیست. اطلاعات فرم حفظ شده؛ بعد از وصل شدن دوباره بزن «ثبت».';

export function createDraft(utcOffset: number = DEFAULT_UTC_OFFSET, now: Date = new Date()): TradeDraft {
  return {
    ...nowInOffset(utcOffset, now),
    utcOffset,
    symbol: null,
    setup: null,
    checklist: [],
    session: null,
    timeWindow: null,
    cycle: null,
    direction: null,
    outcome: null,
    tpEntries: [''],
    notes: '',
  };
}

type SetAction = { [K in DraftField]: { type: 'set'; field: K; value: TradeDraft[K] } }[DraftField];

type Action =
  | SetAction
  | { type: 'selectSetup'; setup: SetupId }
  | { type: 'toggleCheck'; id: string }
  | { type: 'selectOutcome'; outcome: Outcome }
  | { type: 'setTp'; index: number; value: string }
  | { type: 'addTp' }
  | { type: 'removeTp'; index: number }
  | { type: 'reset'; draft: TradeDraft };

function reducer(state: TradeDraft, action: Action): TradeDraft {
  switch (action.type) {
    case 'set':
      return { ...state, [action.field]: action.value };
    case 'selectSetup':
      // Each setup has its own checklist, so ticks never carry over.
      return state.setup === action.setup ? state : { ...state, setup: action.setup, checklist: [] };
    case 'toggleCheck':
      return {
        ...state,
        checklist: state.checklist.includes(action.id)
          ? state.checklist.filter((id) => id !== action.id)
          : [...state.checklist, action.id],
      };
    case 'selectOutcome':
      return { ...state, outcome: action.outcome, tpEntries: state.tpEntries.length ? state.tpEntries : [''] };
    case 'setTp':
      return { ...state, tpEntries: state.tpEntries.map((v, i) => (i === action.index ? action.value : v)) };
    case 'addTp':
      return state.tpEntries.length >= MAX_TP_ENTRIES ? state : { ...state, tpEntries: [...state.tpEntries, ''] };
    case 'removeTp':
      return state.tpEntries.length <= 1
        ? state
        : { ...state, tpEntries: state.tpEntries.filter((_, i) => i !== action.index) };
    case 'reset':
      return action.draft;
  }
}

export interface Feedback {
  kind: 'success' | 'error';
  message: string;
}

export function useTradeForm() {
  // Date/time are filled after mount so server and client HTML match (no hydration mismatch).
  const [draft, dispatch] = useReducer(reducer, undefined, () => ({ ...createDraft(), date: '', time: '' }));
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    dispatch({ type: 'reset', draft: createDraft() });
  }, []);

  const errors: DraftErrors = showErrors ? validateDraft(draft) : {};

  const setField = useCallback(
    <K extends DraftField>(field: K, value: TradeDraft[K]) =>
      dispatch({ type: 'set', field, value } as SetAction),
    [],
  );

  const submit = useCallback(async () => {
    if (submitting) return;
    setShowErrors(true);
    setFeedback(null);

    const found = validateDraft(draft);
    const firstInvalid = FIELD_ORDER.find((key) => found[key]);
    if (firstInvalid) {
      document.getElementById(`field-${firstInvalid}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const payload = toPayload(draft);
    if (!payload) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => null)) as ApiResponse | null;

      if (response.ok && result?.ok) {
        dispatch({ type: 'reset', draft: createDraft(draft.utcOffset) });
        setShowErrors(false);
        setFeedback({ kind: 'success', message: `ثبت شد — ${payload.setup} · ${payload.symbol} · ${payload.outcome}` });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const code = result && !result.ok ? result.error : 'sheets_error';
        setFeedback({ kind: 'error', message: API_ERROR_MESSAGES[code] });
      }
    } catch {
      setFeedback({ kind: 'error', message: OFFLINE_MESSAGE });
    } finally {
      setSubmitting(false);
    }
  }, [draft, submitting]);

  return {
    draft,
    errors,
    submitting,
    feedback,
    dismissFeedback: () => setFeedback(null),
    setField,
    selectSetup: (setup: SetupId) => dispatch({ type: 'selectSetup', setup }),
    toggleCheck: (id: string) => dispatch({ type: 'toggleCheck', id }),
    selectOutcome: (outcome: Outcome) => dispatch({ type: 'selectOutcome', outcome }),
    setTp: (index: number, value: string) => dispatch({ type: 'setTp', index, value }),
    addTp: () => dispatch({ type: 'addTp' }),
    removeTp: (index: number) => dispatch({ type: 'removeTp', index }),
    submit,
  };
}
