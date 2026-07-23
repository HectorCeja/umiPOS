'use client';

import { Button, LivingScene, PremiumToastPortal } from '@nexo/ui';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch, csrfToken } from '../../../lib/api-client';

const api = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export default function AcceptInvitationPage() {
  const search = useSearchParams();
  const organization = search.get('organization') ?? '';
  const token = search.get('token') ?? '';
  const [state, setState] = useState<'checking' | 'ready' | 'saving' | 'accepted' | 'error'>(
    'checking',
  );
  const [message, setMessage] = useState('Validando tu invitación…');

  useEffect(() => {
    void apiFetch(`${api}/v1/identity`).then((response) => {
      if (response.status === 401) {
        const returnTo = `${window.location.pathname}${window.location.search}`;
        window.location.assign(`/?returnTo=${encodeURIComponent(returnTo)}`);
        return;
      }
      if (!response.ok || !organization || !token) {
        setState('error');
        setMessage('La invitación no es válida o ya no está disponible.');
        return;
      }
      setState('ready');
      setMessage('La invitación está lista para aceptarse con tu cuenta actual.');
    });
  }, [organization, token]);

  async function accept() {
    setState('saving');
    const response = await apiFetch(`${api}/v1/organizations/${organization}/invitations/accept`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-csrf-token': csrfToken() },
      body: JSON.stringify({ token }),
    });
    if (!response.ok) {
      setState('error');
      setMessage(
        response.status === 403
          ? 'Esta invitación expiró, ya se utilizó o pertenece a otro correo.'
          : 'No pudimos aceptar la invitación. Intenta de nuevo.',
      );
      return;
    }
    setState('accepted');
    setMessage('Acceso confirmado. Ya formas parte de la organización.');
  }

  return (
    <LivingScene variant="onboarding" quality="balanced" className="ambient-experience">
      <main className="invitation-acceptance">
        {['saving', 'accepted', 'error'].includes(state) && (
          <PremiumToastPortal
            title={
              state === 'saving'
                ? 'Confirmando invitación'
                : state === 'accepted'
                  ? 'Invitación aceptada'
                  : 'No pudimos aceptar la invitación'
            }
            detail={message}
            tone={state === 'accepted' ? 'success' : state === 'error' ? 'danger' : 'info'}
            duration={state === 'saving' ? 60_000 : 6000}
            onDismiss={() => {
              if (state !== 'saving') setState(state === 'accepted' ? 'accepted' : 'ready');
            }}
          />
        )}
        <section className="panel" aria-live="polite">
          <p className="overline">INVITACIÓN DE EQUIPO</p>
          <h1>Únete a la organización</h1>
          <p>{message}</p>
          {state === 'ready' && <Button onClick={() => void accept()}>Aceptar invitación</Button>}
          {state === 'saving' && <Button disabled>Confirmando acceso…</Button>}
          {state === 'accepted' && <a href="/">Entrar a NEXO</a>}
          {state === 'error' && <a href="/help">Solicitar ayuda</a>}
        </section>
      </main>
    </LivingScene>
  );
}
