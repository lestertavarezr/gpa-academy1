// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { defaultState, sanitizeState } from "../src/core/state.js";
import { EVENTS_KEY, DEVICE_KEY } from "../src/services/storage.js";
import { createSync } from "../src/services/sync.js";

const clean = (s) => sanitizeState(s, { challengeCount: 98 });

function fakeServer() {
  const server = { rev: 0, state: null, calls: [], events: [], failNextPut: null };
  const err = (status, body) => Object.assign(new Error(String(status)), { status, body });
  server.api = {
    createAccount: async () => (server.calls.push("createAccount"), { userId: "u1", token: "tok-1" }),
    getProgress: async () => (server.calls.push("getProgress"), { rev: server.rev, state: server.state }),
    putProgress: async (baseRev, state) => {
      server.calls.push(`put@${baseRev}`);
      if (server.failNextPut) {
        const e = server.failNextPut;
        server.failNextPut = null;
        throw e;
      }
      if (baseRev !== server.rev) throw err(409, { rev: server.rev, state: server.state });
      server.rev += 1;
      server.state = JSON.parse(JSON.stringify(state));
      return { rev: server.rev };
    },
    postEvents: async (events) => server.events.push(...events),
    createPairingCode: async () => ({ code: "ABCD-EFGH", expiresAt: Date.now() + 600000 }),
    claimPairingCode: async () => ({ userId: "u2", token: "tok-2" }),
    deleteAccount: async () => server.calls.push("deleteAccount"),
  };
  server.err = err;
  return server;
}

function setup(server, initial = defaultState()) {
  let state = clean(initial);
  const statuses = [];
  const sync = createSync({
    api: server.api,
    challengeCount: 98,
    getState: () => state,
    applyState: (next) => (state = next),
    onStatus: (s) => statuses.push(s),
  });
  return { sync, statuses, get state() { return state; }, set state(v) { state = v; } };
}

beforeEach(() => localStorage.clear());

describe("createSync", () => {
  it("creates an anonymous account and uploads local progress", async () => {
    const server = fakeServer();
    const ctx = setup(server, { done: [1, 2], updatedAt: 10 });
    await ctx.sync.sync();
    expect(server.calls).toEqual(["createAccount", "getProgress", "put@0"]);
    expect(server.state.done).toEqual([1, 2]);
    expect(JSON.parse(localStorage.getItem(DEVICE_KEY))).toMatchObject({ token: "tok-1", rev: 1 });
    expect(ctx.statuses.at(-1)).toBe("synced");
  });

  it("merges progress from another device on pull", async () => {
    const server = fakeServer();
    server.rev = 3;
    server.state = clean({ done: [7], updatedAt: 50, srs: { 7: { streak: 1, interval: 1, dueAt: 5, reviews: 1 } } });
    const ctx = setup(server, { done: [1], updatedAt: 10 });
    await ctx.sync.sync();
    expect(ctx.state.done).toEqual([1, 7]);
    expect(server.state.done).toEqual([1, 7]);
    expect(server.rev).toBe(4);
  });

  it("resolves a write conflict by merging and retrying", async () => {
    const server = fakeServer();
    const ctx = setup(server, { done: [1], updatedAt: 10 });
    await ctx.sync.sync();
    // Another device writes in between.
    server.rev = 2;
    server.state = clean({ done: [9], updatedAt: 20 });
    ctx.state = { ...ctx.state, done: [1, 3], updatedAt: 30 };
    ctx.sync.schedule();
    await new Promise((r) => setTimeout(r, 1600));
    expect(server.state.done).toEqual([1, 3, 9]);
    expect(server.calls.slice(-2)).toEqual(["put@1", "put@2"]);
  });

  it("skips uploads when nothing changed", async () => {
    const server = fakeServer();
    const ctx = setup(server, { done: [1], updatedAt: 10 });
    await ctx.sync.sync();
    await ctx.sync.sync();
    expect(server.calls.filter((c) => c.startsWith("put"))).toHaveLength(1);
  });

  it("reports offline on network errors and keeps the account", async () => {
    const server = fakeServer();
    const ctx = setup(server);
    await ctx.sync.sync();
    server.failNextPut = new TypeError("Failed to fetch");
    ctx.state = { ...ctx.state, updatedAt: 99 };
    await ctx.sync.sync().catch(() => {});
    expect(ctx.statuses.at(-1)).toBe("offline");
    expect(ctx.sync.hasAccount).toBe(true);
  });

  it("starts over with a new anonymous account after a 401", async () => {
    const server = fakeServer();
    const ctx = setup(server);
    await ctx.sync.sync();
    server.failNextPut = server.err(401, { error: "No autenticado" });
    ctx.state = { ...ctx.state, updatedAt: 99 };
    await ctx.sync.sync().catch(() => {});
    expect(ctx.sync.hasAccount).toBe(false);
  });

  it("uploads queued analytics and clears them when the cloud is turned off", async () => {
    const server = fakeServer();
    localStorage.setItem(EVENTS_KEY, JSON.stringify([{ challengeId: 1 }, { challengeId: 2 }]));
    const ctx = setup(server);
    await ctx.sync.sync();
    expect(server.events).toHaveLength(2);
    expect(JSON.parse(localStorage.getItem(EVENTS_KEY))).toEqual([]);
    localStorage.setItem(EVENTS_KEY, JSON.stringify([{ challengeId: 3 }]));
    await ctx.sync.setEnabled(false);
    expect(ctx.sync.status).toBe("off");
    expect(JSON.parse(localStorage.getItem(EVENTS_KEY))).toEqual([]);
    const before = server.calls.length;
    await ctx.sync.sync();
    expect(server.calls.length).toBe(before);
  });

  it("switches to the linked account when claiming a pairing code", async () => {
    const server = fakeServer();
    const ctx = setup(server, { done: [4], updatedAt: 5 });
    await ctx.sync.claimPairingCode("ABCDEFGH");
    expect(JSON.parse(localStorage.getItem(DEVICE_KEY))).toMatchObject({ userId: "u2", token: "tok-2" });
    expect(server.state.done).toEqual([4]);
  });
});
