'use client';

import { useState } from 'react';

export function HelpPreferences() {
  const [notice, setNotice] = useState('');
  return (
    <section className="premium-card">
      <h2>Ayudas y recorridos</h2>
      <p>Vuelve a mostrar las introducciones contextuales en tu próxima visita a cada pantalla.</p>
      <button
        type="button"
        onClick={() => {
          for (const key of Object.keys(localStorage)) {
            if (key.startsWith('nexo.help.v1.') || key.startsWith('nexo.help.v2.'))
              localStorage.removeItem(key);
          }
          setNotice('Ayudas y recorridos restablecidos.');
        }}
      >
        Restablecer ayudas y recorridos
      </button>
      <p role="status" aria-live="polite">
        {notice}
      </p>
    </section>
  );
}
