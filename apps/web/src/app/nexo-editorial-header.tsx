import type { ReactNode } from 'react';

interface NexoEditorialHeaderProps {
  eyebrow?: string;
  title: string;
  statement: ReactNode;
  description: string;
  actions?: ReactNode;
  tone: 'sales' | 'cash';
}

export function NexoEditorialHeader({
  eyebrow,
  title,
  statement,
  description,
  actions,
  tone,
}: NexoEditorialHeaderProps) {
  return (
    <section className={`nexo-editorial-header nexo-editorial-header--${tone}`}>
      <div className="nexo-editorial-header__functional">
        {eyebrow && <p>{eyebrow}</p>}
        <h1>{title}</h1>
        <span>{description}</span>
      </div>
      <div className="nexo-editorial-header__statement" data-editorial-reveal>
        <strong>{statement}</strong>
        <i aria-hidden="true" />
      </div>
      {actions && <div className="nexo-editorial-header__actions">{actions}</div>}
    </section>
  );
}
