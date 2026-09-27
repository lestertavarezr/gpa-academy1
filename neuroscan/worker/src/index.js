import * as h from "./handlers.js";
import { HttpError, allowedOrigin, errorResponse, preflight, withCors } from "./http.js";
import { sendDueReminders } from "./reminders.js";

const PREFIX = "/api/v1";

// auth: "user" (device bearer token), "admin" (ADMIN_TOKEN) or false. `limit` names a rate-limit bucket.
const ROUTES = {
  "POST /accounts": { handler: h.createAccount, auth: false, limit: true },
  "DELETE /account": { handler: h.deleteAccount, auth: "user" },
  "GET /progress": { handler: h.getProgress, auth: "user" },
  "PUT /progress": { handler: h.putProgress, auth: "user" },
  "POST /events": { handler: h.postEvents, auth: "user" },
  "POST /pairing": { handler: h.createPairing, auth: "user" },
  "POST /pairing/claim": { handler: h.claimPairing, auth: false, limit: true },
  "GET /push/public-key": { handler: h.pushPublicKey, auth: false },
  "PUT /push/subscription": { handler: h.putSubscription, auth: "user" },
  "DELETE /push/subscription": { handler: h.deleteSubscription, auth: "user" },
  "GET /admin/stats": { handler: h.adminStats, auth: "admin", limit: true },
  "GET /health": { handler: h.health, auth: false },
};

async function enforceRateLimit(request, env, path) {
  // Optional Workers Rate Limiting binding (see wrangler.toml); unauthenticated endpoints only.
  if (!env.RATE_LIMITER) return;
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const { success } = await env.RATE_LIMITER.limit({ key: `${path}:${ip}` });
  if (!success) throw new HttpError(429, "Demasiadas solicitudes, inténtalo en un minuto");
}

export async function handleApi(request, env) {
  const url = new URL(request.url);
  const origin = allowedOrigin(request, env);
  if (request.method === "OPTIONS") return origin ? preflight(origin) : new Response(null, { status: 403 });
  let response;
  try {
    const path = url.pathname.slice(PREFIX.length) || "/";
    const route = ROUTES[`${request.method} ${path}`];
    if (!route) throw new HttpError(Object.keys(ROUTES).some((key) => key.endsWith(` ${path}`)) ? 405 : 404, "No encontrado");
    if (route.limit) await enforceRateLimit(request, env, path);
    const context = { now: Date.now() };
    if (route.auth === "user") context.user = await h.authenticate(request, env, context.now);
    if (route.auth === "admin") await h.requireAdmin(request, env);
    response = await route.handler(request, env, context);
  } catch (error) {
    response = errorResponse(error);
  }
  return withCors(response, origin);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === PREFIX || url.pathname.startsWith(`${PREFIX}/`)) return handleApi(request, env);
    // Static assets matching a file are served before the Worker runs; anything else is a 404.
    return env.ASSETS ? env.ASSETS.fetch(request) : new Response("No encontrado", { status: 404 });
  },
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(sendDueReminders(env).then((result) => console.log("reminders", JSON.stringify(result))));
  },
};
