import { MAX_TP_ENTRIES } from '@/config/options';
import styles from './TpEntries.module.css';

interface TpEntriesProps {
  entries: readonly string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  error?: string;
}

/** 1–3 take-profit entries, each recorded as an R multiple. Shown only when the outcome is TP. */
export function TpEntries({ entries, onChange, onAdd, onRemove, error }: TpEntriesProps) {
  return (
    <div className={styles.wrapper} id="field-tpEntries">
      <p className={styles.title}>
        ورودهای TP <span className={styles.count}>{entries.length}/{MAX_TP_ENTRIES}</span>
      </p>

      <ul className={styles.list}>
        {entries.map((entry, index) => {
          const inputId = `tp-${index}`;
          return (
            <li key={index} className={styles.row}>
              <label className={styles.tag} htmlFor={inputId}>
                TP{index + 1}
              </label>
              <input
                id={inputId}
                className="control"
                type="text"
                inputMode="decimal"
                dir="ltr"
                autoComplete="off"
                placeholder="مثلاً 2"
                value={entry}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'tp-error' : undefined}
                onChange={(event) => onChange(index, event.target.value)}
              />
              <span className={styles.unit} aria-hidden="true">
                R
              </span>
              {entries.length > 1 && (
                <button type="button" className={styles.remove} onClick={() => onRemove(index)} aria-label={`حذف TP${index + 1}`}>
                  ×
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {entries.length < MAX_TP_ENTRIES && (
        <button type="button" className={styles.add} onClick={onAdd}>
          + افزودن ورود TP
        </button>
      )}

      {error && (
        <p className={styles.error} id="tp-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
