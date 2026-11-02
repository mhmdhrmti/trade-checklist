import type { CSSProperties } from 'react';
import type { Option } from '@/config/options';
import styles from './ChoiceGroup.module.css';

interface ChoiceGroupProps<V extends string> {
  /** Radio group name; must be unique on the page. */
  name: string;
  /** Id of the element that labels the group (see `labelId`). */
  labelledBy: string;
  options: readonly Option<V>[];
  value: V | null;
  onChange: (value: V) => void;
  /** Grid columns. */
  columns?: number;
  invalid?: boolean;
}

/** Single-choice chips built on native radio inputs (keyboard + screen-reader friendly). */
export function ChoiceGroup<V extends string>({
  name,
  labelledBy,
  options,
  value,
  onChange,
  columns = 3,
  invalid,
}: ChoiceGroupProps<V>) {
  return (
    <div
      className={styles.group}
      role="radiogroup"
      // Options are English technical terms / numeric ranges: LTR keeps "13–15:30" and the listed order intact.
      dir="ltr"
      aria-labelledby={labelledBy}
      aria-invalid={invalid || undefined}
      data-invalid={invalid || undefined}
      style={{ '--columns': columns } as CSSProperties}
    >
      {options.map((option) => (
        <label key={option.value} className={styles.option} data-tone={option.tone}>
          <input
            className={styles.input}
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span className={styles.face}>
            <span>{option.label}</span>
            {option.hint && <small className={styles.hint}>{option.hint}</small>}
          </span>
        </label>
      ))}
    </div>
  );
}
