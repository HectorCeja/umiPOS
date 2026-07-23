import { NexoIcon, type NexoIconName } from '@nexo/ui';

export const productTypeIcons = {
  PHYSICAL: 'package',
  SERVICE: 'briefcase',
} as const satisfies Record<string, NexoIconName>;

const aliases: Record<string, NexoIconName> = {
  bag: 'package',
  box: 'package',
  package: 'package',
  physical: 'package',
  service: 'briefcase',
  briefcase: 'briefcase',
  cup: 'coffee',
  coffee: 'coffee',
  food: 'utensils',
  utensils: 'utensils',
};

export function resolveProductIcon(value?: string | null, type?: string | null): NexoIconName {
  const normalized = value?.trim().toLowerCase();
  if (normalized && aliases[normalized]) return aliases[normalized];
  return type === 'SERVICE' ? productTypeIcons.SERVICE : productTypeIcons.PHYSICAL;
}

export function ProductIcon({
  value,
  type,
  label,
}: {
  value?: string | null | undefined;
  type?: string | null | undefined;
  label?: string | undefined;
}) {
  return (
    <NexoIcon
      name={resolveProductIcon(value, type)}
      decorative={!label}
      data-product-icon={resolveProductIcon(value, type)}
      {...(label ? { label } : {})}
    />
  );
}

export const productIconChoices = [
  { id: 'package', label: 'Producto físico' },
  { id: 'briefcase', label: 'Servicio' },
  { id: 'coffee', label: 'Bebida' },
  { id: 'utensils', label: 'Alimento' },
] as const;
