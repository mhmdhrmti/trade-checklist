import { SubmitButton } from './SubmitButton';
import styles from './SubmitBar.module.css';

/** Sticky bottom action bar for phones and tablets (desktop uses the summary card instead). */
export function SubmitBar({ submitting }: { submitting: boolean }) {
  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <SubmitButton submitting={submitting} />
      </div>
    </div>
  );
}
