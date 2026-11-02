import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  title?: string;
  /** Small text on the opposite side of the title (e.g. a progress badge). */
  aside?: ReactNode;
  id?: string;
  children: ReactNode;
}

export function Card({ title, aside, id, children }: CardProps) {
  return (
    <section className={styles.card} id={id}>
      {(title || aside) && (
        <header className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {aside}
        </header>
      )}
      {children}
    </section>
  );
}
