import authored from "../content/challenges.json";
import media from "../content/media.json";
import modules from "../content/modules.json";
import mediaUrls from "virtual:media-urls";
import { API_BASE, BUILD_TARGET } from "./config.js";
import { buildChallenges } from "./core/content.js";
import { createApi } from "./services/api.js";
import { registerServiceWorker } from "./services/push.js";
import { createProgressStore } from "./services/storage.js";
import { createSync } from "./services/sync.js";
import { mountApp } from "./ui/app.js";

const root = document.getElementById("neuroscan-root");
const challenges = buildChallenges(authored);
const mediaItem = (key) => ({ key, src: mediaUrls[key], ...media[key] });
const isWeb = BUILD_TARGET === "web";
// Inside a ChatGPT widget the host owns persistence and the page origin is not ours.
const embedded = !!globalThis.openai;

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
app = mountApp({ root, modules, challenges, mediaItem, store: createProgressStore(), sync, api, pushEnabled: isWeb && !embedded });
sync?.start();
