import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AppShell,
  BranchSelector,
  Button,
  DataGrid,
  FeatureStatus,
  MetricCard,
  PageHeader,
  SearchInput,
  Toolbar,
} from './index.js';
import './styles.css';

const meta = {
  title: 'Patterns/Admin',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
const nav = [
  { id: 'home', label: 'Inicio', href: '#', current: true },
  { id: 'sales', label: 'Ventas', href: '#' },
  { id: 'products', label: 'Productos', href: '#' },
  { id: 'inventory', label: 'Inventario', href: '#' },
  { id: 'team', label: 'Equipo', href: '#' },
  { id: 'settings', label: 'Configuración', href: '#' },
];
export const Shell: Story = {
  render: () => (
    <AppShell items={nav} topbar={<strong>Organización Alpha · Centro</strong>}>
      <PageHeader
        title="Inicio"
        description="Información prioritaria de tu negocio."
        actions={<Button>Acción rápida</Button>}
      />
      <div className="nexo-metrics">
        <MetricCard label="Ventas de hoy" value="$12,480.00" detail="Dato de demostración visual" />
        <MetricCard label="Operaciones" value="84" />
        <MetricCard label="Estado" value={<FeatureStatus enabled label="Ventas" />} />
      </div>
      <Toolbar aria-label="Filtros">
        <SearchInput label="Buscar" />
        <BranchSelector
          value="centro"
          onChange={() => undefined}
          options={[{ label: 'Centro', value: 'centro' }]}
        />
      </Toolbar>
      <DataGrid>
        <thead>
          <tr>
            <th>Folio</th>
            <th>Estado</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>A-1042</td>
            <td>Completada</td>
            <td>$245.00</td>
          </tr>
          <tr>
            <td>A-1041</td>
            <td>Suspendida</td>
            <td>$89.00</td>
          </tr>
        </tbody>
      </DataGrid>
    </AppShell>
  ),
};
