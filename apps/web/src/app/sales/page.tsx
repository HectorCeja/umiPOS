import { SalesAdministrationConsole } from './sales-administration-console';
import { NexoAppShell } from '../global-shell';
export default function SalesPage() {
  return (
    <NexoAppShell active="sales">
      <SalesAdministrationConsole />
    </NexoAppShell>
  );
}
