'use client';

import { useId, useMemo, type FormEvent } from 'react';
import { CYCLE_OPTIONS, SESSION_OPTIONS, SYMBOL_OPTIONS } from '@/config/options';
import { useTradeFormContext } from '@/context/TradeFormContext';
import { nowInOffset } from '@/lib/time';
import { getTimeWindowOptions } from '@/lib/timeWindows';
import { SetupPanel } from '@/components/checklist/SetupPanel';
import { DateField } from '@/components/fields/DateField';
import { TimeField } from '@/components/fields/TimeField';
import { UtcOffsetField } from '@/components/fields/UtcOffsetField';
import { Card } from '@/components/ui/Card';
import { ChoiceGroup } from '@/components/ui/ChoiceGroup';
import { Field, labelId } from '@/components/ui/Field';
import { LiveClock } from '@/components/ui/LiveClock';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { SubmitBar } from '@/components/ui/SubmitBar';
import { Toast } from '@/components/ui/Toast';
import { CalendarIcon, MarketIcon } from '@/components/ui/icons';
import { TradeResultCard } from './TradeResultCard';
import styles from './TradeForm.module.css';

const ICON = { width: 18, height: 18 } as const;

export function TradeForm() {
  const form = useTradeFormContext();
  const { draft, errors } = form;
  const formId = useId();
  // Windows are defined on UTC+3; their labels follow the selected offset.
  const windowOptions = useMemo(() => getTimeWindowOptions(draft.utcOffset), [draft.utcOffset]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void form.submit();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate aria-label="Pre-trade checklist">
      <OfflineBanner />

      <div className={styles.dashboard}>
        <section className={styles.hero} aria-label="زمان">
          <LiveClock utcOffset={draft.utcOffset} />
          <div className={styles.zone}>
            <UtcOffsetField
              value={draft.utcOffset}
              onChange={(minutes) => form.setField('utcOffset', minutes)}
              date={draft.date}
              time={draft.time}
            />
          </div>
        </section>

        <div className={styles.dateSymbol}>
          <Card grow title="تاریخ و نماد" icon={<CalendarIcon {...ICON} />}>
            <div className={styles.pair}>
              <DateField
                value={draft.date}
                onChange={(date) => form.setField('date', date)}
                utcOffset={draft.utcOffset}
                error={errors.date}
              />
              <TimeField
                value={draft.time}
                onChange={(time) => form.setField('time', time)}
                onNow={() => form.setField('time', nowInOffset(draft.utcOffset).time)}
                error={errors.time}
              />
            </div>
            <Field id="symbol" label="نماد معاملاتی" error={errors.symbol}>
              <ChoiceGroup
                name={`${formId}-symbol`}
                labelledBy={labelId('symbol')}
                options={SYMBOL_OPTIONS}
                value={draft.symbol}
                onChange={(symbol) => form.setField('symbol', symbol)}
                columns={2}
                invalid={!!errors.symbol}
              />
            </Field>
          </Card>
        </div>

        <div className={styles.market}>
          <Card grow title="شرایط بازار" icon={<MarketIcon {...ICON} />}>
            <Field id="session" label="Session" error={errors.session}>
              <ChoiceGroup
                name={`${formId}-session`}
                labelledBy={labelId('session')}
                options={SESSION_OPTIONS}
                value={draft.session}
                onChange={(session) => form.setField('session', session)}
                columns={3}
                invalid={!!errors.session}
              />
            </Field>
            <Field
              id="timeWindow"
              label="Time Window"
              error={errors.timeWindow}
              hint="بازه‌ها با منطقه‌ی زمانی انتخاب‌شده تغییر می‌کنند (مبنا: UTC+3)."
            >
              <ChoiceGroup
                name={`${formId}-window`}
                labelledBy={labelId('timeWindow')}
                options={windowOptions}
                value={draft.timeWindow}
                onChange={(window) => form.setField('timeWindow', window)}
                columns={3}
                invalid={!!errors.timeWindow}
              />
            </Field>
            <Field id="cycle" label="Cycle" error={errors.cycle}>
              <ChoiceGroup
                name={`${formId}-cycle`}
                labelledBy={labelId('cycle')}
                options={CYCLE_OPTIONS}
                value={draft.cycle}
                onChange={(cycle) => form.setField('cycle', cycle)}
                columns={3}
                invalid={!!errors.cycle}
              />
            </Field>
          </Card>
        </div>

        <div className={styles.setup}>
          <SetupPanel
            name={`${formId}-setup`}
            setup={draft.setup}
            onSelect={form.selectSetup}
            error={errors.setup}
            checked={draft.checklist}
            onToggle={form.toggleCheck}
            checklistError={errors.checklist}
          />
        </div>

        <div className={styles.result}>
          <TradeResultCard form={form} idPrefix={formId} />
        </div>
      </div>

      <Toast feedback={form.feedback} onDismiss={form.dismissFeedback} />
      <SubmitBar submitting={form.submitting} />
    </form>
  );
}
