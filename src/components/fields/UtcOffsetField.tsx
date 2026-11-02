import { useId } from 'react';
import { Field } from '@/components/ui/Field';
import { isValidDate, isValidTime, toUtc, UTC_OFFSET_OPTIONS } from '@/lib/time';

interface UtcOffsetFieldProps {
  /** Offset in minutes. */
  value: number;
  onChange: (minutes: number) => void;
  /** Used only to show the UTC equivalent of the entered time. */
  date: string;
  time: string;
}

export function UtcOffsetField({ value, onChange, date, time }: UtcOffsetFieldProps) {
  const selectId = useId();
  const utc = isValidDate(date) && isValidTime(time) ? toUtc(date, time, value) : null;

  return (
    <Field
      id="utcOffset"
      label="منطقه‌ی زمانی (UTC/GMT)"
      htmlFor={selectId}
      hint={
        utc ? (
          <>
            ساعت وارد‌شده برابر است با <bdi dir="ltr">{`${utc.date} ${utc.time} UTC`}</bdi>
          </>
        ) : null
      }
    >
      <select
        id={selectId}
        className="control"
        dir="ltr"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {UTC_OFFSET_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
