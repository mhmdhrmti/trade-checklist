import { TradeForm } from '@/components/trade-form/TradeForm';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>چک‌لیست قبل از معامله</h1>
        <p className={styles.subtitle}>Pre-Trade Checklist</p>
      </header>
      <TradeForm />
    </main>
  );
}
