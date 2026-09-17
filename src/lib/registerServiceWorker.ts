const SW_URL = '/sw.js';

const esContextoBloqueado = () => {
  if (!import.meta.env.PROD) return true;
  if (typeof window === 'undefined') return true;
  if (window.self !== window.top) return true;
  const host = window.location.hostname;
  if (host.startsWith('id-preview--') || host.startsWith('preview--')) return true;
  if (host === 'lovableproject.com' || host.endsWith('.lovableproject.com')) return true;
  if (host === 'lovableproject-dev.com' || host.endsWith('.lovableproject-dev.com')) return true;
  if (host === 'beta.lovable.dev' || host.endsWith('.beta.lovable.dev')) return true;
  if (new URL(window.location.href).searchParams.get('sw') === 'off') return true;
  return false;
};

export const registrarServiceWorker = async () => {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  if (esContextoBloqueado()) {
    const registros = await navigator.serviceWorker.getRegistrations();
    await Promise.allSettled(
      registros
        .filter(r => r.active?.scriptURL.endsWith(SW_URL) || r.installing?.scriptURL.endsWith(SW_URL))
        .map(r => r.unregister()),
    );
    return;
  }

  try {
    await navigator.serviceWorker.register(SW_URL, { scope: '/' });
  } catch {
    // Sin avisos en segundo plano; la app sigue funcionando igual.
  }
};
