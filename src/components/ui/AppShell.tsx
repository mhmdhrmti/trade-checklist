import type { ReactNode } from 'react';
import { BrandIcon } from './icons';
import { ConnectionStatus } from './ConnectionStatus';
import { SideNav } from './SideNav';
import styles from './AppShell.module.css';

/** Full-screen frame: icon rail (tablet+), sticky top bar, fluid content area. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <SideNav />
      <div className={styles.content}>
        <header className={styles.topbar}>
          <span className={styles.brandMobile} aria-hidden="true">
            <BrandIcon width={22} height={22} />
          </span>
          <div className={styles.heading}>
            <h1 className={styles.title}>چک‌لیست قبل از معامله</h1>
            <p className={styles.subtitle}>Pre-Trade Checklist</p>
          </div>
          <ConnectionStatus />
        </header>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
