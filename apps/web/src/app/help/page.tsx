import { NexoAppShell } from '../global-shell';
import { HelpPreferences } from './help-preferences';
import { HelpCenterExperience } from './help-center-experience';
export default function HelpPage() {
  return (
    <NexoAppShell active="help">
      <main className="settings-surface">
        <p className="overline">CENTRO DE AYUDA</p>
        <h1>Respuestas que te devuelven al trabajo.</h1>
        <p>Guías breves, términos claros y recorridos que puedes retomar cuando los necesites.</p>
        <HelpCenterExperience />
        <HelpPreferences />
      </main>
    </NexoAppShell>
  );
}
