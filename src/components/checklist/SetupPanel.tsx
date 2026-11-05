import { SETUP_OPTIONS, type SetupId } from '@/config/options';
import { Card } from '@/components/ui/Card';
import { ChoiceGroup } from '@/components/ui/ChoiceGroup';
import { Field, labelId } from '@/components/ui/Field';
import { LayersIcon } from '@/components/ui/icons';
import { SetupChecklist } from './SetupChecklist';
import styles from './SetupPanel.module.css';

interface SetupPanelProps {
  name: string;
  setup: SetupId | null;
  onSelect: (setup: SetupId) => void;
  error?: string;
  checked: readonly string[];
  onToggle: (id: string) => void;
  checklistError?: string;
}

/** One card: the setup picker on top, the checklist of the chosen setup filling the rest of the height. */
export function SetupPanel({ name, setup, onSelect, error, checked, onToggle, checklistError }: SetupPanelProps) {
  return (
    <Card grow title="Setup" icon={<LayersIcon width={18} height={18} />}>
      <Field id="setup" label="انتخاب Setup" error={error}>
        <ChoiceGroup
          name={name}
          labelledBy={labelId('setup')}
          options={SETUP_OPTIONS}
          value={setup}
          onChange={onSelect}
          columns={3}
          invalid={!!error}
        />
      </Field>

      <hr className={styles.divider} />

      {setup ? (
        <SetupChecklist setup={setup} checked={checked} onToggle={onToggle} error={checklistError} />
      ) : (
        <p className={styles.empty}>یکی از Setupها را انتخاب کن تا چک‌لیست مخصوص آن اینجا نمایش داده شود.</p>
      )}
    </Card>
  );
}
