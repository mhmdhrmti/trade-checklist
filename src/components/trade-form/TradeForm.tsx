'use client';

import { useId, type FormEvent } from 'react';
import {
  CYCLE_OPTIONS,
  DIRECTION_OPTIONS,
  OUTCOME_OPTIONS,
  SESSION_OPTIONS,
  SETUP_OPTIONS,
  SYMBOL_OPTIONS,
  TIME_WINDOW_OPTIONS,
} from '@/config/options';
import { useTradeForm } from '@/hooks/useTradeForm';
import { SetupChecklist } from '@/components/checklist/SetupChecklist';
import { DateField } from '@/components/fields/DateField';
import { NotesField } from '@/components/fields/NotesField';
import { TimeField } from '@/components/fields/TimeField';
import { TpEntries } from '@/components/fields/TpEntries';
import { UtcOffsetField } from '@/components/fields/UtcOffsetField';
import { Card } from '@/components/ui/Card';
import { ChoiceGroup } from '@/components/ui/ChoiceGroup';
import { Field, labelId } from '@/components/ui/Field';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { SubmitBar } from '@/components/ui/SubmitBar';
import { Toast } from '@/components/ui/Toast';
import styles from './TradeForm.module.css';

export function TradeForm() {
  const form = useTradeForm();
  const { draft, errors } = form;
  const formId = useId();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void form.submit();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate aria-label="Pre-trade checklist">
      <OfflineBanner />

      <Card>
        <div className={styles.row}>
          <DateField
            value={draft.date}
            onChange={(date) => form.setField('date', date)}
            utcOffset={draft.utcOffset}
            error={errors.date}
          />
          <TimeField value={draft.time} onChange={(time) => form.setField('time', time)} error={errors.time} />
        </div>
        <UtcOffsetField
          value={draft.utcOffset}
          onChange={(minutes) => form.setField('utcOffset', minutes)}
          date={draft.date}
          time={draft.time}
        />
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

      <Card>
        <Field id="setup" label="Setup" error={errors.setup}>
          <ChoiceGroup
            name={`${formId}-setup`}
            labelledBy={labelId('setup')}
            options={SETUP_OPTIONS}
            value={draft.setup}
            onChange={form.selectSetup}
            columns={3}
            invalid={!!errors.setup}
          />
        </Field>
      </Card>

      {draft.setup && (
        <SetupChecklist
          setup={draft.setup}
          checked={draft.checklist}
          onToggle={form.toggleCheck}
          error={errors.checklist}
        />
      )}

      <Card>
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
        <Field id="timeWindow" label="Time Window" error={errors.timeWindow}>
          <ChoiceGroup
            name={`${formId}-window`}
            labelledBy={labelId('timeWindow')}
            options={TIME_WINDOW_OPTIONS}
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

      <Card>
        <Field id="direction" label="جهت معامله" error={errors.direction}>
          <ChoiceGroup
            name={`${formId}-direction`}
            labelledBy={labelId('direction')}
            options={DIRECTION_OPTIONS}
            value={draft.direction}
            onChange={(direction) => form.setField('direction', direction)}
            columns={2}
            invalid={!!errors.direction}
          />
        </Field>
        <Field id="outcome" label="نتیجه معامله" error={errors.outcome}>
          <ChoiceGroup
            name={`${formId}-outcome`}
            labelledBy={labelId('outcome')}
            options={OUTCOME_OPTIONS}
            value={draft.outcome}
            onChange={form.selectOutcome}
            columns={2}
            invalid={!!errors.outcome}
          />
        </Field>
        {draft.outcome === 'TP' && (
          <TpEntries
            entries={draft.tpEntries}
            onChange={form.setTp}
            onAdd={form.addTp}
            onRemove={form.removeTp}
            error={errors.tpEntries}
          />
        )}
        <NotesField value={draft.notes} onChange={(notes) => form.setField('notes', notes)} />
      </Card>

      <Toast feedback={form.feedback} onDismiss={form.dismissFeedback} />
      <SubmitBar submitting={form.submitting} />
    </form>
  );
}
