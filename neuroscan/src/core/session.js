import { dueIds } from "./srs.js";

export const SESSION_SIZE = 5;
const MAX_DUE_FIRST = 3;

export function interleavedIds(challenges, moduleCount) {
  const groups = Array.from({ length: moduleCount }, (_, mi) => challenges.filter((c) => c.module === mi));
  const longest = Math.max(0, ...groups.map((g) => g.length));
  const ids = [];
  for (let step = 0; step < longest; step++) {
    for (const group of groups) if (group[step]) ids.push(group[step].id);
  }
  return ids;
}

// Up to 3 overdue reviews first, then unseen cases alternating modules, then remaining reviews.
// A module-scoped session is topped up with already-seen cases so it is never empty.
export function sessionCandidates({ challenges, moduleCount, srs, done, now, moduleIndex = null, size = SESSION_SIZE }) {
  const byId = new Map(challenges.map((c) => [c.id, c]));
  const inScope = (c) => moduleIndex === null || c.module === moduleIndex;
  const seen = new Set(done);
  const due = dueIds(srs, challenges, now).map((id) => byId.get(id)).filter(inScope);
  const order = interleavedIds(challenges, moduleCount).map((id) => byId.get(id));
  const fresh = order.filter((c) => inScope(c) && !seen.has(c.id));
  const queue = due.slice(0, MAX_DUE_FIRST).map((c) => c.id);
  let lastModule = queue.length ? byId.get(queue.at(-1)).module : null;
  while (queue.length < size && fresh.length) {
    let at = fresh.findIndex((c) => c.module !== lastModule);
    if (at < 0) at = 0;
    const [c] = fresh.splice(at, 1);
    queue.push(c.id);
    lastModule = c.module;
  }
  for (const c of due.slice(MAX_DUE_FIRST)) if (queue.length < size && !queue.includes(c.id)) queue.push(c.id);
  if (moduleIndex !== null) {
    for (const c of order) if (queue.length < size && inScope(c) && !queue.includes(c.id)) queue.push(c.id);
  }
  return queue;
}
