import { useId } from 'react';
import styles from './TpField.module.css';

interface TpFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

/** The single take profit, recorded as an R multiple. Shown only when the outcome is TP. */
export function TpField({ value, onChange, error }: TpFieldProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;

  return (
    <div className={styles.wrapper} id="field-tpR">
      <label className={styles.title} htmlFor={inputId}>
        مقدار TP
      </label>

      <div className={styles.row}>
        <input
          id={inputId}
          className="control"
          type="text"
          inputMode="decimal"
          dir="ltr"
          autoComplete="off"
          placeholder="مثلاً 2"
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className={styles.unit} aria-hidden="true">
          R
        </span>
      </div>

      {error && (
        <p className={styles.error} id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
