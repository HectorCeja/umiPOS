import { CashConsole } from './cash-console';
import { NexoAppShell } from '../global-shell';

export default function CashPage() {
  return (
    <NexoAppShell active="cash">
      <CashConsole />
    </NexoAppShell>
  );
}
