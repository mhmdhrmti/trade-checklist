import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  title?: string;
  /** Icon shown in a tinted tile before the title. */
  icon?: ReactNode;
  /** Small element on the opposite side of the title (e.g. a progress badge). */
  aside?: ReactNode;
  id?: string;
  children: ReactNode;
}

export function Card({ title, icon, aside, id, children }: CardProps) {
  return (
    <section className={styles.card} id={id}>
      {(title || aside) && (
        <header className={styles.header}>
          {icon && <span className={styles.icon}>{icon}</span>}
          {title && <h2 className={styles.title}>{title}</h2>}
          {aside && <span className={styles.aside}>{aside}</span>}
        </header>
      )}
      {children}
    </section>
  );
}
