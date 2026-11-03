export interface NavItem {
  href: string;
  label: string;
  icon: 'checklist';
}

/** Sidebar entries. Add future pages here and they appear in the rail automatically. */
export const NAV_ITEMS: readonly NavItem[] = [{ href: '/', label: 'ثبت معامله', icon: 'checklist' }];
