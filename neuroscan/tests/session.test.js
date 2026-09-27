import { describe, expect, it } from "vitest";
import authored from "../content/challenges.json";
import modules from "../content/modules.json";
import { interleavedIds, sessionCandidates } from "../src/core/session.js";

const NOW = Date.UTC(2026, 0, 10, 12);
const base = { challenges: authored, moduleCount: modules.length, srs: {}, done: [], now: NOW };
const moduleOf = (id) => authored[id - 1].module;

describe("interleavedIds", () => {
  it("takes one challenge per module in turn and includes every challenge once", () => {
    const ids = interleavedIds(authored, modules.length);
    expect(ids.slice(0, 8).map(moduleOf)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(new Set(ids).size).toBe(authored.length);
  });
});

describe("sessionCandidates", () => {
  it("starts a fresh learner with five unseen cases from different modules", () => {
    const queue = sessionCandidates(base);
    expect(queue).toHaveLength(5);
    expect(new Set(queue.map(moduleOf)).size).toBe(5);
  });

  it("puts at most three overdue reviews first, then new cases", () => {
    const srs = Object.fromEntries([10, 20, 30, 40].map((id, i) => [id, { streak: 1, interval: 1, dueAt: NOW - 1000 + i, reviews: 1 }]));
    const queue = sessionCandidates({ ...base, srs, done: [10, 20, 30, 40] });
    expect(queue.slice(0, 3)).toEqual([10, 20, 30]);
    expect(queue).toHaveLength(5);
    expect(queue.slice(3).every((id) => ![10, 20, 30, 40].includes(id))).toBe(true);
  });

  it("returns an empty queue when everything is seen and nothing is due", () => {
    const done = authored.map((c) => c.id);
    const srs = Object.fromEntries(done.map((id) => [id, { streak: 1, interval: 3, dueAt: NOW + 1e9, reviews: 1 }]));
    expect(sessionCandidates({ ...base, srs, done })).toEqual([]);
  });

  it("keeps a module session full by revisiting seen cases", () => {
    const moduleIds = authored.filter((c) => c.module === 2).map((c) => c.id);
    const queue = sessionCandidates({ ...base, done: moduleIds, moduleIndex: 2 });
    expect(queue).toHaveLength(5);
    expect(queue.every((id) => moduleOf(id) === 2)).toBe(true);
  });
});
