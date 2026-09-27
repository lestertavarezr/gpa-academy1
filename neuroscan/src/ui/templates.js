import { escapeHTML as e } from "./escape.js";

const pad2 = (n) => String(n).padStart(2, "0");
const CASE_FALLBACK_LABEL = "Corte axial sintético esquemático; no representa un estudio médico real";

export function moduleNavHTML(modules, { activeModule, mastered, totals }) {
  return modules
    .map((name, i) => {
      const active = activeModule === i;
      return `<button class="mod${active ? " active" : ""}" type="button" data-mod="${i}" aria-current="${active ? "step" : "false"}"><span class="modnum">${pad2(i + 1)}</span><span>${e(name)}</span><span class="modcount">${mastered[i]}/${totals[i]}</span></button>`;
    })
    .join("");
}

export function moduleOptionsHTML(modules, { mastered, totals }) {
  return modules.map((name, i) => `<option value="${i}">${pad2(i + 1)} · ${e(name)} (${mastered[i]}/${totals[i]} dominados)</option>`).join("");
}

export function challengeVisualHTML(ch, items) {
  if (!items.length) {
    return `<div class="scanbox"><canvas id="ns-scan" role="img" aria-label="${CASE_FALLBACK_LABEL}"></canvas><span class="scanlabel">TC SIMULADA · AXIAL</span><span class="scanlegend">ESQUEMA EDUCATIVO</span><div class="scanfoot"><span>VENTANA / SECUENCIA: SIMULADA</span><span>NO DICOM</span></div></div>`;
  }
  const figures = items
    .map(
      (item, index) =>
        `<figure><button class="image-expand" type="button" data-zoom="${e(item.key)}" aria-label="Ampliar imagen: ${e(item.alt)}"><img src="${e(item.src)}" alt="" width="${item.width}" height="${item.height}" decoding="async" loading="${index === 0 ? "eager" : "lazy"}"><span class="expand-label">Ampliar imagen</span></button><figcaption>${e(item.caption)}<small>${e(item.source)}</small></figcaption></figure>`,
    )
    .join("");
  return `<div class="scanbox with-images"><div class="challenge-images${items.length === 1 ? " single" : ""}" role="group" aria-label="Imágenes completas del desafío ${pad2(ch.id)}">${figures}</div><span class="scanlabel">IMAGEN EDUCATIVA · GPA ACADEMY</span><span class="scanlegend">VISTA COMPLETA · SIN RECORTE</span><div class="scanfoot"><span>FUENTE BAJO CADA IMAGEN</span><span>NO DICOM</span></div></div>`;
}

function reflectionHTML(reflect, disabled) {
  const dis = disabled ? " disabled" : "";
  const opt = (value) => `<option value="${value}"${reflect.confidence === value ? " selected" : ""}>${value}</option>`;
  return `<section class="reflection" aria-label="Reflexión previa"><div class="reflection-title">Antes de responder · estructura tu lectura</div><div class="reflection-fields"><label>Modalidad y plano<input type="text" maxlength="55" data-reflect="reading" placeholder="Ej.: RM, axial" value="${e(reflect.reading || "")}"${dis}></label><label>Hallazgo principal<input type="text" maxlength="60" data-reflect="finding" placeholder="Describe lo que observas" value="${e(reflect.finding || "")}"${dis}></label><label>Confianza<select data-reflect="confidence"${dis}><option value="">Elige</option>${opt("Baja")}${opt("Media")}${opt("Alta")}</select></label></div></section>`;
}

export function challengeHTML({ ch, total, queuePosition, queueLength, isReview, visual, reflect, selected, answerDone, correct, mode, nextReviewText }) {
  const options = ch.options
    .map(
      (option, i) =>
        `<button type="button" class="option" data-choice="${i}" data-focus="choice-${i}" aria-pressed="${selected === i}"${answerDone ? " disabled" : ""}><span class="letter" aria-hidden="true">${String.fromCharCode(65 + i)}</span><span>${e(option)}</span></button>`,
    )
    .join("");
  const feedback =
    answerDone && mode === "practice"
      ? `<div class="feedback${correct ? "" : " bad"}"><strong>${correct ? "Respuesta correcta" : "Respuesta para repasar"}</strong>${e(ch.explanation)}<div class="source">Fuente curricular: ${e(ch.source)}</div><div class="source">Próximo repaso sugerido: ${e(nextReviewText)}</div></div>`
      : "";
  const hint = answerDone
    ? mode === "exam"
      ? "Respuesta registrada · explicación disponible al finalizar"
      : "Respuesta registrada · revisa la explicación"
    : mode === "practice"
      ? "Práctica · puedes cambiar la selección antes de confirmar"
      : "Evaluación · respuesta y explicación bloqueadas hasta el final";
  const action = answerDone
    ? `<button class="primary" id="ns-next" data-focus="next" type="button">Siguiente desafío →</button>`
    : `<button class="primary" id="ns-submit" data-focus="submit" type="button"${selected === null ? " disabled" : ""}>Confirmar respuesta</button>`;
  return `<div class="session-banner"><strong>Sesión mezclada · caso ${queuePosition} de ${queueLength}</strong><span>${isReview ? "Repaso vencido" : "Caso nuevo"}</span></div><div class="challengehead"><span class="badge">Módulo ${pad2(ch.module + 1)}</span><span class="badge level">${e(ch.difficulty)}</span><span class="number">DESAFÍO ${pad2(ch.id)} / ${total}</span></div><h2 id="ns-challenge-title" tabindex="-1">${e(ch.title)}</h2><p class="case">${e(ch.caseText)}</p>${visual}<div class="qrow"><strong id="ns-question">${e(ch.question)}</strong><span class="competency">${e(ch.competency)}</span></div>${reflectionHTML(reflect, answerDone)}<div class="options" role="group" aria-labelledby="ns-question">${options}</div><div id="ns-feedback" aria-live="polite">${feedback}</div><div class="actions"><span class="hint">${hint}</span><div class="actionbuttons">${action}</div></div>`;
}

export function reportGroupsHTML({ modules, challengesById, ids, state, masteredByModule, totals }) {
  return modules
    .map((name, mi) => {
      const group = ids.map((id) => challengesById.get(id)).filter((c) => c && c.module === mi);
      if (!group.length) return "";
      const correct = group.filter((c) => state.sessionAnswers[c.id] === 100).length;
      const items = group
        .map((c) => {
          const r = state.reflections[c.id] || {};
          return `<li><strong>${state.sessionAnswers[c.id] === 100 ? "Correcto" : "Para repasar"} — ${e(c.title)}</strong><br>Tu respuesta: ${e(c.options[state.choices[c.id]] ?? "Sin respuesta")}<br>Respuesta correcta: ${e(c.options[c.answer])}<br>Tu lectura previa: ${e(r.reading || "—")} · ${e(r.finding || "—")} · confianza ${e(r.confidence || "—")}<br>${e(c.explanation)}<br>Material: ${e(c.source)}</li>`;
        })
        .join("");
      return `<details class="result-module"><summary>${e(name)} · ${masteredByModule[mi]}/${totals[mi]} dominados · ${correct}/${group.length} correctos en esta sesión</summary><ul>${items}</ul></details>`;
    })
    .join("");
}

export function sessionEndHTML({ empty, correct, total, sessionXP, streak, seen, mastered, challengeCount, due, nextDueText, report }) {
  const subtitle = empty
    ? "No tienes casos nuevos ni repasos vencidos."
    : `${correct} de ${total} correctas · ${Math.round((correct / total) * 100)}% en esta sesión · +${sessionXP} XP.`;
  const dueText = due ? `Hay ${due} repasos vencidos.` : `Siguiente repaso: ${e(nextDueText)}.`;
  return `<section class="complete session-report"><div class="eyebrow">${empty ? "Plan de aprendizaje" : "Misión completada"} · racha ${streak} días</div><h2 id="ns-challenge-title" tabindex="-1">${empty ? "Ya vas al día" : "Cinco minutos que cuentan"}</h2><p>${subtitle} Has visto ${seen}/${challengeCount} casos y dominas ${mastered}/${challengeCount} con aciertos repetidos. ${dueText}</p>${report ? `<div class="result-modules" aria-label="Resultados y referencias de esta sesión">${report}</div>` : ""}<div class="result-actions"><button class="primary" type="button" id="ns-new-session-end">${empty ? "No hay casos nuevos" : "Empezar otra sesión de 5"}</button></div></section>`;
}
