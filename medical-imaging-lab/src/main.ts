import "./style.css";
type Case = {
  id: string;
  title: string;
  specialty: string;
  category: string;
  modality: string;
  region: string;
  difficulty: string;
  objectives: string[];
  clinical_description: string;
  study_uid: string;
  bibliography: string;
  explanation: string;
  annotations: { label: string; description: string }[];
  available: boolean;
};
type Question = {
  id: string;
  prompt: string;
  options: string[];
  kind: string;
  source: string;
  difficulty: string;
  hint?: string;
};
type Detail = { case: Case; questions: Question[] };
const app = document.querySelector<HTMLDivElement>("#app")!;
let cases: Case[] = [];
let detail: Detail | null = null;
let mode: "GUIDED" | "PRACTICE" | "EVALUATION" = "PRACTICE";
let completed = 0;
let filter = "Todos";
let mobilePanel = false;
const categories = [
  "Todos",
  "Neuroimágenes",
  "Tórax",
  "Abdomen",
  "Pelvis",
  "Sistema musculoesquelético",
  "Casos quirúrgicos",
];
function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = "",
  text = "",
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}
function button(
  text: string,
  action: () => void,
  className = "",
): HTMLButtonElement {
  const node = el("button", className, text);
  node.type = "button";
  node.addEventListener("click", action);
  return node;
}
async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch("/api/lab" + path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}
function showError(message: string) {
  const box = document.querySelector("#notice");
  if (box) {
    box.textContent = message;
    box.classList.add("visible");
  }
}
function login() {
  app.replaceChildren();
  const shell = el("main", "login-shell");
  const mark = el("div", "brand-mark", "GPA / MEDICAL IMAGING LAB");
  const card = el("section", "login-card");
  card.append(
    el("div", "eyebrow", "GPA ACADEMY OS · LABORATORIO VIRTUAL"),
    el("h1", "", "Interpretar empieza por observar."),
    el(
      "p",
      "muted",
      "Explore estudios DICOM sintéticos, razone cada hallazgo y registre su progreso académico. Uso exclusivamente educativo.",
    ),
  );
  const form = el("form");
  const label = el("label", "", "Clave de acceso local");
  const input = el("input") as HTMLInputElement;
  input.type = "password";
  input.required = true;
  input.autocomplete = "off";
  input.placeholder = "Clave DEMO_ACCESS_KEY";
  label.append(input);
  form.append(
    label,
    el(
      "p",
      "hint",
      "El acceso de demostración solo está disponible cuando DEMO_MODE=true.",
    ),
  );
  const submit = el("button", "primary", "Entrar al laboratorio");
  submit.type = "submit";
  form.append(submit);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    submit.disabled = true;
    try {
      await api("/auth/demo", {
        method: "POST",
        body: JSON.stringify({ key: input.value }),
      });
      await load();
    } catch (e) {
      showError((e as Error).message);
      submit.disabled = false;
    }
  });
  card.append(form);
  shell.append(mark, card, el("div", "notice", ""));
  app.append(shell);
}
async function load() {
  try {
    cases = await api<Case[]>("/cases");
    render();
    if (cases[0]) await openCase(cases[0].id);
  } catch {
    login();
  }
}
function render() {
  app.replaceChildren();
  const shell = el("div", "shell");
  const header = el("header", "topbar");
  const logo = el("div", "logo");
  logo.append(
    el("span", "logo-icon", "✦"),
    el("span", "", "GPA ACADEMY"),
    el("span", "logo-sub", "/ IMAGING LAB"),
  );
  const right = el("div", "top-actions");
  right.append(
    el("span", "live-dot", "● ENTORNO EDUCATIVO"),
    button(
      "Salir",
      async () => {
        await api("/auth/logout", { method: "POST" });
        login();
      },
      "ghost",
    ),
  );
  header.append(logo, right);
  const layout = el("div", "layout");
  const aside = el("aside", "cases-panel");
  aside.append(
    el("div", "section-kicker", "BIBLIOTECA / 01"),
    el("h2", "", "Estudios"),
  );
  const search = el("input", "search") as HTMLInputElement;
  search.type = "search";
  search.placeholder = "Buscar estudio…";
  search.setAttribute("aria-label", "Buscar estudios");
  aside.append(search);
  const select = el("select", "category") as HTMLSelectElement;
  select.setAttribute("aria-label", "Filtrar por categoría");
  categories.forEach((c) => {
    const option = el("option", "", c);
    option.value = c;
    select.append(option);
  });
  aside.append(select);
  const count = el("p", "case-count");
  const list = el("div", "case-list");
  aside.append(count, list);
  const refreshList = () => {
    filter = select.value;
    list.replaceChildren();
    const result = cases.filter(
      (c) =>
        (filter === "Todos" || c.category === filter) &&
        `${c.title} ${c.specialty} ${c.id}`
          .toLowerCase()
          .includes(search.value.toLowerCase()),
    );
    count.textContent = `${result.length} ESTUDIO${result.length === 1 ? "" : "S"} DISPONIBLE${result.length === 1 ? "" : "S"}`;
    result.forEach((c) => {
      const item = button("", () => openCase(c.id), "case-card");
      item.dataset.id = c.id;
      item.append(
        el("span", "case-id", c.id),
        el("strong", "", c.title),
        el("span", "case-meta", `${c.modality} · ${c.region}`),
        el("span", "difficulty", c.difficulty),
      );
      list.append(item);
    });
  };
  select.addEventListener("change", refreshList);
  search.addEventListener("input", refreshList);
  refreshList();
  const center = el("main", "viewer-zone");
  center.id = "viewer-zone";
  const panel = el("aside", "learning-panel");
  panel.id = "learning-panel";
  const toggle = button(
    "Actividades",
    () => {
      mobilePanel = !mobilePanel;
      panel.classList.toggle("open", mobilePanel);
      toggle.setAttribute("aria-expanded", String(mobilePanel));
    },
    "mobile-toggle",
  );
  toggle.setAttribute("aria-expanded", "false");
  layout.append(aside, center, panel);
  shell.append(header, layout, toggle, el("div", "notice", ""));
  app.append(shell);
}
async function openCase(id: string) {
  const zone = document.querySelector("#viewer-zone");
  if (zone)
    zone.replaceChildren(el("div", "loading", "Cargando caso y visor DICOM…"));
  try {
    detail = await api<Detail>("/cases/" + id);
    completed = 0;
    document
      .querySelectorAll<HTMLButtonElement>(".case-card")
      .forEach((b) => b.classList.toggle("active", b.dataset.id === id));
    renderViewer();
    renderLearning();
  } catch (e) {
    showError((e as Error).message);
  }
}
function renderViewer() {
  if (!detail) return;
  const c = detail.case;
  const zone = document.querySelector<HTMLElement>("#viewer-zone")!;
  zone.replaceChildren();
  const title = el("div", "study-heading");
  const info = el("div");
  info.append(
    el("div", "section-kicker", "ESTUDIO ACTIVO / " + c.id),
    el("h1", "", c.title),
    el("p", "study-meta", `${c.specialty}  ·  ${c.modality}  ·  ${c.region}`),
  );
  const badge = el("span", "study-badge", "● ESTUDIO SINTÉTICO");
  title.append(info, badge);
  const frameWrap = el("div", "frame-wrap");
  const frame = el("iframe") as HTMLIFrameElement;
  frame.title = "Visor DICOM OHIF";
  frame.loading = "lazy";
  frame.allow = "fullscreen";
  frame.src = "/viewer?StudyInstanceUIDs=" + encodeURIComponent(c.study_uid);
  frameWrap.append(frame);
  const footer = el("div", "viewer-footer");
  footer.append(
    el("span", "", "OHIF VIEWER · Cornerstone3D · DICOMweb"),
    el("span", "", "Navegue cortes con la rueda o controles del visor"),
  );
  zone.append(title, frameWrap, footer);
}
function renderLearning() {
  if (!detail) return;
  const panel = document.querySelector<HTMLElement>("#learning-panel")!;
  panel.replaceChildren();
  const c = detail.case;
  panel.append(
    el("div", "section-kicker", "ENTRENAMIENTO / 02"),
    el("h2", "", "Análisis clínico"),
  );
  const tabs = el("div", "mode-tabs");
  (["GUIDED", "PRACTICE", "EVALUATION"] as const).forEach((value) =>
    tabs.append(
      button(
        { GUIDED: "Guiado", PRACTICE: "Práctica", EVALUATION: "Evaluación" }[
          value
        ],
        () => {
          mode = value;
          renderLearning();
        },
        mode === value ? "selected" : "",
      ),
    ),
  );
  panel.append(tabs);
  const progress = el("div", "progress-block");
  const label = el("div", "progress-label");
  label.append(
    el("span", "", "PROGRESO DEL CASO"),
    el("strong", "", `${completed}/${detail.questions.length}`),
  );
  const track = el("div", "progress-track");
  const bar = el("div", "progress-fill");
  bar.style.width = `${detail.questions.length ? (completed / detail.questions.length) * 100 : 0}%`;
  track.append(bar);
  progress.append(label, track);
  panel.append(progress);
  const intro = el("section", "clinical-card");
  intro.append(
    el("div", "card-label", "CONTEXTO CLÍNICO"),
    el("p", "", c.clinical_description),
  );
  panel.append(intro);
  if (mode === "GUIDED") {
    const guide = el("section", "guide-card");
    guide.append(el("div", "card-label", "PISTAS Y OBJETIVOS"));
    c.objectives.forEach((o) => guide.append(el("p", "objective", "↗  " + o)));
    c.annotations.forEach((a) =>
      guide.append(el("p", "objective", `${a.label}: ${a.description}`)),
    );
    panel.append(guide);
  }
  detail.questions.forEach((q, index) => {
    const card = el("section", "question-card");
    card.append(
      el(
        "div",
        "card-label",
        `PREGUNTA ${String(index + 1).padStart(2, "0")} / ${q.difficulty}`,
      ),
      el("h3", "", q.prompt),
    );
    const form = el("form", "options");
    q.options.forEach((option, i) => {
      const label = el("label", "option");
      const radio = el("input") as HTMLInputElement;
      radio.type = "radio";
      radio.name = "answer-" + q.id;
      radio.value = String(i);
      radio.required = true;
      label.append(
        radio,
        el("span", "option-letter", String.fromCharCode(65 + i)),
        el("span", "", option),
      );
      form.append(label);
    });
    const result = el("div", "result");
    const submit = el("button", "primary", "Enviar respuesta");
    submit.type = "submit";
    form.append(submit, result);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const checked = form.querySelector<HTMLInputElement>("input:checked");
      if (!checked) return;
      submit.disabled = true;
      try {
        const response = await api<{
          correct: boolean;
          score: number;
          answer: number;
          explanation: string;
          review: { dueAt: number };
        }>("/attempts", {
          method: "POST",
          body: JSON.stringify({
            caseId: c.id,
            questionId: q.id,
            mode,
            selected: Number(checked.value),
          }),
        });
        result.className =
          "result visible " + (response.correct ? "correct" : "incorrect");
        result.textContent = `${response.correct ? "Correcto" : "Revise su respuesta"} · ${response.score} puntos. ${response.explanation}`;
        completed = Math.min(detail!.questions.length, completed + 1);
        const fill = panel.querySelector<HTMLElement>(".progress-fill");
        if (fill)
          fill.style.width = `${(completed / detail!.questions.length) * 100}%`;
        panel.querySelector(".progress-label strong")!.textContent =
          `${completed}/${detail!.questions.length}`;
      } catch (e) {
        submit.disabled = false;
        showError((e as Error).message);
      }
    });
    card.append(form);
    panel.append(card);
  });
  if (mode === "GUIDED") panel.append(el("p", "hint", c.explanation));
  panel.append(el("p", "source", "FUENTE · " + c.bibliography));
}
load();
