import "./style.css";
import "./admin.css";
const app = document.querySelector<HTMLDivElement>("#admin-app")!;
let key = "";
type CaseRow = {
  id: string;
  title: string;
  status: "draft" | "published";
  study_uid: string;
  specialty: string;
};
type StatRow = { case_id: string; attempts: number; average_score: number };
function node<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text = "",
): HTMLElementTagNameMap[K] {
  const item = document.createElement(tag);
  item.textContent = text;
  return item;
}
async function adminApi<T>(
  path: string,
  method = "GET",
  data?: unknown,
): Promise<T> {
  const res = await fetch("/api/lab/admin" + path, {
    method,
    headers: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  const body = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(body.error || "Error de servidor");
  return body;
}
function field(
  form: HTMLFormElement,
  name: string,
  label: string,
  required = true,
): HTMLInputElement {
  const wrap = node("label", label);
  const input = node("input") as HTMLInputElement;
  input.name = name;
  input.required = required;
  input.maxLength = 2000;
  wrap.append(input);
  form.append(wrap);
  return input;
}
function status(message: string) {
  const target = document.querySelector("#admin-status");
  if (target) target.textContent = message;
}
function login() {
  app.replaceChildren();
  const shell = node("main");
  shell.className = "admin-shell";
  shell.append(node("div", "GPA ACADEMY / ADMINISTRACIÓN"));
  const card = node("section");
  card.className = "admin-card";
  card.append(
    node("h1", "Imaging Lab · Administración"),
    node(
      "p",
      "Acceso restringido. La clave permanece solo en memoria de esta pestaña.",
    ),
  );
  const form = node("form");
  const input = field(form, "key", "Clave administrativa");
  input.type = "password";
  input.autocomplete = "off";
  const submit = node("button", "Acceder");
  submit.className = "primary";
  submit.type = "submit";
  form.append(submit);
  const message = node("p");
  message.id = "admin-status";
  card.append(form, message);
  shell.append(card);
  app.append(shell);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    key = input.value;
    try {
      await adminApi("/cases");
      await render();
    } catch (e) {
      status((e as Error).message);
      key = "";
    }
  });
}
async function render() {
  const [cases, stats] = await Promise.all([
    adminApi<CaseRow[]>("/cases"),
    adminApi<StatRow[]>("/stats"),
  ]);
  app.replaceChildren();
  const shell = node("main");
  shell.className = "admin-shell";
  const header = node("header");
  header.className = "admin-header";
  header.append(
    node("div", "GPA / MEDICAL IMAGING LAB"),
    node("h1", "Administración académica"),
  );
  const logout = node("button", "Cerrar acceso");
  logout.className = "ghost";
  logout.onclick = () => {
    key = "";
    login();
  };
  header.append(logout);
  shell.append(header);
  const message = node("p");
  message.id = "admin-status";
  message.setAttribute("role", "status");
  shell.append(message);
  const grid = node("div");
  grid.className = "admin-grid";
  const catalog = node("section");
  catalog.className = "admin-card";
  catalog.append(node("h2", "Casos y publicación"));
  for (const c of cases) {
    const row = node("div");
    row.className = "admin-row";
    const text = node("span", `${c.id} · ${c.title} · ${c.status}`);
    const toggle = node(
      "button",
      c.status === "published" ? "Despublicar" : "Publicar",
    );
    toggle.className = "ghost";
    toggle.onclick = async () => {
      try {
        await adminApi(`/cases/${c.id}/status`, "PUT", {
          status: c.status === "published" ? "draft" : "published",
        });
        await render();
      } catch (e) {
        status((e as Error).message);
      }
    };
    row.append(text, toggle);
    catalog.append(row);
  }
  grid.append(catalog);
  const performance = node("section");
  performance.className = "admin-card";
  performance.append(node("h2", "Rendimiento académico"));
  for (const s of stats)
    performance.append(
      node(
        "p",
        `${s.case_id}: ${s.attempts} intentos · media ${s.average_score}%`,
      ),
    );
  if (!stats.length) performance.append(node("p", "Sin intentos todavía."));
  grid.append(performance);
  const create = node("section");
  create.className = "admin-card";
  create.append(node("h2", "Crear caso"));
  const caseForm = node("form");
  const entries: [string, string][] = [
    ["id", "ID académico"],
    ["title", "Título"],
    ["specialty", "Especialidad"],
    ["category", "Categoría"],
    ["modality", "Modalidad"],
    ["region", "Región"],
    ["difficulty", "Dificultad"],
    ["studyUid", "StudyInstanceUID"],
    ["clinicalDescription", "Descripción clínica anonimizada"],
    ["bibliography", "Referencia bibliográfica"],
    ["explanation", "Explicación"],
    ["objectives", "Objetivos, separados por |"],
  ];
  for (const [name, label] of entries) field(caseForm, name, label);
  const caseSubmit = node("button", "Crear borrador");
  caseSubmit.className = "primary";
  caseSubmit.type = "submit";
  caseForm.append(caseSubmit);
  caseForm.onsubmit = async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(caseForm)) as Record<
      string,
      string
    >;
    try {
      await adminApi("/cases", "POST", {
        ...values,
        objectives: values
          .objectives!.split("|")
          .map((x) => x.trim())
          .filter(Boolean),
        status: "draft",
      });
      await render();
      status("Caso creado como borrador.");
    } catch (e) {
      status((e as Error).message);
    }
  };
  create.append(caseForm);
  grid.append(create);
  const add = node("section");
  add.className = "admin-card";
  add.append(node("h2", "Añadir pregunta"));
  const questionForm = node("form");
  const qfields: [string, string][] = [
    ["id", "ID de pregunta"],
    ["caseId", "ID del caso"],
    ["kind", "Tipo de actividad"],
    ["prompt", "Enunciado"],
    ["options", "Opciones, separadas por |"],
    ["answer", "Índice correcto (0=A)"],
    ["explanation", "Explicación"],
    ["source", "Fuente"],
    ["difficulty", "Dificultad"],
  ];
  for (const [name, label] of qfields) field(questionForm, name, label);
  const qSubmit = node("button", "Añadir pregunta");
  qSubmit.className = "primary";
  qSubmit.type = "submit";
  questionForm.append(qSubmit);
  questionForm.onsubmit = async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(questionForm)) as Record<
      string,
      string
    >;
    try {
      await adminApi("/questions", "POST", {
        ...values,
        options: values
          .options!.split("|")
          .map((x) => x.trim())
          .filter(Boolean),
        answer: Number(values.answer),
      });
      await render();
      status("Pregunta añadida.");
    } catch (e) {
      status((e as Error).message);
    }
  };
  add.append(questionForm);
  grid.append(add);
  shell.append(grid);
  app.append(shell);
}
login();
