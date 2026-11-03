import styles from './SubmitButton.module.css';

/** Primary action; submits the surrounding form. */
export function SubmitButton({ submitting }: { submitting: boolean }) {
  return (
    <button type="submit" className={styles.button} disabled={submitting} aria-busy={submitting}>
      {submitting ? 'در حال ارسال…' : 'ثبت معامله در Google Sheet'}
    </button>
  );
}
