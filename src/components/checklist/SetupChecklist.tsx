import { getChecklist } from '@/config/checklists';
import type { SetupId } from '@/config/options';
import { Card } from '@/components/ui/Card';
import styles from './SetupChecklist.module.css';

interface SetupChecklistProps {
  setup: SetupId;
  /** Ids of the ticked items. */
  checked: readonly string[];
  onToggle: (id: string) => void;
  error?: string;
}

/** The pre-trade checklist for the selected setup. Rendered as its own card right below the setup picker. */
export function SetupChecklist({ setup, checked, onToggle, error }: SetupChecklistProps) {
  const items = getChecklist(setup);
  const done = items.filter((item) => checked.includes(item.id)).length;
  const complete = done === items.length;

  return (
    <Card
      id="field-checklist"
      title={`Checklist · ${setup}`}
      aside={
        <span className={styles.progress} data-complete={complete || undefined} aria-live="polite">
          <span dir="ltr">
            {done}/{items.length}
          </span>
        </span>
      }
    >
      <div className={styles.bar} role="presentation">
        <div className={styles.fill} style={{ inlineSize: `${(done / items.length) * 100}%` }} />
      </div>

      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id}>
            <label className={styles.item}>
              <input
                className={styles.input}
                type="checkbox"
                checked={checked.includes(item.id)}
                onChange={() => onToggle(item.id)}
              />
              <span className={styles.box} aria-hidden="true">
                ✓
              </span>
              <span className={styles.text}>
                <span className={styles.title} dir="ltr">
                  {item.title}
                </span>
                {item.description && <span className={styles.description}>{item.description}</span>}
              </span>
            </label>
          </li>
        ))}
      </ul>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </Card>
  );
}
