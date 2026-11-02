'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';

/** Trades are never stored in the app, so tell the user up front when submitting is impossible. */
export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <p
      role="status"
      style={{
        margin: 0,
        padding: '10px 14px',
        fontSize: '0.8125rem',
        fontWeight: 600,
        color: 'var(--negative)',
        background: 'var(--negative-soft)',
        borderRadius: 12,
      }}
    >
      اینترنت قطع است. برای ثبت معامله در Google Sheet باید آنلاین باشی.
    </p>
  );
}
