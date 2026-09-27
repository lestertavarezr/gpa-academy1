export function pushSupport() {
  const nav = globalThis.navigator;
  if (typeof globalThis.Notification === "undefined") return { push: false, notifications: false, reason: "Este navegador no ofrece notificaciones." };
  if (!nav?.serviceWorker || !("PushManager" in globalThis)) {
    const ios = /iPad|iPhone|iPod/.test(nav?.userAgent || "");
    return {
      push: false,
      notifications: true,
      reason: ios
        ? "En iPhone/iPad instala la app en la pantalla de inicio (Compartir → Añadir a inicio) para recibir avisos con la app cerrada."
        : "Sin push en este entorno: el aviso solo aparece con la app abierta.",
    };
  }
  return { push: true, notifications: true, reason: "" };
}

export async function registerServiceWorker(url = "sw.js") {
  if (!globalThis.navigator?.serviceWorker) return null;
  try {
    return await navigator.serviceWorker.register(url, { scope: "./" });
  } catch {
    return null;
  }
}

export function base64UrlToBytes(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

export function currentTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export async function subscribePush({ api, time }) {
  const registration = await navigator.serviceWorker.ready;
  const { publicKey } = await api.getPushKey();
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToBytes(publicKey),
    });
  }
  await api.putPushSubscription(subscription.toJSON(), { reminderTime: time, timezone: currentTimezone() });
  return subscription;
}

export async function unsubscribePush({ api }) {
  const registration = await navigator.serviceWorker?.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;
  await api.deletePushSubscription(subscription.endpoint).catch(() => {});
  await subscription.unsubscribe();
}
