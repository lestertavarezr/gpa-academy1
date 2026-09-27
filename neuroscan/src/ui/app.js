import { formatCountdown, nextOccurrence, secondsUntilMidnight, todayKey } from "../core/dates.js";
import { awardAnswer, streakMultiplier, studyStreak } from "../core/gamification.js";
import { SESSION_SIZE, sessionCandidates } from "../core/session.js";
import { dueIds, isDue, isMastered, nextDueAt, reviewCard } from "../core/srs.js";
import { MAX_BACKUP_BYTES, defaultState, exportPayload, parseBackup, sanitizeState } from "../core/state.js";
import { answerEvent, enqueueEvent } from "../services/analytics.js";
import { pushSupport, subscribePush, unsubscribePush } from "../services/push.js";
import { drawScan } from "./scan-canvas.js";
import * as T from "./templates.js";

const PUSH_SUBSCRIBE_TIMEOUT_MS = 8000;

function withTimeout(promise, ms) {
  let timer;
  return Promise.race([promise, new Promise((_, reject) => (timer = setTimeout(() => reject(new Error("timeout")), ms)))]).finally(() => clearTimeout(timer));
}

const SYNC_TEXT = {
  off: "Nube desactivada: el progreso solo vive en este navegador.",
  syncing: "Sincronizando…",
  synced: "Progreso sincronizado en la nube de forma anónima.",
  offline: "Sin conexión: se sincronizará al reconectar.",
  error: "No se pudo sincronizar. Se reintentará más tarde.",
};

export function mountApp({ root, modules, challenges, mediaItem, store, sync = null, api = null, pushEnabled = false }) {
  const $ = (selector) => root.querySelector(selector);
  const main = $("#ns-main");
  const moduleNav = $("#ns-modules");
  const count = challenges.length;
  const byId = new Map(challenges.map((c) => [c.id, c]));
  const totals = modules.map((_, i) => challenges.filter((c) => c.module === i).length);
  const support = pushSupport();
  let state = sanitizeState(store.load() || {}, { challengeCount: count });
  let reminderTimer = null;
  let pushActive = false;
  let resizeFrame = 0;

  const now = () => Date.now();
  const currentChallenge = () => challenges[state.current];
  const masteredByModule = () => modules.map((_, i) => challenges.filter((c) => c.module === i && isMastered(state.srs[c.id])).length);
  const masteredCount = () => challenges.filter((c) => isMastered(state.srs[c.id])).length;
  const dueList = () => dueIds(state.srs, challenges, now());
  const pendingId = () => state.sessionQueue.find((id) => !state.sessionDone.includes(id));
  const candidates = (moduleIndex) =>
    sessionCandidates({ challenges, moduleCount: modules.length, srs: state.srs, done: state.done, now: now(), moduleIndex });
  const nextDueText = () => {
    const at = nextDueAt(state.srs, now());
    return at ? new Date(at).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "sin fecha programada";
  };
  const canPush = () => pushEnabled && support.push && !!api && !!sync?.enabled;

  function persist({ touch = true } = {}) {
    if (touch) state.updatedAt = now();
    const { ok } = store.save(state);
    $("#ns-storage-warning").hidden = ok;
    if (touch) sync?.schedule();
  }

  function resetSession(moduleIndex = null) {
    state.sessionModule = Number.isInteger(moduleIndex) ? moduleIndex : null;
    state.sessionQueue = candidates(state.sessionModule);
    state.sessionDone = [];
    state.sessionAnswers = {};
    state.sessionXP = 0;
    state.sessionDay = todayKey();
    state.selected = null;
    state.current = state.sessionQueue.length ? state.sessionQueue[0] - 1 : 0;
  }

  function normalize() {
    if (state.sessionDay !== todayKey()) resetSession(null);
    if (state.sessionQueue.length && !state.sessionQueue.includes(currentChallenge()?.id)) {
      state.current = (pendingId() ?? state.sessionQueue[0]) - 1;
    }
  }

  function startSession(moduleIndex = null) {
    resetSession(moduleIndex);
    render({ focus: "title" });
    persist();
  }

  function focusKeyInMain() {
    const active = document.activeElement;
    return active && main.contains(active) ? active.closest("[data-focus]")?.dataset.focus ?? null : null;
  }

  // Re-rendering replaces the DOM; put keyboard focus back where the user was.
  function restoreFocus(key) {
    if (!key) return;
    const title = main.querySelector("#ns-challenge-title");
    let target = key === "title" ? title : main.querySelector(`[data-focus="${key}"]`);
    if (!target || target.disabled) target = main.querySelector("#ns-next") || title;
    target?.focus({ preventScroll: key !== "title" });
  }

  function updateBonusUI() {
    const today = todayKey();
    const claimed = state.dailyBonusDay === today && state.dailyBonusClaimed;
    $("#ns-bonus-title").textContent = claimed ? "Bono asegurado" : "Bono diario disponible";
    $("#ns-bonus-copy").textContent = claimed ? "Completaste tu misión de hoy." : "Completa 5 casos antes de medianoche";
    $("#ns-bonus-value").textContent = claimed ? "+50 XP ganados" : "+50 XP";
    $("#ns-xp-total").textContent = String(state.xpTotal);
    $("#ns-xp-multiplier").textContent = `×${streakMultiplier(studyStreak(state.activityDays))} XP por caso`;
    $("#ns-bonus-countdown").textContent = claimed ? "Próximo bono mañana" : `Vence en ${formatCountdown(secondsUntilMidnight())}`;
    const labels = [3, 7, 14, 30].filter((d) => state.streakBonuses.includes(d)).map((d) => `Racha ${d} días`);
    $("#ns-bonus-badges").textContent = labels.length ? `Logros: ${labels.join(" · ")}` : "Logros de racha: 3 · 7 · 14 · 30 días";
  }

  function reminderStatusText() {
    const prefs = state.reminderPrefs;
    if (prefs.enabled && pushActive) return `Aviso diario a las ${prefs.time}, aunque cierres la app.`;
    if (prefs.enabled) return `Activo mientras esta app permanezca abierta. ${support.reason}`.trim();
    return canPush() ? "Recibe un aviso diario aunque cierres la app." : support.reason || "El aviso aparece si la app sigue abierta.";
  }

  function renderCloud() {
    const box = $("#ns-cloud");
    if (!sync) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    $("#ns-sync-status").textContent = SYNC_TEXT[sync.status] || SYNC_TEXT.off;
    $("#ns-sync-toggle").textContent = sync.enabled ? "Desactivar nube" : "Activar nube";
    for (const id of ["#ns-pair-create", "#ns-pair-claim", "#ns-pair-input", "#ns-cloud-delete"]) $(id).disabled = !sync.enabled;
  }

  function renderSidebar() {
    const ch = currentChallenge();
    const done = state.sessionDone.length;
    const max = state.sessionQueue.length || SESSION_SIZE;
    $("#ns-progress").textContent = `${done} / ${max}`;
    $("#ns-fill").style.width = `${max ? (done / max) * 100 : 0}%`;
    $("#ns-track").setAttribute("aria-valuemax", String(max));
    $("#ns-track").setAttribute("aria-valuenow", String(done));
    const due = dueList().length;
    $("#ns-retention-status").textContent = `${due} repasos vencidos · ${masteredCount()}/${count} dominados · racha ${studyStreak(state.activityDays)} días`;
    updateBonusUI();
    const available = candidates(state.sessionModule).length;
    const newSession = $("#ns-new-session");
    newSession.textContent = due ? `Repasar / seguir · ${due} vencidos` : available ? "Nueva sesión de 5" : "Todo al día";
    newSession.disabled = available === 0 && state.sessionModule === null;
    $("#ns-reminder-time").value = state.reminderPrefs.time;
    $("#ns-reminder-toggle").textContent = state.reminderPrefs.enabled ? "Desactivar recordatorio" : "Activar recordatorio";
    $("#ns-reminder-status").textContent = reminderStatusText();
    for (const [id, mode] of [["#ns-practice", "practice"], ["#ns-exam", "exam"]]) {
      $(id).classList.toggle("sel", state.mode === mode);
      $(id).setAttribute("aria-pressed", String(state.mode === mode));
    }
    const scores = Object.values(state.answers);
    $("#ns-score").textContent = String(Math.round(scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length)));
    const mastered = masteredByModule();
    moduleNav.innerHTML = T.moduleNavHTML(modules, { activeModule: ch?.module, mastered, totals });
    const select = $("#ns-mobile-module");
    select.innerHTML = T.moduleOptionsHTML(modules, { mastered, totals });
    if (state.sessionQueue.length && ch) select.value = String(ch.module);
    renderCloud();
  }

  function renderSessionEnd() {
    const ids = state.sessionQueue;
    const empty = ids.length === 0;
    const report = T.reportGroupsHTML({ modules, challengesById: byId, ids, state, masteredByModule: masteredByModule(), totals });
    main.innerHTML = T.sessionEndHTML({
      empty,
      correct: ids.filter((id) => state.sessionAnswers[id] === 100).length,
      total: ids.length,
      sessionXP: state.sessionXP,
      streak: studyStreak(state.activityDays),
      seen: state.done.length,
      mastered: masteredCount(),
      challengeCount: count,
      due: dueList().length,
      nextDueText: nextDueText(),
      report,
    });
    $("#ns-new-session-end").disabled = empty && state.sessionModule === null;
  }

  function prefetchNextImages() {
    const nextId = state.sessionQueue.find((id) => !state.sessionDone.includes(id) && id !== currentChallenge()?.id);
    for (const key of byId.get(nextId)?.media ?? []) {
      const { src } = mediaItem(key);
      if (!src.startsWith("data:")) new Image().src = src;
    }
  }

  function render({ focus } = {}) {
    normalize();
    const focusKey = focus ?? focusKeyInMain();
    renderSidebar();
    if (!state.sessionQueue.length || state.sessionDone.length >= state.sessionQueue.length) {
      renderSessionEnd();
      restoreFocus(focusKey && "title");
      return;
    }
    const ch = currentChallenge();
    const answerDone = state.sessionDone.includes(ch.id);
    const card = state.srs[ch.id];
    main.innerHTML = T.challengeHTML({
      ch,
      total: count,
      queuePosition: state.sessionQueue.indexOf(ch.id) + 1,
      queueLength: state.sessionQueue.length,
      isReview: !answerDone && isDue(card, now()),
      visual: T.challengeVisualHTML(ch, ch.media.map(mediaItem)),
      reflect: state.reflections[ch.id] || {},
      selected: state.selected,
      answerDone,
      correct: state.sessionAnswers[ch.id] === 100,
      mode: state.mode,
      nextReviewText: card?.dueAt ? new Date(card.dueAt).toLocaleDateString() : nextDueText(),
    });
    drawScan(main.querySelector("#ns-scan"), ch);
    restoreFocus(focusKey);
    prefetchNextImages();
  }

  function captureReflection(ch) {
    const entry = {};
    main.querySelectorAll("[data-reflect]").forEach((field) => {
      const value = String(field.value || "").slice(0, field.dataset.reflect === "finding" ? 60 : 55);
      if (value) entry[field.dataset.reflect] = value;
    });
    if (Object.keys(entry).length) state.reflections[ch.id] = entry;
    else delete state.reflections[ch.id];
  }

  function submitAnswer() {
    const ch = currentChallenge();
    if (state.selected === null || state.sessionDone.includes(ch.id)) return;
    captureReflection(ch);
    const t = now();
    const correct = state.selected === ch.answer;
    const previous = state.srs[ch.id];
    const confidence = state.reflections[ch.id]?.confidence;
    if (sync?.enabled) {
      enqueueEvent(answerEvent({ challenge: ch, displayChoice: state.selected, correct, mode: state.mode, confidence, wasDue: isDue(previous, t), now: t }));
    }
    const score = correct ? 100 : 0;
    state.answers[ch.id] = score;
    state.choices[ch.id] = state.selected;
    if (!state.done.includes(ch.id)) state.done.push(ch.id);
    state.sessionDone.push(ch.id);
    state.sessionAnswers[ch.id] = score;
    state.srs[ch.id] = reviewCard(previous, { correct, confidence, now: t });
    awardAnswer(state, { correct, now: new Date(t), sessionSize: SESSION_SIZE });
    state.selected = null;
    render({ focus: "next" });
    persist();
  }

  function openZoom(key) {
    const item = mediaItem(key);
    const dialog = $("#ns-zoom");
    const image = $("#ns-zoom-image");
    image.src = item.src;
    image.alt = item.alt;
    $("#ns-zoom-caption").textContent = item.caption;
    dialog.showModal();
    $("#ns-zoom-close").focus();
  }

  function scheduleLocalReminder() {
    clearTimeout(reminderTimer);
    if (!state.reminderPrefs.enabled || typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const target = nextOccurrence(state.reminderPrefs.time);
    reminderTimer = setTimeout(() => {
      const due = dueList().length;
      try {
        new Notification("NEURO//SCAN · Repaso", { tag: "neuroscan-reminder", body: due ? `Tienes ${due} casos listos para repasar.` : "Te espera una sesión corta de neuroimágenes." });
      } catch {
        // Some browsers only allow notifications from a service worker.
      }
      scheduleLocalReminder();
    }, target.getTime() - Date.now());
  }

  async function enableReminder() {
    const status = $("#ns-reminder-status");
    if (!support.notifications) {
      status.textContent = support.reason;
      return;
    }
    let permission = Notification.permission;
    if (permission === "default") permission = await Notification.requestPermission();
    if (permission !== "granted") {
      status.textContent = "No se concedió permiso. Puedes seguir usando los repasos dentro de la app.";
      return;
    }
    state.reminderPrefs.enabled = true;
    if (canPush()) {
      status.textContent = "Activando avisos…";
      try {
        if (!sync.hasAccount) await sync.sync();
        // Browsers can stall for minutes when their push service is unreachable.
        await withTimeout(subscribePush({ api, time: state.reminderPrefs.time }), PUSH_SUBSCRIBE_TIMEOUT_MS);
        pushActive = true;
      } catch {
        pushActive = false;
      }
    }
    if (!pushActive) scheduleLocalReminder();
    persist();
    render();
  }

  async function disableReminder() {
    state.reminderPrefs.enabled = false;
    clearTimeout(reminderTimer);
    if (pushActive) {
      await unsubscribePush({ api }).catch(() => {});
      pushActive = false;
    }
    persist();
    render();
    $("#ns-reminder-status").textContent = "Recordatorio desactivado.";
  }

  async function restoreReminder() {
    if (!state.reminderPrefs.enabled) return;
    if (canPush() && Notification.permission === "granted") {
      const registration = await navigator.serviceWorker.ready.catch(() => null);
      pushActive = !!(await registration?.pushManager.getSubscription().catch(() => null));
    }
    if (!pushActive) scheduleLocalReminder();
    renderSidebar();
  }

  function importBackup(file) {
    if (file.size > MAX_BACKUP_BYTES) {
      alert("El respaldo supera el límite de 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = parseBackup(String(reader.result || ""), { challengeCount: count });
        state = { ...imported, reminderPrefs: state.reminderPrefs };
        render();
        persist();
      } catch {
        alert("No pude leer ese respaldo de NEURO//SCAN.");
      }
    };
    reader.readAsText(file);
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(exportPayload(state), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "neuroscan-progreso.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function resetProgress() {
    if (!window.confirm("¿Reiniciar el progreso, los repasos programados y las respuestas? Si la nube está activa, también se reinicia en tus otros dispositivos.")) return;
    if (pushActive) await unsubscribePush({ api }).catch(() => {});
    pushActive = false;
    clearTimeout(reminderTimer);
    state = { ...defaultState(), epoch: now() };
    resetSession(null);
    render({ focus: "title" });
    persist();
  }

  async function withMessage(element, task) {
    try {
      await task();
    } catch (error) {
      element.textContent = error?.status === 404 || error?.status === 410 ? "Código inválido o vencido." : "No se pudo completar. Revisa tu conexión.";
    }
  }

  // Delegated events: listeners survive re-renders of #ns-main and the module nav.
  main.addEventListener("click", (event) => {
    const target = event.target.closest("button");
    if (!target || target.disabled) return;
    if (target.dataset.choice !== undefined) {
      const ch = currentChallenge();
      if (state.sessionDone.includes(ch.id)) return;
      captureReflection(ch);
      state.selected = Number(target.dataset.choice);
      render();
      persist();
    } else if (target.id === "ns-submit") {
      submitAnswer();
    } else if (target.id === "ns-next") {
      const upcoming = pendingId();
      if (upcoming) state.current = upcoming - 1;
      state.selected = null;
      render({ focus: "title" });
      persist();
    } else if (target.dataset.zoom) {
      openZoom(target.dataset.zoom);
    } else if (target.id === "ns-new-session-end") {
      startSession(state.sessionModule);
    }
  });
  main.addEventListener("change", (event) => {
    if (!event.target.matches("[data-reflect]")) return;
    captureReflection(currentChallenge());
    persist();
  });
  moduleNav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mod]");
    if (button) startSession(Number(button.dataset.mod));
  });
  $("#ns-mobile-module").addEventListener("change", (event) => startSession(Number(event.target.value)));
  $("#ns-new-session").addEventListener("click", () => startSession(state.sessionModule));
  for (const [id, mode] of [["#ns-practice", "practice"], ["#ns-exam", "exam"]]) {
    $(id).addEventListener("click", () => {
      state.mode = mode;
      render();
      persist();
    });
  }
  const zoom = $("#ns-zoom");
  $("#ns-zoom-close").addEventListener("click", () => zoom.close());
  zoom.addEventListener("click", (event) => {
    if (event.target === zoom) zoom.close();
  });
  zoom.addEventListener("close", () => $("#ns-zoom-image").removeAttribute("src"));
  $("#ns-reminder-toggle").addEventListener("click", () => (state.reminderPrefs.enabled ? disableReminder() : enableReminder()));
  $("#ns-reminder-time").addEventListener("change", async (event) => {
    state.reminderPrefs.time = event.target.value || "19:00";
    persist();
    if (pushActive) await withTimeout(subscribePush({ api, time: state.reminderPrefs.time }), PUSH_SUBSCRIBE_TIMEOUT_MS).catch(() => {});
    else scheduleLocalReminder();
    renderSidebar();
  });
  $("#ns-export").addEventListener("click", exportBackup);
  $("#ns-import").addEventListener("click", () => $("#ns-import-file").click());
  $("#ns-import-file").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (file) importBackup(file);
    event.target.value = "";
  });
  $("#ns-reset").addEventListener("click", resetProgress);

  if (sync) {
    const message = $("#ns-pair-message");
    $("#ns-sync-toggle").addEventListener("click", async () => {
      await sync.setEnabled(!sync.enabled);
      renderCloud();
    });
    $("#ns-pair-create").addEventListener("click", () =>
      withMessage(message, async () => {
        const { code, expiresAt } = await sync.createPairingCode();
        const minutes = Math.round((expiresAt - Date.now()) / 60000);
        message.textContent = `Código para tu otro dispositivo: ${code} · válido ${minutes} min, un solo uso.`;
      }),
    );
    $("#ns-pair-claim").addEventListener("click", () =>
      withMessage(message, async () => {
        const code = $("#ns-pair-input").value.toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (code.length !== 8) {
          message.textContent = "El código tiene 8 caracteres.";
          return;
        }
        await sync.claimPairingCode(code);
        $("#ns-pair-input").value = "";
        message.textContent = "Dispositivo vinculado. Tu progreso se combinó con el de la cuenta.";
      }),
    );
    $("#ns-cloud-delete").addEventListener("click", () => {
      if (!window.confirm("¿Borrar tu progreso y avisos del servidor? El progreso de este navegador se conserva.")) return;
      withMessage(message, async () => {
        if (pushActive) await unsubscribePush({ api }).catch(() => {});
        pushActive = false;
        await sync.deleteRemoteData();
        message.textContent = "Datos borrados del servidor. La nube quedó desactivada.";
        render();
      });
    });
  }

  store.onHostUpdate((hostState) => {
    state = sanitizeState(hostState, { challengeCount: count });
    render();
  });
  globalThis.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => drawScan(main.querySelector("#ns-scan"), currentChallenge()));
  });
  setInterval(() => {
    if (document.visibilityState === "visible") updateBonusUI();
  }, 1000);

  render();
  restoreReminder();

  return {
    getState: () => state,
    applyRemoteState(next) {
      state = next;
      normalize();
      persist({ touch: false });
      render();
    },
    renderCloud,
  };
}
