import { describe, expect, it } from "vitest";
import { defaultState, exportPayload, mergeStates, migrateState, parseBackup, sanitizeState, STATE_VERSION } from "../src/core/state.js";

const opts = { challengeCount: 98 };
const clean = (raw) => sanitizeState(raw, opts);

// Shape written by the original single-file app (no `version`, no `srs` in early saves).
const V1_SAVE = {
  done: [1, 2, 3],
  answers: { 1: 100, 2: 0, 3: 100 },
  choices: { 1: 2, 2: 0, 3: 1 },
  current: 3,
  selected: null,
  mode: "exam",
  reflections: { 1: { reading: "TC, axial", finding: "Hiperdensidad", confidence: "Alta" } },
  sessionQueue: [1, 2, 3, 4, 5],
  sessionDone: [1, 2, 3],
  sessionAnswers: { 1: 100, 2: 0, 3: 100 },
  sessionDay: "2026-01-10",
  activityDays: ["2026-01-09", "2026-01-10"],
  reminderPrefs: { enabled: true, time: "07:30" },
  xpTotal: 140,
  sessionXP: 40,
  dailyBonusDay: "2026-01-09",
  dailyBonusClaimed: true,
  streakBonuses: [3],
};

describe("sanitizeState", () => {
  it("migrates a v1 save without losing progress", () => {
    const state = clean(V1_SAVE);
    expect(state.version).toBe(STATE_VERSION);
    expect(state.done).toEqual([1, 2, 3]);
    expect(state.mode).toBe("exam");
    expect(state.reflections[1]).toEqual({ reading: "TC, axial", finding: "Hiperdensidad", confidence: "Alta" });
    expect(state.reminderPrefs).toEqual({ enabled: true, time: "07:30" });
    expect(state.xpTotal).toBe(140);
    // Seen cards without SRS history are scheduled for review right away.
    expect(state.srs[2]).toEqual({ streak: 0, interval: 0, dueAt: 1, reviews: 0 });
  });

  it("drops invalid ids, prototype keys and malformed values", () => {
    const hostile = JSON.parse(
      '{"done":[1,0,99,"2",1.5,1],"answers":{"__proto__":{"polluted":true},"1":100,"2":55,"abc":100},"choices":{"1":7,"2":3},' +
        '"reflections":{"1":{"reading":"' + "x".repeat(200) + '","confidence":"Absoluta"}},"srs":{"1":{"streak":"3","interval":-4,"dueAt":"NaN","reviews":2}},' +
        '"current":500,"selected":9,"mode":"god","sessionDay":"ayer","activityDays":["2026-01-01",5,"<script>"],"reminderPrefs":{"enabled":"yes","time":"25:99"},' +
        '"xpTotal":"1e9x","streakBonuses":[3,4,7]}',
    );
    const state = clean(hostile);
    expect(state.done).toEqual([1]);
    expect(state.answers).toEqual({ 1: 100 });
    expect(Object.getPrototypeOf(state.answers)).toBe(Object.prototype);
    expect({}.polluted).toBeUndefined();
    expect(state.choices).toEqual({ 2: 3 });
    expect(state.reflections[1]).toEqual({ reading: "x".repeat(55) });
    expect(state.srs[1]).toEqual({ streak: 3, interval: 0, dueAt: 0, reviews: 2 });
    expect(state.current).toBe(97);
    expect(state.selected).toBeNull();
    expect(state.mode).toBe("practice");
    expect(state.sessionDay).toBe("");
    expect(state.activityDays).toEqual(["2026-01-01"]);
    expect(state.reminderPrefs).toEqual({ enabled: false, time: "19:00" });
    expect(state.xpTotal).toBe(0);
    expect(state.streakBonuses).toEqual([3, 7]);
  });

  it("tolerates garbage input", () => {
    for (const input of [null, undefined, 42, "text", []]) expect(clean(input)).toEqual(defaultState());
  });

  it("refuses states from a newer app version", () => {
    expect(() => migrateState({ version: STATE_VERSION + 1 })).toThrow(/no soportada/);
  });
});

describe("mergeStates", () => {
  const phone = clean({
    ...V1_SAVE,
    version: 2,
    updatedAt: 1000,
    srs: { 1: { streak: 2, interval: 3, dueAt: 5000, reviews: 2 }, 2: { streak: 0, interval: 1, dueAt: 3000, reviews: 1 } },
    answers: { 1: 100, 2: 0 },
    done: [1, 2],
    xpTotal: 100,
  });
  const laptop = clean({
    version: 2,
    updatedAt: 2000,
    done: [2, 7],
    answers: { 2: 100, 7: 100 },
    choices: { 2: 1, 7: 3 },
    srs: { 2: { streak: 1, interval: 1, dueAt: 9000, reviews: 2 }, 7: { streak: 1, interval: 1, dueAt: 9000, reviews: 1 } },
    activityDays: ["2026-01-11"],
    sessionQueue: [7, 8, 9, 10, 11],
    sessionDone: [7],
    sessionDay: "2026-01-11",
    xpTotal: 80,
    reminderPrefs: { enabled: false, time: "21:00" },
  });
  const merged = mergeStates(phone, laptop);

  it("unions seen cases and activity", () => {
    expect(merged.done).toEqual([1, 2, 7]);
    expect(merged.activityDays).toEqual(["2026-01-09", "2026-01-10", "2026-01-11"]);
  });

  it("keeps, per card, the history with more reviews", () => {
    expect(merged.srs[1].reviews).toBe(2);
    expect(merged.srs[2]).toEqual({ streak: 1, interval: 1, dueAt: 9000, reviews: 2 });
    expect(merged.answers[2]).toBe(100);
    expect(merged.srs[7]).toBeDefined();
  });

  it("continues the session of the most recently active device", () => {
    expect(merged.sessionQueue).toEqual([7, 8, 9, 10, 11]);
    expect(merged.updatedAt).toBe(2000);
  });

  it("keeps reminder preferences local and XP at the max", () => {
    expect(merged.reminderPrefs).toEqual({ enabled: true, time: "07:30" });
    expect(merged.xpTotal).toBe(100);
  });

  it("is idempotent", () => {
    expect(mergeStates(merged, laptop)).toEqual(merged);
  });

  it("lets a deliberate reset win over older history", () => {
    const reset = { ...defaultState(), epoch: 5000, updatedAt: 5000 };
    expect(mergeStates(reset, laptop).done).toEqual([]);
    expect(mergeStates(laptop, reset).done).toEqual([]);
  });
});

describe("backups", () => {
  it("round-trips an export", () => {
    const state = clean({ ...V1_SAVE, version: 2 });
    expect(parseBackup(JSON.stringify(exportPayload(state)), opts)).toEqual(state);
  });

  it("imports v1 backups made by the original app", () => {
    const v1 = { app: "NEURO//SCAN", version: 1, exportedAt: "2026-01-10T00:00:00Z", state: V1_SAVE };
    expect(parseBackup(JSON.stringify(v1), opts).done).toEqual([1, 2, 3]);
  });

  it.each([
    ["another app", { app: "OTRA", version: 2, state: {} }],
    ["unknown version", { app: "NEURO//SCAN", version: 9, state: {} }],
    ["missing state", { app: "NEURO//SCAN", version: 2 }],
  ])("rejects %s", (_name, payload) => {
    expect(() => parseBackup(JSON.stringify(payload), opts)).toThrow();
  });

  it("rejects oversized files", () => {
    expect(() => parseBackup("x".repeat(1_000_001), opts)).toThrow(/1 MB/);
  });
});
