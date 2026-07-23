import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Alert,
  Button,
  EmptyState,
  ErrorBoundarySurface,
  OfflineIndicator,
  SyncStatus,
} from './index.js';
import './styles.css';
const meta = {
  title: 'Patterns/Feedback',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const RecoverableStates: Story = {
  render: () => (
    <div className="nexo-root nexo-stack">
      <OfflineIndicator />
      <SyncStatus pending={3} />
      <Alert tone="warning" title="La venta cambió en otro dispositivo">
        Actualiza la información antes de continuar. Tus cambios locales no se perdieron.
      </Alert>
      <ErrorBoundarySurface
        title="No pudimos cargar las ventas"
        detail="Revisa tu conexión e intenta nuevamente."
        action={<Button>Reintentar</Button>}
      />
      <EmptyState title="Aún no hay ventas" description="Las ventas completadas aparecerán aquí." />
    </div>
  ),
};
