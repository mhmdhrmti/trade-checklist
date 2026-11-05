'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useTradeForm } from '@/hooks/useTradeForm';

type TradeFormState = ReturnType<typeof useTradeForm>;

const TradeFormContext = createContext<TradeFormState | null>(null);

/** Owns the trade form state so the form, the sidebar (Reset) and future widgets share one source of truth. */
export function TradeFormProvider({ children }: { children: ReactNode }) {
  const form = useTradeForm();
  return <TradeFormContext.Provider value={form}>{children}</TradeFormContext.Provider>;
}

export function useTradeFormContext(): TradeFormState {
  const form = useContext(TradeFormContext);
  if (!form) throw new Error('useTradeFormContext must be used inside <TradeFormProvider>');
  return form;
}
