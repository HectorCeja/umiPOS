import type { Meta, StoryObj } from '@storybook/react-vite';
import { LivingScene } from './experience.js';
import './styles.css';

const meta = {
  title: 'Foundations/Living Scene',
  component: LivingScene,
  parameters: { layout: 'fullscreen' },
  args: {
    image:
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"%3E%3Crect width="100%25" height="100%25" fill="%23050914"/%3E%3C/svg%3E',
    overlay: 'strong',
    children: null,
  },
  render: ({ image, overlay, className }) => (
    <LivingScene image={image ?? ''} overlay={overlay ?? 'strong'} className={className ?? ''}>
      <div style={{ padding: 64, color: 'white' }}>
        <h1>Vende mejor. Crece más rápido.</h1>
        <p>Escena ambiental reutilizable de NEXO.</p>
      </div>
    </LivingScene>
  ),
} satisfies Meta<typeof LivingScene>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const LoginStatic: Story = {
  args: { variant: 'login', quality: 'static', deterministic: true },
};
export const HomeBalanced: Story = {
  args: { variant: 'home', quality: 'balanced' },
};
export const ReducedQuality: Story = {
  args: { variant: 'home', quality: 'reduced' },
};
