import { useId } from 'react';
import { Field } from '@/components/ui/Field';
import { MAX_NOTES_LENGTH } from '@/config/options';

interface NotesFieldProps {
  value: string;
  onChange: (notes: string) => void;
}

/** The only optional field of the form. */
export function NotesField({ value, onChange }: NotesFieldProps) {
  const textareaId = useId();
  return (
    <Field id="notes" label="یادداشت معامله" htmlFor={textareaId} optional>
      <textarea
        id={textareaId}
        className="control"
        rows={3}
        maxLength={MAX_NOTES_LENGTH}
        placeholder="مثلاً: کندل تأیید ضعیف بود، قبل از خبر وارد شدم…"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{ resize: 'vertical' }}
      />
    </Field>
  );
}
