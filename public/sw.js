const BASE_PATH = "/naranusa";
const CACHE_NAME = "naranusa-shell-v3";
const ROOT_URL = `${BASE_PATH}/`;
const OFFLINE_URL = `${BASE_PATH}/offline/`;
const APP_SHELL = [
  ROOT_URL,
  `${BASE_PATH}/masuk/`,
  OFFLINE_URL,
  `${BASE_PATH}/manifest.webmanifest`,
  `${BASE_PATH}/icon.svg`,
];

function isAppPath(url) {
  return url.origin === self.location.origin && (url.pathname === BASE_PATH || url.pathname.startsWith(`${BASE_PATH}/`));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.allSettled(APP_SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("naranusa-shell-") && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (!isAppPath(url)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then(async (response) => {
        if (response.ok && !url.search) {
          const canonical = new URL(url.pathname, self.location.origin);
          await caches.open(CACHE_NAME).then((cache) => cache.put(canonical, response.clone()));
        }
        return response;
      }).catch(async () => {
        const cachedPage = await caches.match(request, { ignoreSearch: true });
        return cachedPage || await caches.match(ROOT_URL) || await caches.match(OFFLINE_URL);
      }),
    );
    return;
  }

  const isStaticNextAsset = url.pathname.startsWith(`${BASE_PATH}/_next/static/`);
  const isPwaAsset = url.pathname === `${BASE_PATH}/manifest.webmanifest` || url.pathname === `${BASE_PATH}/icon.svg`;
  if (!isStaticNextAsset && !isPwaAsset) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then(async (response) => {
        if (response.ok) await caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
        return response;
      });
    }),
  );
});
