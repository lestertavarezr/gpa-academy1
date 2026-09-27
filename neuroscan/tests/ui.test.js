// @vitest-environment jsdom
import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import authored from "../content/challenges.json";
import media from "../content/media.json";
import modules from "../content/modules.json";
import { buildChallenges } from "../src/core/content.js";
import { mountApp } from "../src/ui/app.js";

const challenges = buildChallenges(authored);
const html = fs.readFileSync(path.resolve(__dirname, "../src/index.html"), "utf8");
const body = /<body>([\s\S]*)<\/body>/.exec(html)[1].replace("<!--SCRIPTS-->", "");

function memoryStore(initial = null, ok = true) {
  const store = {
    saved: initial,
    saves: 0,
    load: () => store.saved,
    save: (state) => {
      store.saves += 1;
      if (ok) store.saved = JSON.parse(JSON.stringify(state));
      return { ok };
    },
    onHostUpdate: () => {},
  };
  return store;
}

function mount(store = memoryStore(), options = {}) {
  document.body.innerHTML = body;
  const root = document.getElementById("neuroscan-root");
  mountApp({ root, modules, challenges, mediaItem: (key) => ({ key, src: `media/${key}.webp`, ...media[key] }), store, sessionSize: 5, ...options });
  const $ = (s) => root.querySelector(s);
  const current = () => challenges.find((c) => c.title === $("#ns-main h2").textContent);
  const choose = (i) => {
    const button = $(`[data-choice="${i}"]`);
    button.focus();
    button.click();
  };
  return { root, store, $, current, choose };
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  HTMLCanvasElement.prototype.getContext = () => null;
  HTMLDialogElement.prototype.showModal ??= function showModal() {
    this.open = true;
  };
  HTMLDialogElement.prototype.close ??= function close() {
    this.open = false;
  };
});

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("challenge flow", () => {
  it("renders a five-case session with four options", () => {
    const { $, root } = mount();
    expect($("#ns-progress").textContent).toBe("0 / 5");
    expect(root.querySelectorAll("[data-choice]")).toHaveLength(4);
    expect($("#ns-submit").disabled).toBe(true);
    expect($(".session-banner strong").textContent).toBe("Sesión mezclada · caso 1 de 5");
  });

  it("keeps keyboard focus on the chosen option across re-renders", () => {
    const { $, choose } = mount();
    choose(2);
    expect($('[data-choice="2"]').getAttribute("aria-pressed")).toBe("true");
    expect(document.activeElement).toBe($('[data-choice="2"]'));
    expect($("#ns-submit").disabled).toBe(false);
  });

  it("grades, explains and schedules the next review in practice mode", () => {
    const { $, store, current, choose } = mount();
    const ch = current();
    choose(ch.answer);
    $("#ns-submit").click();
    expect($(".feedback strong").textContent).toBe("Respuesta correcta");
    expect($(".feedback").textContent).toContain(ch.explanation);
    expect(document.activeElement).toBe($("#ns-next"));
    expect(store.saved.done).toEqual([ch.id]);
    expect(store.saved.srs[ch.id]).toMatchObject({ streak: 1, interval: 1, reviews: 1 });
    expect(store.saved.xpTotal).toBe(15);
    expect(store.saved.updatedAt).toBeGreaterThan(0);
  });

  it("never shows what a case is testing before the learner answers", () => {
    const { $, current, choose } = mount();
    const ch = current();
    expect($("#ns-main").textContent).not.toContain(ch.competency);
    choose(ch.answer);
    $("#ns-submit").click();
    expect($(".feedback").textContent).toContain(ch.competency);
  });

  it("hides the explanation until the end in exam mode", () => {
    const { $, current, choose } = mount();
    $("#ns-exam").click();
    choose((current().answer + 1) % 4);
    $("#ns-submit").click();
    expect($(".feedback")).toBeNull();
    expect($(".hint").textContent).toMatch(/explicación disponible al finalizar/);
  });

  it("completes the session with a report and the daily bonus", () => {
    const { $, store, current, choose } = mount();
    for (let i = 0; i < 5; i++) {
      choose(current().answer);
      $("#ns-submit").click();
      if (i < 4) $("#ns-next").click();
    }
    expect($("#ns-main h2").textContent).toBe("Cinco minutos que cuentan");
    expect($("#ns-main").textContent).toContain("5 de 5 correctas");
    expect(store.saved.dailyBonusClaimed).toBe(true);
    expect(store.saved.xpTotal).toBe(5 * 15 + 50);
    expect($("#ns-bonus-title").textContent).toBe("Bono asegurado");
  });
});

describe("reset", () => {
  it("asks inside the page and only resets after confirming", async () => {
    const { $, store, current, choose } = mount();
    const confirmSpy = vi.spyOn(window, "confirm");
    choose(current().answer);
    $("#ns-submit").click();
    $("#ns-reset").click();
    expect($("#ns-confirm").open).toBe(true);
    expect(document.activeElement).toBe($("#ns-confirm-cancel"));
    $("#ns-confirm-cancel").click();
    await flush();
    expect(store.saved.done).toHaveLength(1);
    $("#ns-reset").click();
    $("#ns-confirm-ok").click();
    await flush();
    expect($("#ns-confirm").open).toBe(false);
    expect(store.saved.done).toEqual([]);
    expect(store.saved.xpTotal).toBe(0);
    expect(store.saved.epoch).toBeGreaterThan(0);
    expect(confirmSpy).not.toHaveBeenCalled();
  });
});

describe("backup export inside a host that blocks downloads", () => {
  it("saves through the host's downloads capability", async () => {
    const save = vi.fn().mockResolvedValue({ status: "saved" });
    const { $, current, choose } = mount(memoryStore(), { downloads: Promise.resolve({ save }) });
    expect($("#ns-export").hidden).toBe(true);
    await flush();
    expect($("#ns-export").hidden).toBe(false);
    const ch = current();
    choose(ch.answer);
    $("#ns-submit").click();
    $("#ns-export").click();
    await flush();
    const [{ filename, data }] = save.mock.calls[0];
    expect(filename).toBe("neuroscan-progreso.json");
    expect(JSON.parse(data)).toMatchObject({ app: "NEURO//SCAN", version: 2, state: { done: [ch.id] } });
    expect($("#ns-backup-message").textContent).toBe("Respaldo guardado.");
  });

  it("reports a declined save without retrying", async () => {
    const save = vi.fn().mockRejectedValue({ code: "declined", message: "no" });
    const { $ } = mount(memoryStore(), { downloads: Promise.resolve({ save }) });
    await flush();
    $("#ns-export").click();
    await flush();
    expect(save).toHaveBeenCalledTimes(1);
    expect($("#ns-backup-message").textContent).toBe("Guardado cancelado.");
  });

  it("keeps the export button hidden when the capability is unavailable", async () => {
    const { $ } = mount(memoryStore(), { downloads: Promise.resolve(null) });
    await flush();
    expect($("#ns-export").hidden).toBe(true);
  });
});

describe("safety", () => {
  it("never interprets learner text as HTML", () => {
    const { $, root, choose } = mount();
    const payload = '"><img src=x onerror="window.__pwned=1">';
    const input = $('[data-reflect="finding"]');
    input.value = payload;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    choose(0);
    expect(root.querySelector("#ns-main img[onerror]")).toBeNull();
    expect($('[data-reflect="finding"]').value).toBe(payload.slice(0, 60));
    expect(window.__pwned).toBeUndefined();
  });

  it("warns when progress cannot be saved", () => {
    const { $, choose } = mount(memoryStore(null, false));
    expect($("#ns-storage-warning").hidden).toBe(true);
    choose(1);
    expect($("#ns-storage-warning").hidden).toBe(false);
  });

  it("restores a saved v1 session", () => {
    const today = new Date();
    const day = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-");
    const saved = { done: [1], answers: { 1: 100 }, sessionQueue: [1, 2, 3, 4, 5], sessionDone: [1], sessionAnswers: { 1: 100 }, sessionDay: day, current: 1, xpTotal: 15 };
    const { $ } = mount(memoryStore(saved));
    expect($("#ns-progress").textContent).toBe("1 / 5");
    expect($("#ns-main h2").textContent).toBe(challenges[1].title);
    expect($("#ns-xp-total").textContent).toBe("15");
  });

  it("hides backup import where the LMS grades progress", () => {
    const { $ } = mount(memoryStore(), { allowImport: false });
    expect($("#ns-import").hidden).toBe(true);
    expect($("#ns-export").hidden).toBe(false);
  });

  it("hides cloud controls when there is no backend", () => {
    const { $ } = mount();
    expect($("#ns-cloud").hidden).toBe(true);
  });
});
