import type { Meta, StoryObj } from '@storybook/react-vite';

import { NexoBrand } from './primitives.js';
import './styles.css';

type Direction = 'hospitality' | 'enterprise' | 'luxury';

const copy = {
  hospitality: {
    eyebrow: 'Hospitality Premium',
    greeting: 'Tu negocio tiene buen ritmo, Héctor.',
    description: 'Una experiencia cálida que convierte la operación diaria en una historia clara.',
  },
  enterprise: {
    eyebrow: 'Enterprise Modern',
    greeting: 'Todo lo importante, en orden.',
    description: 'Decisiones rápidas, contexto estable y una jerarquía que escala con el negocio.',
  },
  luxury: {
    eyebrow: 'Tech Luxury',
    greeting: 'Tu operación, con otra dimensión.',
    description: 'Profundidad visual y precisión tecnológica para una experiencia memorable.',
  },
} as const;

function VisualDirection({ direction }: { direction: Direction }) {
  const content = copy[direction];
  return (
    <main className={`design-concept design-concept--${direction}`}>
      <aside className="design-concept__rail">
        <NexoBrand className="design-concept__brand" variant="compact" />
        <div className="design-concept__business">
          <b>CH</b>
          <span>
            Café Horizonte<small>Centro</small>
          </span>
        </div>
        <nav aria-label="Vista conceptual">
          {['Inicio', 'Ventas', 'Caja', 'Productos', 'Inventario'].map((item, index) => (
            <span key={item} className={index === 0 ? 'active' : ''}>
              <i>{['⌂', '↗', '◇', '□', '▥'][index]}</i>
              {item}
            </span>
          ))}
        </nav>
      </aside>
      <section className="design-concept__canvas">
        <header className="design-concept__top">
          <span>⌕ Buscar en NEXO</span>
          <b>Centro</b>
          <i>HC</i>
        </header>
        <div className="design-concept__hero">
          <div>
            <small>{content.eyebrow}</small>
            <h1>{content.greeting}</h1>
            <p>{content.description}</p>
          </div>
          <button type="button">
            Revisar el día <span>→</span>
          </button>
        </div>
        <div className="design-concept__metrics">
          {[
            ['Ventas de hoy', '$18,420', '24 operaciones'],
            ['Caja', '$7,860', 'Sesión saludable'],
            ['Inventario', '3 alertas', 'Requieren atención'],
          ].map(([label, value, note], index) => (
            <article key={label}>
              <i>{['↗', '◇', '▥'][index]}</i>
              <span>
                <small>{label}</small>
                <strong>{value}</strong>
                <em>{note}</em>
              </span>
            </article>
          ))}
        </div>
        <div className="design-concept__lower">
          <article className="design-concept__activity">
            <header>
              <span>
                <small>Actividad</small>
                <strong>Así se mueve tu negocio</strong>
              </span>
              <b>Hoy</b>
            </header>
            <div className="design-concept__bars">
              {[42, 66, 48, 78, 58, 92, 72, 84].map((height, index) => (
                <i key={index} style={{ height: `${String(height)}%` }} />
              ))}
            </div>
            <footer>
              <span>8 a. m.</span>
              <span>Ahora</span>
            </footer>
          </article>
          <article className="design-concept__attention">
            <small>REQUIERE TU ATENCIÓN</small>
            <strong>Leche entera</strong>
            <p>Quedan 8 unidades en Centro.</p>
            <button type="button">Revisar inventario</button>
          </article>
        </div>
      </section>
    </main>
  );
}

const meta = {
  title: 'Design freeze/Three directions',
  component: VisualDirection,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof VisualDirection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HospitalityPremium: Story = { args: { direction: 'hospitality' } };
export const EnterpriseModern: Story = { args: { direction: 'enterprise' } };
export const TechLuxury: Story = { args: { direction: 'luxury' } };
