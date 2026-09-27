// Key kept from v1 so upgrading users keep their progress.
export const PROGRESS_KEY = "neuroscan-progress-v1";
export const DEVICE_KEY = "neuroscan-device";
export const EVENTS_KEY = "neuroscan-events";

function localStore() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function readJSON(key, fallback = null) {
  try {
    const raw = localStore()?.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    const store = localStore();
    if (!store) return false;
    store.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// When embedded as a ChatGPT Apps SDK widget the host keeps state per conversation;
// it wins over localStorage because it follows the user across devices.
export function createProgressStore({ host = () => globalThis.openai } = {}) {
  return {
    load() {
      try {
        const hostState = host()?.widgetState?.privateContent;
        if (hostState) return hostState;
      } catch {
        // Host bridge unavailable; fall back to local storage.
      }
      return readJSON(PROGRESS_KEY);
    },
    save(state) {
      const ok = writeJSON(PROGRESS_KEY, state);
      let hostOk = false;
      try {
        const bridge = host();
        if (bridge?.setWidgetState) {
          bridge.setWidgetState({ privateContent: state })?.catch?.(() => {});
          hostOk = true;
        }
      } catch {
        // Ignore host bridge failures; local persistence result is what we report.
      }
      return { ok: ok || hostOk };
    },
    onHostUpdate(callback) {
      globalThis.addEventListener?.("openai:set_globals", (event) => {
        const state = event.detail?.globals?.widgetState?.privateContent;
        if (state) callback(state);
      });
    },
  };
}
