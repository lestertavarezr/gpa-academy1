// Cirujano con IA: práctica formativa de comunicación. El alumno escribe con
// sus palabras lo que comunicaría al equipo y recibe la reacción del cirujano
// y una lista de criterios. No afecta a la puntuación.
// La llamada a Claude se hace en el servidor (netlify/functions/cirujano.mjs);
// aquí solo se habla con ese endpoint.

import { CONFIG } from "./config.js";

let available = null; // null = sin comprobar

export async function aiAvailable() {
  if (!CONFIG.aiEndpoint) return !1;
  if (available !== null) return available;
  try {
    const res = await fetch(CONFIG.aiEndpoint, { method: "GET" });
    const data = res.ok ? await res.json() : null;
    available = !!data?.enabled;
  } catch {
    available = !1;
  }
  return available;
}

const CRITERIA = {
  hallazgo: "Nombra el hallazgo concreto",
  verificacion: "Dice qué se verificó o qué falta verificar",
  pendiente: "Propone la acción o el pendiente",
  claridad: "Es claro, breve y dirigido al equipo",
};

function el(tag, className, text) {
  const n = document.createElement(tag);
  className && (n.className = className);
  text != null && (n.textContent = text);
  return n;
}

/** Monta el panel de práctica dentro de `root`. */
export function mountCoach(root, context) {
  root.replaceChildren();
  const box = el("div", "coach");
  const head = el("div", "coach-head");
  head.append(
    el("strong", "", "💬 Practica con el cirujano (IA)"),
    el("small", "", "Formativo · no cuenta para la nota"),
  );
  const help = el(
    "p",
    "coach-help",
    "Escribe con tus palabras lo que le dirías al equipo en este momento. El cirujano reaccionará y verás qué incluiste y qué faltó.",
  );
  const form = el("form", "coach-form");
  const input = el("textarea");
  input.maxLength = 600;
  input.rows = 3;
  input.placeholder = "Ej.: «Doctor, antes de seguir: …»";
  input.setAttribute("aria-label", "Tu mensaje al equipo");
  const send = el("button", "button button-primary", "Enviar al cirujano");
  send.type = "submit";
  const out = el("div", "coach-out");
  out.setAttribute("aria-live", "polite");
  form.append(input, send);
  box.append(head, help, form, out);
  root.append(box);

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const message = input.value.trim();
    if (message.length < 8) {
      out.replaceChildren(
        el("p", "coach-error", "Escribe un mensaje un poco más completo."),
      );
      return;
    }
    send.disabled = !0;
    send.textContent = "El cirujano escucha…";
    out.replaceChildren(el("p", "coach-wait", "…"));
    try {
      const res = await fetch(CONFIG.aiEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ context, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) throw new Error(data.error || "error");
      render(out, data);
    } catch (e) {
      out.replaceChildren(
        el(
          "p",
          "coach-error",
          e.message === "refusal"
            ? "El cirujano no pudo responder a ese mensaje. Reformúlalo centrándote en el caso."
            : "El cirujano con IA no está disponible ahora. Inténtalo más tarde.",
        ),
      );
    } finally {
      send.disabled = !1;
      send.textContent = "Enviar al cirujano";
    }
  });
}

function render(out, data) {
  out.replaceChildren();
  const reply = el("blockquote", "coach-reply");
  reply.append(el("span", "coach-avatar", "CX"), el("p", "", data.reply));
  const list = el("ul", "coach-criteria");
  for (const c of data.criteria || []) {
    const li = el("li", c.ok ? "ok" : "miss");
    li.append(
      el("b", "", `${c.ok ? "✓" : "✗"} ${CRITERIA[c.id] || c.id}`),
      el("span", "", c.note),
    );
    list.append(li);
  }
  out.append(reply, list);
  data.tip && out.append(el("p", "coach-tip", `Consejo: ${data.tip}`));
  out.append(
    el(
      "p",
      "coach-note",
      "Respuesta generada por IA: puede equivocarse. Tu docente y el protocolo local tienen la última palabra.",
    ),
  );
}
