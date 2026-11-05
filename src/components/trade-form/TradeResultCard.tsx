import { DIRECTION_OPTIONS, OUTCOME_OPTIONS } from '@/config/options';
import type { useTradeForm } from '@/hooks/useTradeForm';
import { NotesField } from '@/components/fields/NotesField';
import { TpField } from '@/components/fields/TpField';
import { Card } from '@/components/ui/Card';
import { ChoiceGroup } from '@/components/ui/ChoiceGroup';
import { Field, labelId } from '@/components/ui/Field';
import { TargetIcon } from '@/components/ui/icons';
import { TradeSummary } from './TradeSummary';
import styles from './TradeResultCard.module.css';

interface TradeResultCardProps {
  form: ReturnType<typeof useTradeForm>;
  /** Prefix that keeps radio group names unique. */
  idPrefix: string;
}

/** The whole left column: direction, outcome (+ TP entries), notes, and the live summary with the submit button. */
export function TradeResultCard({ form, idPrefix }: TradeResultCardProps) {
  const { draft, errors } = form;

  return (
    <Card grow title="نتیجه معامله" icon={<TargetIcon width={18} height={18} />}>
      <div className={styles.body}>
        <div className={styles.controls}>
          <Field id="direction" label="جهت معامله" error={errors.direction}>
            <ChoiceGroup
              name={`${idPrefix}-direction`}
              labelledBy={labelId('direction')}
              options={DIRECTION_OPTIONS}
              value={draft.direction}
              onChange={(direction) => form.setField('direction', direction)}
              columns={2}
              invalid={!!errors.direction}
            />
          </Field>
          <Field id="outcome" label="نتیجه" error={errors.outcome}>
            <ChoiceGroup
              name={`${idPrefix}-outcome`}
              labelledBy={labelId('outcome')}
              options={OUTCOME_OPTIONS}
              value={draft.outcome}
              onChange={form.selectOutcome}
              columns={2}
              invalid={!!errors.outcome}
            />
          </Field>
          {draft.outcome === 'TP' && (
            <TpField value={draft.tpR} onChange={(tpR) => form.setField('tpR', tpR)} error={errors.tpR} />
          )}
        </div>

        <NotesField value={draft.notes} onChange={(notes) => form.setField('notes', notes)} />
      </div>

      <TradeSummary draft={draft} submitting={form.submitting} />
    </Card>
  );
}
