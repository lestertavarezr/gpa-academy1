// Generates the VAPID key pair used to sign Web Push requests.
const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
const jwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
const raw = new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey));
const publicKey = Buffer.from(raw).toString("base64url");
console.log(`VAPID_PUBLIC_KEY (wrangler.toml [vars]):\n${publicKey}\n`);
console.log(`VAPID_PRIVATE_KEY (secreto: npx wrangler secret put VAPID_PRIVATE_KEY):\n${jwk.d}\n`);
console.log("Guarda la clave privada en un gestor de contraseñas. Si cambia, los avisos existentes dejan de funcionar hasta que cada navegador vuelva a activarlos.");
