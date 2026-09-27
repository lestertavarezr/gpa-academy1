import { mergeStates, sanitizeState } from "../core/state.js";
import { clearEvents, flushEvents } from "./analytics.js";
import { DEVICE_KEY, readJSON, writeJSON } from "./storage.js";

const PUSH_DEBOUNCE_MS = 1500;
const PULL_THROTTLE_MS = 60_000;

// Status values: "off" | "syncing" | "synced" | "offline" | "error".
export function createSync({ api, challengeCount, getState, applyState, onStatus = () => {} }) {
  let device = readJSON(DEVICE_KEY, null) || { enabled: true };
  let chain = Promise.resolve();
  let timer = null;
  let lastPull = 0;
  let status = "off";

  const save = () => writeJSON(DEVICE_KEY, device);
  const setStatus = (next) => {
    status = next;
    onStatus(next);
  };
  const clean = (raw) => sanitizeState(raw, { challengeCount });
  const serial = (task) => {
    const run = chain.then(task);
    chain = run.catch(() => {});
    return run;
  };

  async function withErrors(task) {
    if (!device.enabled) return setStatus("off");
    setStatus("syncing");
    try {
      await task();
      setStatus("synced");
    } catch (error) {
      if (error?.status === 401) {
        // Account was deleted elsewhere or the token was revoked: start a fresh anonymous account.
        device = { enabled: true };
        save();
      }
      setStatus(error?.status ? "error" : "offline");
      throw error;
    }
  }

  async function ensureAccount() {
    if (device.token) return;
    const account = await api.createAccount();
    device = { ...device, userId: account.userId, token: account.token, rev: 0, syncedAt: -1 };
    save();
  }

  async function push() {
    for (let attempt = 0; attempt < 3; attempt++) {
      const state = getState();
      if (device.syncedAt === state.updatedAt && device.rev > 0) return;
      try {
        const result = await api.putProgress(device.rev ?? 0, state);
        device.rev = result.rev;
        device.syncedAt = state.updatedAt;
        save();
        return;
      } catch (error) {
        if (error?.status !== 409 || !error.body) throw error;
        applyState(mergeStates(getState(), clean(error.body.state)));
        device.rev = error.body.rev;
        save();
      }
    }
    throw new Error("No se pudo resolver el conflicto de sincronización");
  }

  async function pull() {
    const remote = await api.getProgress();
    if (remote?.state) applyState(mergeStates(getState(), clean(remote.state)));
    device.rev = remote?.rev ?? 0;
    save();
    lastPull = Date.now();
  }

  const fullSync = () =>
    serial(() =>
      withErrors(async () => {
        await ensureAccount();
        await pull();
        await push();
        await flushEvents(api);
      }),
    );

  function schedule() {
    if (!device.enabled) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      serial(() =>
        withErrors(async () => {
          await ensureAccount();
          await push();
          await flushEvents(api);
        }),
      ).catch(() => {});
    }, PUSH_DEBOUNCE_MS);
  }

  return {
    get status() {
      return status;
    },
    get enabled() {
      return device.enabled;
    },
    get hasAccount() {
      return !!device.token;
    },
    token: () => device.token || null,
    start() {
      globalThis.addEventListener?.("online", () => fullSync().catch(() => {}));
      globalThis.document?.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && Date.now() - lastPull > PULL_THROTTLE_MS) fullSync().catch(() => {});
      });
      return fullSync().catch(() => {});
    },
    schedule,
    sync: fullSync,
    async setEnabled(enabled) {
      device.enabled = enabled;
      save();
      if (enabled) return fullSync().catch(() => {});
      clearTimeout(timer);
      clearEvents();
      setStatus("off");
    },
    createPairingCode: () => serial(async () => {
      await ensureAccount();
      await push();
      return api.createPairingCode();
    }),
    async claimPairingCode(code) {
      const result = await serial(() => api.claimPairingCode(code));
      device = { enabled: true, userId: result.userId, token: result.token, rev: 0, syncedAt: -1 };
      save();
      return fullSync();
    },
    async deleteRemoteData() {
      await serial(() => api.deleteAccount());
      device = { enabled: false };
      save();
      clearEvents();
      setStatus("off");
    },
  };
}
