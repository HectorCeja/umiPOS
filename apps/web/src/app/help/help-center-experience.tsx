'use client';

import { NexoIcon } from '@nexo/ui';
import { useMemo, useState } from 'react';
import {
  InteractiveChecklist,
  FAQ,
  Glossary,
  SearchHelp,
  ScreenIntroduction,
  defaultScreenGuide,
  screenGuides,
  useHelpHistory,
} from '../contextual-help';

const glossary = [
  ['Organización', 'Tu negocio y su configuración compartida.'],
  ['Sucursal', 'La ubicación operativa cuyos datos estás consultando.'],
  ['Producto o presentación', 'Lo que vendes y, cuando aplica, su tamaño, sabor o variante.'],
  ['SKU', 'Código interno para reconocer un producto sin mostrar datos técnicos al cliente.'],
  ['Disponible', 'Existencia en mano menos unidades reservadas.'],
  ['Punto de cobro', 'Lugar lógico donde se registra una operación de caja.'],
  ['Venta suspendida', 'Venta guardada temporalmente para continuarla después.'],
] as const;
const faqs = [
  [
    '¿Dónde cambio de sucursal?',
    'Usa el selector de contexto en la barra superior. NEXO actualizará la información visible.',
  ],
  [
    '¿Por qué una acción está deshabilitada?',
    'La pantalla muestra la condición que falta; puede ser selección, permiso o estado de la operación.',
  ],
  [
    '¿Puedo recuperar una guía?',
    'Sí. Abre Ver guía en cualquier pantalla o restablece todos los recorridos aquí.',
  ],
] as const;

export function HelpCenterExperience() {
  const [query, setQuery] = useState('');
  const history = useHelpHistory();
  const guides = useMemo(
    () =>
      Object.entries(screenGuides).filter(([path, guide]) =>
        `${path.replaceAll('/', ' ')} ${guide.eyebrow} ${guide.title} ${guide.body} ${guide.terms?.join(' ') ?? ''}`
          .toLocaleLowerCase('es-MX')
          .includes(query.toLocaleLowerCase('es-MX')),
      ),
    [query],
  );
  return (
    <>
      <ScreenIntroduction guide={screenGuides['/help'] ?? defaultScreenGuide} />
      <SearchHelp
        value={query}
        onChange={setQuery}
        onClear={() => {
          setQuery('');
        }}
      />
      <section className="help-center-layout">
        <div>
          <p className="overline">GUÍAS POR MÓDULO</p>
          <div className="help-guide-grid">
            {guides.map(([path, guide]) => (
              <a href={path} className="help-guide-card" key={path}>
                <span>
                  <NexoIcon name={guide.icon} decorative />
                </span>
                <div>
                  <strong>{guide.title}</strong>
                  <p>{guide.body}</p>
                  <small>Ver guía →</small>
                </div>
              </a>
            ))}
          </div>
          {guides.length === 0 && (
            <div className="help-empty">
              <NexoIcon name="search" decorative />
              <strong>No encontramos esa pregunta</strong>
              <p>Prueba con producto, caja, inventario, venta o sucursal.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                }}
              >
                Ver todas las guías
              </button>
            </div>
          )}
        </div>
        <InteractiveChecklist
          items={[
            'Configura el negocio y la sucursal',
            'Crea tu primer producto',
            'Revisa inventario',
            'Prepara la caja',
          ]}
        />
      </section>
      <section className="help-reference-grid">
        <article className="premium-card">
          <p className="overline">GLOSARIO</p>
          <h2>Palabras claras para operar mejor</h2>
          <Glossary entries={glossary} />
        </article>
        <article className="premium-card">
          <p className="overline">PREGUNTAS FRECUENTES</p>
          <h2>Respuestas rápidas</h2>
          <FAQ entries={faqs} />
        </article>
      </section>
      <section className="premium-card help-history">
        <p className="overline">VISTO RECIENTEMENTE</p>
        <h2>Continúa donde aprendiste</h2>
        {history.length ? (
          <ul>
            {history.map(({ path, guide }) => (
              <li key={path}>
                <a href={path}>{guide?.title}</a>
              </li>
            ))}
          </ul>
        ) : (
          <p>Cuando abras una guía, aparecerá aquí para que puedas retomarla.</p>
        )}
      </section>
    </>
  );
}
