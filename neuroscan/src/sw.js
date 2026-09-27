/* global __SHELL_FILES__, __MEDIA_FILES__, __CACHE_VERSION__ */
const SHELL_CACHE = `neuroscan-shell-${__CACHE_VERSION__}`;
const MEDIA_CACHE = "neuroscan-media";
const SHELL = __SHELL_FILES__;
const MEDIA = __MEDIA_FILES__;

async function cacheMissing(cacheName, urls) {
  const cache = await caches.open(cacheName);
  await Promise.all(
    urls.map(async (url) => {
      if (!(await cache.match(url))) await cache.add(url);
    }),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL)), cacheMissing(MEDIA_CACHE, MEDIA)]).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.startsWith("neuroscan-shell-") && key !== SHELL_CACHE).map((key) => caches.delete(key)));
      // Media file names are content-hashed, so anything not in the current list is stale.
      const media = await caches.open(MEDIA_CACHE);
      const current = new Set(MEDIA.map((path) => new URL(path, self.registration.scope).href));
      for (const request of await media.keys()) if (!current.has(request.url)) await media.delete(request);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.includes("/api/")) return;
  if (request.mode === "navigate") {
    const scopePath = new URL(self.registration.scope).pathname;
    const isAppShell = url.pathname === scopePath || url.pathname === `${scopePath}index.html`;
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && isAppShell) {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put("./", copy));
          }
          return response;
        })
        .catch(async () => (isAppShell && (await caches.match("./"))) || Response.error()),
    );
    return;
  }
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok && url.pathname.includes("/media/")) {
            const copy = response.clone();
            caches.open(MEDIA_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data?.json() ?? {};
  } catch {
    data = {};
  }
  const title = typeof data.title === "string" ? data.title : "NEURO//SCAN · Repaso";
  const body = typeof data.body === "string" ? data.body : "Te espera una sesión corta de neuroimágenes.";
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "icons/icon-192.png",
      badge: "icons/icon-192.png",
      tag: "neuroscan-reminder",
      renotify: false,
      data: { url: self.registration.scope },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || self.registration.scope;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const existing = windows.find((client) => client.url.startsWith(self.registration.scope));
      if (existing) return existing.focus();
      return self.clients.openWindow(target);
    })(),
  );
});
