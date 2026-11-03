'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useDismiss } from '@/hooks/useDismiss';
import { ChevronDownIcon } from './icons';
import styles from './Dropdown.module.css';

export interface DropdownOption<V extends string | number> {
  value: V;
  label: string;
}

interface DropdownProps<V extends string | number> {
  /** Id of the trigger button (pair it with `Field`'s `htmlFor`). */
  id: string;
  options: readonly DropdownOption<V>[];
  value: V;
  onChange: (value: V) => void;
  /** Rendered LTR (English / numeric labels). */
  ltr?: boolean;
}

/**
 * Select replacement whose list always opens directly beneath the trigger, full width.
 * Implements the ARIA listbox pattern (arrow keys, Home/End, Enter/Space, Escape).
 */
export function Dropdown<V extends string | number>({ id, options, value, onChange, ltr = true }: DropdownProps<V>) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = `${id}-list`;
  const optionId = (index: number) => `${id}-option-${index}`;

  const close = useCallback(() => setOpen(false), []);
  useDismiss(rootRef, open, close);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex];

  const show = () => {
    setActive(Math.max(0, selectedIndex));
    setOpen(true);
  };

  // Move focus into the list on open so keyboard navigation works.
  useEffect(() => {
    if (open) listRef.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (open) document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, active]);

  const choose = (index: number) => {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onTriggerKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      show();
    }
  };

  const onListKeyDown = (event: KeyboardEvent) => {
    const last = options.length - 1;
    switch (event.key) {
      case 'ArrowDown':
        setActive((i) => Math.min(last, i + 1));
        break;
      case 'ArrowUp':
        setActive((i) => Math.max(0, i - 1));
        break;
      case 'Home':
        setActive(0);
        break;
      case 'End':
        setActive(last);
        break;
      case 'Enter':
      case ' ':
        choose(active);
        break;
      case 'Escape':
        setOpen(false);
        triggerRef.current?.focus();
        break;
      case 'Tab':
        setOpen(false);
        return;
      default:
        return;
    }
    event.preventDefault();
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={`control ${styles.trigger}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onTriggerKeyDown}
      >
        <span dir={ltr ? 'ltr' : undefined}>{selected?.label ?? '—'}</span>
        <ChevronDownIcon className={styles.chevron} data-open={open || undefined} width={18} height={18} />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          className={styles.list}
          role="listbox"
          tabIndex={-1}
          dir={ltr ? 'ltr' : undefined}
          aria-activedescendant={optionId(active)}
          onKeyDown={onListKeyDown}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={optionId(index)}
              role="option"
              className={styles.option}
              aria-selected={option.value === value}
              data-active={index === active || undefined}
              onPointerMove={() => setActive(index)}
              onClick={() => choose(index)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
