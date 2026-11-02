import styles from './SubmitBar.module.css';

interface SubmitBarProps {
  submitting: boolean;
}

/** Sticky bottom action bar so the submit button is always one thumb-tap away. Submits the surrounding form. */
export function SubmitBar({ submitting }: SubmitBarProps) {
  return (
    <div className={styles.bar}>
      <button type="submit" className={styles.button} disabled={submitting} aria-busy={submitting}>
        {submitting ? 'در حال ارسال…' : 'ثبت معامله در Google Sheet'}
      </button>
    </div>
  );
}
