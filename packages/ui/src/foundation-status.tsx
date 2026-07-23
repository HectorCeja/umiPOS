export interface FoundationStatusProps {
  readonly label: string;
}

export function FoundationStatus({ label }: FoundationStatusProps) {
  return <output className="nexo-foundation-status">{label}</output>;
}
