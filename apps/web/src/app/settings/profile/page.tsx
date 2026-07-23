'use client';
import {
  Button,
  FileUpload,
  MutationButton,
  NexoSelect,
  SaveStatus,
  TextField,
  type MutationState,
} from '@nexo/ui';
import { useEffect, useState, type FormEvent } from 'react';
import { NexoAppShell } from '../../global-shell';
import { apiFetch, browserReachableUrl } from '../../../lib/api-client';
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
interface Identity {
  email: string;
  displayName: string;
  avatarUrl?: string | null;
}
export default function ProfilePage() {
  const [email, setEmail] = useState('');
  const [given, setGiven] = useState('');
  const [family, setFamily] = useState('');
  const [display, setDisplay] = useState('');
  const [locale, setLocale] = useState('es-MX');
  const [zone, setZone] = useState('America/Mazatlan');
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState<File>();
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [mutation, setMutation] = useState<MutationState>('idle');
  const [preview, setPreview] = useState('');
  useEffect(() => {
    if (!avatarFile) {
      setPreview(avatar ? browserReachableUrl(avatar).toString() : avatar);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setPreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [avatar, avatarFile]);
  useEffect(() => {
    void apiFetch(`${apiBase}/v1/identity`, { credentials: 'include' }).then(async (r) => {
      if (r.ok) {
        const x = (await r.json()) as {
          email: string;
          displayName: string;
          avatarUrl?: string | null;
        };
        setEmail(x.email);
        setDisplay(x.displayName);
        setAvatar(x.avatarUrl ?? '');
        const parts = x.displayName.split(' ');
        setGiven(parts[0] ?? '');
        const familyName = parts.slice(1).join(' ');
        setFamily(familyName);
      }
    });
  }, []);
  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMutation('saving');
    setNotice('');
    if (avatarFile) {
      const prepared = await apiFetch(`${apiBase}/v1/profile/avatar/uploads`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json', 'x-csrf-token': csrf() },
        body: JSON.stringify({
          contentType: avatarFile.type,
          fileName: avatarFile.name,
          size: avatarFile.size,
        }),
      });
      if (!prepared.ok) {
        setSaving(false);
        setMutation('error');
        setNotice('No pudimos preparar la foto. Usa PNG, JPEG o WebP de menos de 5 MB.');
        return;
      }
      const upload = (await prepared.json()) as { uploadUrl: string; objectKey: string };
      const sent = await apiFetch(upload.uploadUrl, {
        method: 'PUT',
        body: avatarFile,
        headers: { 'content-type': avatarFile.type },
      });
      if (!sent.ok) {
        setSaving(false);
        setMutation('error');
        setNotice('La foto no pudo subirse. Conservamos tus cambios para que intentes de nuevo.');
        return;
      }
      // MinIO returns an empty success body. Consume it before continuing so
      // the browser does not cancel the upload stream during a later refresh.
      await sent.arrayBuffer();
      const completed = await apiFetch(`${apiBase}/v1/profile/avatar/complete`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json', 'x-csrf-token': csrf() },
        body: JSON.stringify({ objectKey: upload.objectKey }),
      });
      if (!completed.ok) {
        setSaving(false);
        setMutation('error');
        setNotice('No pudimos confirmar la foto. Intenta de nuevo.');
        return;
      }
      const persistedAvatar = ((await completed.json()) as { avatarUrl: string }).avatarUrl;
      setAvatar(persistedAvatar);
      setAvatarFile(undefined);
    }
    const response = await apiFetch(`${apiBase}/v1/profile`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'content-type': 'application/json', 'x-csrf-token': csrf() },
      body: JSON.stringify({
        displayName: display,
        givenName: given,
        familyName: family,
        locale,
        timeZone: zone,
        preferences: {
          theme: localStorage.getItem('nexo-theme') ?? 'system',
          density: 'comfortable',
        },
      }),
    });
    if (response.ok) await response.json();
    setNotice(
      response.ok
        ? 'Perfil actualizado. Tu nombre y tu foto ya te representan en todo NEXO.'
        : 'No pudimos guardar el perfil. Conservamos tus cambios para que puedas intentarlo de nuevo.',
    );
    setMutation(response.ok ? 'success' : response.status === 409 ? 'conflict' : 'error');
    setSaving(false);
    if (response.ok) {
      const identityResponse = await apiFetch(`${apiBase}/v1/identity`);
      if (identityResponse.ok) {
        const updatedIdentity = (await identityResponse.json()) as Identity;
        window.dispatchEvent(
          new CustomEvent<Identity>('nexo:identity-updated', { detail: updatedIdentity }),
        );
      }
    }
  }
  async function removeAvatar() {
    setSaving(true);
    setMutation('saving');
    setNotice('');
    const response = await apiFetch(`${apiBase}/v1/profile/avatar`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'x-csrf-token': csrf() },
    });
    if (response.ok) {
      setAvatar('');
      setAvatarFile(undefined);
      setMutation('success');
      setNotice('Foto eliminada. Usaremos tus iniciales.');
      window.dispatchEvent(
        new CustomEvent('nexo:identity-updated', {
          detail: { email, displayName: display, avatarUrl: null },
        }),
      );
    } else {
      setMutation('error');
      setNotice('No pudimos eliminar la foto. Intenta de nuevo.');
    }
    setSaving(false);
  }
  return (
    <NexoAppShell active="settings">
      <main className="settings-surface">
        <p className="overline">TU CUENTA</p>
        <h1>Perfil y preferencias</h1>
        <p>Decide cómo aparecerás dentro de NEXO y adapta la experiencia a ti.</p>
        <form className="premium-form" onSubmit={(e) => void save(e)}>
          <div className="profile-avatar">
            <span>
              {given[0]}
              {family[0]}
            </span>
            <div>
              <strong>Foto de perfil</strong>
              <p>
                Sube una imagen privada desde tu dispositivo. NEXO valida el archivo antes de
                guardarlo.
              </p>
              <FileUpload
                label="Foto de perfil"
                help="PNG, JPEG o WebP, máximo 5 MB."
                preview={preview}
                onFile={setAvatarFile}
              />
              {(avatar || avatarFile) && (
                <Button
                  type="button"
                  variant="danger"
                  disabled={saving}
                  onClick={() => void removeAvatar()}
                >
                  Eliminar foto
                </Button>
              )}
            </div>
          </div>
          <TextField
            label="Nombre"
            value={given}
            onChange={(e) => {
              setGiven(e.currentTarget.value);
            }}
            required
          />
          <TextField
            label="Apellidos"
            value={family}
            onChange={(e) => {
              setFamily(e.currentTarget.value);
            }}
            required
          />
          <TextField
            label="Nombre visible"
            value={display}
            onChange={(e) => {
              setDisplay(e.currentTarget.value);
            }}
            help="Así te verá tu equipo."
            required
          />
          <TextField
            label="Correo electrónico"
            value={email}
            disabled
            help="Verificado. Para cambiarlo se requiere un flujo de seguridad."
          />
          <NexoSelect
            label="Idioma"
            value={locale}
            onValueChange={setLocale}
            options={[
              { value: 'es-MX', label: 'Español (México)' },
              { value: 'en-US', label: 'English (United States)' },
            ]}
          />
          <NexoSelect
            label="Zona horaria"
            value={zone}
            onValueChange={setZone}
            options={[
              { value: 'America/Mazatlan', label: 'Mazatlán' },
              { value: 'America/Mexico_City', label: 'Ciudad de México' },
              { value: 'America/Tijuana', label: 'Tijuana' },
            ]}
          />
          {notice && <p role="status">{notice}</p>}
          <SaveStatus state={mutation} />
          <MutationButton type="submit" state={mutation} disabled={saving}>
            Guardar perfil
          </MutationButton>
        </form>
      </main>
    </NexoAppShell>
  );
}
function csrf() {
  return decodeURIComponent(
    document.cookie
      .split('; ')
      .find((x) => x.startsWith('nexo_csrf='))
      ?.split('=')[1] ?? '',
  );
}
