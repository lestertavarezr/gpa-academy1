import { dueIds } from "./srs.js";

export const SESSION_SIZE = 98;
const MAX_DUE_FIRST = 3;

export function interleavedIds(challenges, moduleCount) {
  return challenges.map((c) => c.id);
}

// Up to 3 overdue reviews first, then unseen cases in sequential id order, then remaining reviews.
// A module-scoped session is topped up with already-seen cases so it is never empty.
export function sessionCandidates({ challenges, moduleCount, srs, done, now, moduleIndex = null, size = SESSION_SIZE }) {
  const byId = new Map(challenges.map((c) => [c.id, c]));
  const inScope = (c) => moduleIndex === null || c.module === moduleIndex;
  const seen = new Set(done);
  const due = dueIds(srs, challenges, now).map((id) => byId.get(id)).filter(inScope);
  const fresh = challenges.filter((c) => inScope(c) && !seen.has(c.id));
  const queue = due.slice(0, MAX_DUE_FIRST).map((c) => c.id);
  for (const c of fresh) {
    if (queue.length >= size) break;
    queue.push(c.id);
  }
  for (const c of due.slice(MAX_DUE_FIRST)) if (queue.length < size && !queue.includes(c.id)) queue.push(c.id);
  if (moduleIndex !== null) {
    for (const c of challenges) if (queue.length < size && inScope(c) && !queue.includes(c.id)) queue.push(c.id);
  }
  return queue;
}
