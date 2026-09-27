import { EVENTS_KEY, readJSON, writeJSON } from "./storage.js";

const MAX_QUEUE = 500;
export const BATCH_SIZE = 100;

// Only what is needed to improve the question bank: no free text, no identifiers.
export function answerEvent({ challenge, displayChoice, correct, mode, confidence, wasDue, now = Date.now() }) {
  return {
    challengeId: challenge.id,
    option: challenge.order[displayChoice],
    correct,
    mode,
    confidence: confidence || "",
    review: wasDue,
    at: now,
  };
}

export function enqueueEvent(event) {
  const queue = readJSON(EVENTS_KEY, []);
  queue.push(event);
  writeJSON(EVENTS_KEY, queue.slice(-MAX_QUEUE));
}

export async function flushEvents(api) {
  let queue = readJSON(EVENTS_KEY, []);
  while (queue.length) {
    const batch = queue.slice(0, BATCH_SIZE);
    await api.postEvents(batch);
    queue = readJSON(EVENTS_KEY, []).slice(batch.length);
    writeJSON(EVENTS_KEY, queue);
  }
}

export function clearEvents() {
  writeJSON(EVENTS_KEY, []);
}
