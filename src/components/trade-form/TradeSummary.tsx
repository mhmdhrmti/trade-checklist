import { getChecklist } from '@/config/checklists';
import { windowLabelAt } from '@/lib/timeWindows';
import { validateDraft } from '@/lib/validation';
import type { TradeDraft } from '@/types/trade';
import { SubmitButton } from '@/components/ui/SubmitButton';
import styles from './TradeSummary.module.css';

const REQUIRED_KEYS = [
  'date',
  'time',
  'symbol',
  'setup',
  'session',
  'timeWindow',
  'cycle',
  'direction',
  'outcome',
] as const;

interface TradeSummaryProps {
  draft: TradeDraft;
  submitting: boolean;
}

/** Live recap of the trade being built, readiness progress and (on wide screens) the submit button. Footer of the result card. */
export function TradeSummary({ draft, submitting }: TradeSummaryProps) {
  const errors = validateDraft(draft);
  const missing = REQUIRED_KEYS.filter((key) => errors[key] || (key === 'outcome' && errors.tpR)).length;
  const done = REQUIRED_KEYS.length - missing;
  const checklistTotal = draft.setup ? getChecklist(draft.setup).length : 0;

  type Chip = { label: string; tone?: 'positive' | 'negative' };
  const chips: Chip[] = [];
  if (draft.symbol) chips.push({ label: draft.symbol });
  if (draft.setup) chips.push({ label: draft.setup });
  if (draft.session) chips.push({ label: draft.session });
  if (draft.timeWindow) chips.push({ label: windowLabelAt(draft.timeWindow, draft.utcOffset) });
  if (draft.cycle) chips.push({ label: draft.cycle });
  if (draft.direction)
    chips.push({
      label: draft.direction,
      tone: draft.direction === 'Buy' ? 'positive' : 'negative',
    });
  if (draft.outcome)
    chips.push({
      label: draft.outcome,
      tone: draft.outcome === 'TP' ? 'positive' : 'negative',
    });

  return (
    <footer className={styles.summary} aria-label="خلاصه معامله">
      <div>
        <div className={styles.progressRow}>
          <span>موارد کامل‌شده</span>
          <strong dir="ltr">
            {done}/{REQUIRED_KEYS.length}
          </strong>
        </div>
        <div
          className={styles.track}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={REQUIRED_KEYS.length}
          aria-valuenow={done}
        >
          <div className={styles.fill} style={{ inlineSize: `${(done / REQUIRED_KEYS.length) * 100}%` }} />
        </div>
      </div>

      {chips.length > 0 ? (
        <ul className={styles.chips} dir="ltr">
          {chips.map((chip) => (
            <li key={chip.label} className={styles.chip} data-tone={chip.tone}>
              {chip.label}
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>با پر کردن فرم، خلاصه‌ی معامله اینجا نمایش داده می‌شود.</p>
      )}

      {draft.setup && (
        <p className={styles.line}>
          چک‌لیست <bdi dir="ltr">{draft.setup}</bdi>:{' '}
          <bdi dir="ltr">
            {draft.checklist.length}/{checklistTotal}
          </bdi>
        </p>
      )}

      <div className={styles.desktopSubmit}>
        <SubmitButton submitting={submitting} />
      </div>
    </footer>
  );
}
