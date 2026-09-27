import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { SCORM12_LIMIT, decodeCompact, encodeCompact } from "../src/core/compact.js";
import { sanitizeState } from "../src/core/state.js";
import { createScormStore, findScormApi, scormProgress, sessionTime } from "../src/services/scorm.js";
import { crc32, createZip } from "../scripts/zip.mjs";
import { scormManifest } from "../scripts/scorm-manifest.mjs";
import { createFakeScorm12 } from "./fake-scorm12.js";

const COUNT = 98;
const clean = (raw) => sanitizeState(raw, { challengeCount: COUNT });
const NOW = Date.UTC(2026, 8, 27, 15);

// Worst realistic case: every case answered many times, long reflections everywhere,
// 40 days of activity and a session in progress.
function heavyState() {
  const ids = Array.from({ length: COUNT }, (_, i) => i + 1);
  const long = (n) => "x".repeat(n);
  return clean({
    version: 2,
    updatedAt: NOW,
    done: ids,
    answers: Object.fromEntries(ids.map((id) => [id, id % 3 ? 100 : 0])),
    choices: Object.fromEntries(ids.map((id) => [id, id % 4])),
    srs: Object.fromEntries(ids.map((id) => [id, { streak: 12, interval: 30, dueAt: NOW + id * 86_400_000 * 30, reviews: 999 }])),
    reflections: Object.fromEntries(ids.map((id) => [id, { reading: long(55), finding: long(60), confidence: "Alta" }])),
    activityDays: Array.from({ length: 90 }, (_, i) => new Date(NOW - i * 86_400_000).toISOString().slice(0, 10)).reverse(),
    sessionQueue: [10, 20, 30, 40, 50],
    sessionDone: [10, 20],
    sessionAnswers: { 10: 100, 20: 0 },
    sessionDay: "2026-09-27",
    sessionModule: 3,
    current: 29,
    selected: 2,
    mode: "exam",
    xpTotal: 123456,
    sessionXP: 55,
    dailyBonusDay: "2026-09-26",
    dailyBonusClaimed: true,
    streakBonuses: [3, 7, 14, 30],
  });
}

describe("compact progress encoding", () => {
  it("fits the full 98-case history in SCORM 1.2's 4096 characters", () => {
    const state = heavyState();
    const text = encodeCompact(state);
    expect(text.length).toBeLessThanOrEqual(SCORM12_LIMIT);
    const back = clean(decodeCompact(text));
    for (const key of ["done", "answers", "choices", "sessionQueue", "sessionDone", "sessionAnswers", "sessionDay", "sessionModule", "current", "selected", "mode", "xpTotal", "sessionXP", "dailyBonusDay", "dailyBonusClaimed", "streakBonuses"]) {
      expect(back[key]).toEqual(state[key]);
    }
    expect(back.srs[98]).toEqual(state.srs[98]);
    expect(back.activityDays).toEqual(state.activityDays.slice(-40));
  });

  it("keeps the current session's reflections first when not all fit", () => {
    const back = clean(decodeCompact(encodeCompact(heavyState())));
    expect(back.reflections[10]).toEqual({ reading: "x".repeat(55), finding: "x".repeat(60), confidence: "Alta" });
    expect(back.reflections[20]).toBeDefined();
    expect(Object.keys(back.reflections).length).toBeLessThan(COUNT);
  });

  it("round-trips a typical learner exactly", () => {
    const state = clean({
      updatedAt: NOW,
      done: [1, 5],
      answers: { 1: 100, 5: 0 },
      choices: { 1: 2, 5: 0 },
      srs: { 1: { streak: 1, interval: 1, dueAt: NOW + 60_000 * 1440, reviews: 1 }, 5: { streak: 0, interval: 1, dueAt: NOW + 60_000 * 1440, reviews: 1 } },
      reflections: { 1: { reading: "TC, axial", finding: "Hiperdensidad", confidence: "Media" } },
      activityDays: ["2026-09-27"],
      sessionQueue: [1, 5, 9, 13, 17],
      sessionDone: [1, 5],
      sessionAnswers: { 1: 100, 5: 0 },
      sessionDay: "2026-09-27",
      current: 8,
      xpTotal: 25,
      sessionXP: 25,
    });
    expect(clean(decodeCompact(encodeCompact(state)))).toEqual(state);
  });

  it("keeps cards migrated from v1 due immediately", () => {
    const state = clean({ done: [3] });
    expect(state.srs[3].dueAt).toBe(1);
    const back = clean(decodeCompact(encodeCompact(state)));
    expect(back.srs[3].dueAt).toBeGreaterThan(0);
    expect(back.srs[3].dueAt).toBeLessThan(NOW);
  });

  it("rejects unknown payloads", () => {
    expect(() => decodeCompact('{"v":9}')).toThrow();
    expect(() => decodeCompact("no json")).toThrow();
  });
});

describe("SCORM 1.2 store", () => {
  const mount = (options = {}) => {
    const api = createFakeScorm12(options);
    const store = createScormStore({ api, challengeCount: COUNT, clock: () => NOW, commitDelay: 0, target: {} });
    return { api, store };
  };

  it("starts empty for a new learner", () => {
    const { store, api } = mount();
    expect(store.load()).toBeNull();
    expect(api.calls[0]).toEqual(["LMSInitialize", ""]);
  });

  it("saves progress, grade and completion, then resumes it on the next launch", async () => {
    const { store, api } = mount();
    const state = heavyState();
    expect(store.save(state)).toEqual({ ok: true });
    expect(api.data["cmi.core.score.raw"]).toBe(String(scormProgress(state, COUNT).score));
    expect(api.data["cmi.core.lesson_status"]).toBe("incomplete");
    expect(api.data["cmi.core.exit"]).toBe("suspend");
    await new Promise((r) => setTimeout(r, 5));
    expect(api.commits).toBe(1);
    store.finish();
    expect(api.data["cmi.core.session_time"]).toBe("00:00:00");
    expect(api.calls.at(-1)).toEqual(["LMSFinish", ""]);

    const next = createScormStore({ api: createFakeScorm12({ record: { "cmi.suspend_data": api.data["cmi.suspend_data"] } }), challengeCount: COUNT, target: {} });
    expect(clean(next.load()).done).toEqual(state.done);
  });

  it("grades by correct cases and never reports completed, so Moodle keeps the attempt editable", () => {
    expect(scormProgress(clean({ done: [1, 2, 3], answers: { 1: 100, 2: 100, 3: 0 } }), COUNT)).toEqual({ score: 2, status: "incomplete" });
    expect(scormProgress(heavyState(), COUNT).status).toBe("incomplete");
  });

  it("explains review mode instead of silently losing work", () => {
    const { store, api } = mount({ mode: "review" });
    const result = store.save(heavyState());
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/modo revisión/);
    expect(api.calls.some(([fn]) => fn === "LMSSetValue")).toBe(false);
  });

  it("surfaces an LMS refusal", () => {
    const { store, api } = mount();
    api.LMSSetValue = vi.fn(() => "false");
    api.LMSGetLastError = () => "405";
    expect(store.save(heavyState())).toMatchObject({ ok: false, message: expect.stringMatching(/error 405/) });
  });

  it("stops writing after the LMS session is finished", () => {
    const { store } = mount();
    store.finish();
    expect(store.save(heavyState()).ok).toBe(false);
  });

  it("returns null when the LMS refuses to initialize", () => {
    const api = createFakeScorm12();
    api.LMSInitialize = () => "false";
    api.LMSGetLastError = () => "101x";
    expect(createScormStore({ api, challengeCount: COUNT, target: {} })).toBeNull();
  });

  it("formats session time as SCORM 1.2 CMITimespan", () => {
    expect(sessionTime(3_725_000)).toBe("01:02:05");
    expect(sessionTime(-5)).toBe("00:00:00");
  });
});

describe("findScormApi", () => {
  const api = createFakeScorm12();
  it("finds the API on an ancestor frame", () => {
    const top = { API: api };
    top.parent = top;
    const middle = { parent: top };
    expect(findScormApi({ parent: middle })).toBe(api);
  });

  it("finds the API through the opener when launched in a new window", () => {
    const opener = { API: api };
    opener.parent = opener;
    const win = { opener };
    win.parent = win;
    expect(findScormApi(win)).toBe(api);
  });

  it("skips cross-origin frames and returns null outside an LMS", () => {
    const top = {};
    Object.defineProperty(top, "API", { get: () => { throw new Error("SecurityError"); } });
    top.parent = top;
    expect(findScormApi({ parent: top })).toBeNull();
  });
});

describe("SCORM package", () => {
  it("computes standard CRC-32", () => {
    expect(crc32(Buffer.from("123456789"))).toBe(0xcbf43926);
  });

  it("writes a zip that unzip extracts byte for byte", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "zip-"));
    const file = path.join(dir, "t.zip");
    const html = "<p>ñandú · NEURO//SCAN</p>".repeat(1000);
    fs.writeFileSync(file, createZip([{ name: "imsmanifest.xml", data: "<manifest/>" }, { name: "index.html", data: html }]));
    expect(execFileSync("unzip", ["-p", file, "index.html"]).toString()).toBe(html);
    expect(execFileSync("unzip", ["-Z1", file]).toString().trim().split("\n")).toEqual(["imsmanifest.xml", "index.html"]);
  });

  it("declares one SCORM 1.2 SCO launched from index.html, with escaped titles", () => {
    const manifest = scormManifest({ identifier: "id", version: "2.0.0", title: "A & B <C>" });
    expect(manifest).toContain("<schemaversion>1.2</schemaversion>");
    expect(manifest).toContain('adlcp:scormtype="sco" href="index.html"');
    expect(manifest).toContain("<title>A &amp; B &lt;C&gt;</title>");
  });
});
