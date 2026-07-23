'use client';

import type { ReactNode } from 'react';
import { NexoBrand } from '@nexo/ui';

export function NexoWordmark({ compact = false }: { compact?: boolean }) {
  return <NexoBrand variant={compact ? 'compact' : 'full'} className="cinematic-wordmark" />;
}

export function EditorialHeadline({ children }: { children: ReactNode }) {
  return <h1 className="editorial-headline">{children}</h1>;
}

export function GlassPanel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`cinematic-glass-panel ${className}`}>{children}</div>;
}

export function AnimatedProgress({ value, total }: { value: number; total: number }) {
  const percentage = Math.max(0, Math.min(100, (value / total) * 100));
  return (
    <div
      className="cinematic-progress"
      role="progressbar"
      aria-label="Progreso del recorrido"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={value}
    >
      <span>{Math.round(percentage)}% completado</span>
      <div aria-hidden="true">
        <i style={{ width: `${String(percentage)}%` }} />
      </div>
    </div>
  );
}
