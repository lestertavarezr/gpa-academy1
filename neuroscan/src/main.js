import authored from "../content/challenges.json";
import media from "../content/media.json";
import modules from "../content/modules.json";
import mediaUrls from "virtual:media-urls";
import { API_BASE, BUILD_TARGET } from "./config.js";
import { buildChallenges } from "./core/content.js";
import { createApi } from "./services/api.js";
import { registerServiceWorker } from "./services/push.js";
import { createScormStore, findScormApi } from "./services/scorm.js";
import { createProgressStore } from "./services/storage.js";
import { createSync } from "./services/sync.js";
import { mountApp } from "./ui/app.js";

const root = document.getElementById("neuroscan-root");
const challenges = buildChallenges(authored);
const mediaItem = (key) => ({ key, src: mediaUrls[key], ...media[key] });
const isWeb = BUILD_TARGET === "web";
// Inside a ChatGPT widget the host owns persistence and the page origin is not ours.
const embedded = !!globalThis.openai;

// Inside Moodle (SCORM build) progress lives in the learner's LMS record; outside an LMS the
// package still opens and falls back to this browser's storage.
const scormApi = BUILD_TARGET === "scorm" ? findScormApi() : null;
const store = (scormApi && createScormStore({ api: scormApi, challengeCount: challenges.length })) || createProgressStore();

let app = null;
let api = null;
let sync = null;
if (API_BASE && !embedded) {
  api = createApi({ base: API_BASE, getToken: () => sync?.token() });
  sync = createSync({
    api,
    challengeCount: challenges.length,
    getState: () => app.getState(),
    applyState: (state) => app.applyRemoteState(state),
    onStatus: () => app?.renderCloud(),
  });
}
if (isWeb && !embedded) registerServiceWorker();
app = mountApp({
  root,
  modules,
  challenges,
  mediaItem,
  store,
  sync,
  api,
  pushEnabled: isWeb && !embedded,
  allowImport: BUILD_TARGET !== "scorm",
  downloads: BUILD_TARGET === "artifact" ? (globalThis.claude?.use?.("downloads") ?? Promise.resolve(null)) : null,
});
sync?.start();
