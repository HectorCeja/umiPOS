import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  FormField,
  MoneyInput,
  OfflineIndicator,
  RadioGroup,
  Select,
  Skeleton,
  StatusBadge,
  Switch,
  TextArea,
  TextField,
} from './index.js';
import './styles.css';

const meta = {
  title: 'Foundations/Tokens and controls',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const SemanticTokens: Story = {
  render: () => (
    <div className="nexo-root nexo-stack">
      <h1>Tokens semánticos</h1>
      <div className="nexo-cluster">
        <StatusBadge tone="success">Correcto</StatusBadge>
        <StatusBadge tone="warning">Pendiente</StatusBadge>
        <StatusBadge tone="danger">Requiere atención</StatusBadge>
        <StatusBadge tone="info">Información</StatusBadge>
      </div>
      <Alert title="Estado recuperable">Tus datos siguen seguros. Intenta nuevamente.</Alert>
      <OfflineIndicator />
    </div>
  ),
};
export const Controls: Story = {
  render: () => (
    <form
      className="nexo-root nexo-stack"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <TextField label="Nombre del producto" required />
      <TextArea label="Descripción" />
      <MoneyInput label="Precio base" currency="MXN" />
      <Select
        label="Estado"
        options={[
          { label: 'Activo', value: 'active' },
          { label: 'Archivado', value: 'archived' },
        ]}
      />
      <Checkbox>Acepto guardar los cambios</Checkbox>
      <Switch label="Disponible en POS" />
      <RadioGroup
        legend="Densidad"
        name="density"
        options={[
          { label: 'Cómoda', value: 'comfortable' },
          { label: 'Compacta', value: 'compact' },
        ]}
      />
      <FormField
        label="Campo con error"
        htmlFor="field-with-error"
        error="Escribe un valor válido."
      >
        <input id="field-with-error" className="nexo-field" aria-invalid="true" />
      </FormField>
      <div className="nexo-cluster">
        <Button>Guardar</Button>
        <Button variant="secondary">Cancelar</Button>
        <Button variant="danger">Archivar</Button>
        <Button loading>Guardar</Button>
      </div>
      <Skeleton />
    </form>
  ),
};
export const DarkTouch: Story = {
  globals: { backgrounds: { value: 'dark' } },
  render: () => (
    <div className="nexo-root nexo-stack" data-theme="dark" data-density="touch">
      <Card>
        <h2>Modo oscuro · densidad táctil</h2>
        <p>Los objetivos interactivos conservan un mínimo de 44 px.</p>
        <Button>Continuar</Button>
      </Card>
    </div>
  ),
};
