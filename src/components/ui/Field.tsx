import type { ReactNode } from 'react';
import styles from './Field.module.css';

interface FieldProps {
  /** Key used for the wrapper id (`field-<id>`), the label id and error scrolling. */
  id: string;
  label: string;
  /** Pass for native controls so the label is wired with `for`; groups use `aria-labelledby` instead. */
  htmlFor?: string;
  optional?: boolean;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}

export const labelId = (id: string) => `${id}-label`;

/** Label + control + error message. Every field in the form goes through this wrapper. */
export function Field({ id, label, htmlFor, optional, error, hint, children }: FieldProps) {
  const content = (
    <>
      {label}
      {optional && <span className={styles.optional}>اختیاری</span>}
    </>
  );

  return (
    <div className={styles.field} id={`field-${id}`}>
      {htmlFor ? (
        <label className={styles.label} id={labelId(id)} htmlFor={htmlFor}>
          {content}
        </label>
      ) : (
        <span className={styles.label} id={labelId(id)}>
          {content}
        </span>
      )}
      {children}
      {hint && <p className={styles.hint}>{hint}</p>}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
