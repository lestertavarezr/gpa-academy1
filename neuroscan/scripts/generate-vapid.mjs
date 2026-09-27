// Generates the VAPID key pair used to sign Web Push requests.
import { pathToFileURL } from "node:url";

export async function generateVapidKeys() {
  const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const jwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey));
  return { VAPID_PUBLIC_KEY: Buffer.from(raw).toString("base64url"), VAPID_PRIVATE_KEY: jwk.d };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const keys = await generateVapidKeys();
  console.log(`VAPID_PUBLIC_KEY:\n${keys.VAPID_PUBLIC_KEY}\n`);
  console.log(`VAPID_PRIVATE_KEY:\n${keys.VAPID_PRIVATE_KEY}\n`);
  console.log("Guárdalas como secretos del Worker (npx wrangler secret put VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY).");
  console.log("scripts/deploy.mjs las genera y guarda solo si faltan; si cambian, cada navegador debe reactivar los avisos.");
}
