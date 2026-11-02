'use client';

import { useEffect } from 'react';
import type { Feedback } from '@/hooks/useTradeForm';
import styles from './Toast.module.css';

interface ToastProps {
  feedback: Feedback | null;
  onDismiss: () => void;
}

const SUCCESS_DURATION_MS = 4000;

/** Transient result message. Errors stay until dismissed or the next submit; success fades after a few seconds. */
export function Toast({ feedback, onDismiss }: ToastProps) {
  useEffect(() => {
    if (feedback?.kind !== 'success') return;
    const timer = window.setTimeout(onDismiss, SUCCESS_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [feedback, onDismiss]);

  if (!feedback) return null;

  return (
    <div className={styles.toast} data-kind={feedback.kind} role={feedback.kind === 'error' ? 'alert' : 'status'}>
      <span aria-hidden="true" className={styles.icon}>
        {feedback.kind === 'success' ? '✓' : '!'}
      </span>
      <p className={styles.message}>{feedback.message}</p>
      <button type="button" className={styles.close} onClick={onDismiss} aria-label="بستن پیام">
        ×
      </button>
    </div>
  );
}
