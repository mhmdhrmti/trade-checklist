'use client';

import { useTradeFormContext } from '@/context/TradeFormContext';
import { ResetIcon } from './icons';
import styles from './ResetButton.module.css';

interface ResetButtonProps {
  /** `rail`: icon + label for the sidebar. `compact`: icon-only for the phone top bar. */
  variant: 'rail' | 'compact';
}

/** Reverts every selection of the trade form to its default state. */
export function ResetButton({ variant }: ResetButtonProps) {
  const { reset, submitting } = useTradeFormContext();
  return (
    <button
      type="button"
      className={styles.button}
      data-variant={variant}
      onClick={reset}
      disabled={submitting}
      aria-label="بازنشانی فرم"
      title="بازنشانی فرم"
    >
      <ResetIcon width={22} height={22} />
      {variant === 'rail' && <span className={styles.label}>بازنشانی</span>}
    </button>
  );
}
