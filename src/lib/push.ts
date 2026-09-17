import { supabase } from '@/integrations/supabase/client';
import { RecordatorioPayload } from '@/lib/agenda';

/** Clave pública VAPID (publicable, puede vivir en el cliente). */
export const VAPID_PUBLIC_KEY =
  'BBMzrT3ETmHPXjSxBAF2t2UywsxA8wh-mMCKM8tvaNdMAT2LY-oDYRBOZuvN5Kv_OR9mbQhtHp-Pj_fpNbPJrhg';

const PENDIENTE_KEY = 'matriz-recordatorios-pendientes';
const AVISOS_ACTIVOS_KEY = 'matriz-avisos-activos';

export const avisosActivadosEnDispositivo = () => localStorage.getItem(AVISOS_ACTIVOS_KEY) === '1';

export const soportaPush = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

const base64UrlADatos = (base64: string) => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const normal = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const bruto = atob(normal);
  return Uint8Array.from([...bruto].map(c => c.charCodeAt(0)));
};

const arrayBufferABase64Url = (buffer: ArrayBuffer | null) => {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binario = '';
  bytes.forEach(b => (binario += String.fromCharCode(b)));
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

/** Sesión anónima: identifica esta instalación sin pedir datos al niño. */
const asegurarSesion = async () => {
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session;
  const { data: nueva, error } = await supabase.auth.signInAnonymously();
  if (error) return null;
  return nueva.session;
};

/** Registra este dispositivo para recibir avisos aunque la app esté cerrada. */
export const activarAvisos = async (): Promise<{ ok: boolean; motivo?: string }> => {
  if (!soportaPush()) return { ok: false, motivo: 'no-soportado' };

  const permiso = await Notification.requestPermission();
  if (permiso !== 'granted') return { ok: false, motivo: 'permiso' };

  const registro = await navigator.serviceWorker.getRegistration();
  if (!registro) return { ok: false, motivo: 'sin-service-worker' };

  const sesion = await asegurarSesion();
  if (!sesion) return { ok: false, motivo: 'sesion' };

  const existente = await registro.pushManager.getSubscription();
  const suscripcion =
    existente ??
    (await registro.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlADatos(VAPID_PUBLIC_KEY),
    }));

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: sesion.user.id,
      endpoint: suscripcion.endpoint,
      p256dh: arrayBufferABase64Url(suscripcion.getKey('p256dh')),
      auth: arrayBufferABase64Url(suscripcion.getKey('auth')),
      active: true,
    },
    { onConflict: 'endpoint' },
  );
  if (error) return { ok: false, motivo: 'guardado' };

  localStorage.setItem(AVISOS_ACTIVOS_KEY, '1');
  await sincronizarPendientes();
  return { ok: true };
};

export const desactivarAvisos = async () => {
  localStorage.setItem(AVISOS_ACTIVOS_KEY, '0');
  if (!soportaPush()) return;
  const registro = await navigator.serviceWorker.getRegistration();
  const suscripcion = await registro?.pushManager.getSubscription();
  if (!suscripcion) return;
  await supabase.from('push_subscriptions').update({ active: false }).eq('endpoint', suscripcion.endpoint);
};

const guardarPendiente = (recordatorios: RecordatorioPayload[]) => {
  localStorage.setItem(PENDIENTE_KEY, JSON.stringify(recordatorios));
};

const leerPendiente = (): RecordatorioPayload[] | null => {
  try {
    const bruto = localStorage.getItem(PENDIENTE_KEY);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
};

const enviarRecordatorios = async (recordatorios: RecordatorioPayload[]) => {
  const sesion = await asegurarSesion();
  if (!sesion) return false;
  const userId = sesion.user.id;
  const zona = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  if (recordatorios.length > 0) {
    const { error } = await supabase.from('scheduled_reminders').upsert(
      recordatorios.map(r => ({ ...r, user_id: userId, timezone: zona, enabled: true })),
      { onConflict: 'user_id,occurrence_id' },
    );
    if (error) return false;
  }

  const vigentes = recordatorios.map(r => r.occurrence_id);
  const borrado =
    vigentes.length > 0
      ? await supabase
          .from('scheduled_reminders')
          .delete()
          .eq('user_id', userId)
          .not('occurrence_id', 'in', `(${vigentes.map(v => `"${v}"`).join(',')})`)
      : await supabase.from('scheduled_reminders').delete().eq('user_id', userId);

  return !borrado.error;
};

/**
 * Sincroniza los recordatorios con el servidor.
 * Si no hay conexión o falla, queda pendiente y se reintenta solo.
 */
export const sincronizarRecordatorios = async (recordatorios: RecordatorioPayload[]) => {
  if (!avisosActivadosEnDispositivo()) return;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    guardarPendiente(recordatorios);
    return;
  }
  try {
    const ok = await enviarRecordatorios(recordatorios);
    if (ok) localStorage.removeItem(PENDIENTE_KEY);
    else guardarPendiente(recordatorios);
  } catch {
    guardarPendiente(recordatorios);
  }
};

export const sincronizarPendientes = async () => {
  const pendiente = leerPendiente();
  if (!pendiente) return;
  await sincronizarRecordatorios(pendiente);
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => void sincronizarPendientes());
}
