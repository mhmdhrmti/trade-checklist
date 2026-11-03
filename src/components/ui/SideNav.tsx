'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/config/navigation';
import { BrandIcon, ChecklistIcon } from './icons';
import styles from './AppShell.module.css';

const ICONS = { checklist: ChecklistIcon } as const;

/** Slim icon rail, shown from tablet width up. */
export function SideNav() {
  const pathname = usePathname();
  return (
    <aside className={styles.rail}>
      <span className={styles.brand} aria-hidden="true">
        <BrandIcon width={24} height={24} />
      </span>
      <nav aria-label="منوی اصلی" className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={styles.navItem} aria-current={active ? 'page' : undefined}>
              <Icon width={22} height={22} />
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
