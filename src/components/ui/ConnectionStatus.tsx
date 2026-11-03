'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import styles from './AppShell.module.css';

export function ConnectionStatus() {
  const online = useOnlineStatus();
  return (
    <span className={styles.status} data-online={online || undefined}>
      <span className={styles.dot} aria-hidden="true" />
      {online ? 'آنلاین' : 'آفلاین'}
    </span>
  );
}
