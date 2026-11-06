import { cookieToken, sign, verify, type Claims } from "./auth";
import { reviewCard } from "../../neuroscan/src/core/srs.js";

interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  ORTHANC_URL: string;
  ORTHANC_PASSWORD: string;
  SESSION_SECRET: string;
  LMS_SHARED_SECRET: string;
  LMS_ISSUER: string;
  LMS_AUDIENCE: string;
  DEMO_MODE: string;
  DEMO_ACCESS_KEY: string;
  ADMIN_KEY: string;
  RATE_LIMITER?: {
    limit(input: { key: string }): Promise<{ success: boolean }>;
  };
}
type CaseRow = {
  id: string;
  title: string;
  specialty: string;
  category: string;
  modality: string;
  region: string;
  difficulty: string;
  objectives: string;
  clinical_description: string;
  study_uid: string;
  bibliography: string;
  explanation: string;
  status: string;
  annotations: string;
  adapter_version: number;
  neuroscan_challenge_id: number | null;
};
type QuestionRow = {
  id: string;
  case_id: string;
  kind: string;
  prompt: string;
  options: string;
  answer: number;
  explanation: string;
  source: string;
  difficulty: string;
};
const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
};
const uidPattern = /^\d+(?:\.\d+)+$/;
const idPattern = /^[A-Z0-9-]{1,60}$/;
function json(
  value: unknown,
  status = 200,
  extra: Record<string, string> = {},
) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...headers, ...extra },
  });
}
function fail(status: number, message: string): never {
  throw { status, message };
}
async function body(request: Request): Promise<Record<string, unknown>> {
  if (Number(request.headers.get("content-length") || 0) > 16384)
    fail(413, "Cuerpo demasiado grande");
  const text = await request.text();
  if (text.length > 16384) fail(413, "Cuerpo demasiado grande");
  try {
    const data: unknown = JSON.parse(text);
    if (!data || typeof data !== "object" || Array.isArray(data))
      fail(400, "JSON inválido");
    return data as Record<string, unknown>;
  } catch {
    fail(400, "JSON inválido");
  }
}
function string(v: unknown, max = 2000): string {
  if (typeof v !== "string" || !v.trim() || v.length > max)
    fail(400, "Campo inválido");
  return v.trim();
}
function safeCase(row: CaseRow) {
  return {
    ...row,
    objectives: JSON.parse(row.objectives),
    annotations: JSON.parse(row.annotations),
    available: row.status === "published",
  };
}
function safeQuestion(row: QuestionRow, mode: string) {
  return {
    id: row.id,
    case_id: row.case_id,
    kind: row.kind,
    prompt: row.prompt,
    options: JSON.parse(row.options),
    source: row.source,
    difficulty: row.difficulty,
    ...(mode === "GUIDED" ? { hint: row.explanation } : {}),
  };
}
async function student(request: Request, env: Env): Promise<Claims> {
  const token = cookieToken(request);
  const claims =
    token &&
    (await verify(
      token,
      env.SESSION_SECRET,
      "gpa-imaging-lab",
      env.LMS_AUDIENCE,
    ));
  if (!claims) fail(401, "Sesión requerida");
  return claims;
}
async function sameSecret(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [left, right] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]);
  let difference = 0;
  const x = new Uint8Array(left),
    y = new Uint8Array(right);
  for (let i = 0; i < x.length; i++) difference |= x[i]! ^ y[i]!;
  return difference === 0 && a.length === b.length;
}
async function requireAdmin(request: Request, env: Env) {
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (
    !env.ADMIN_KEY ||
    env.ADMIN_KEY.length < 24 ||
    !token ||
    !(await sameSecret(token, env.ADMIN_KEY))
  )
    fail(403, "Administración restringida");
}
async function enrolled(env: Env, userId: string, caseId: string) {
  const row = await env.DB.prepare(
    "SELECT 1 FROM enrollments WHERE user_id=? AND case_id=?",
  )
    .bind(userId, caseId)
    .first();
  if (!row) fail(403, "Caso no matriculado");
}
async function loadCase(env: Env, id: string): Promise<CaseRow> {
  if (!idPattern.test(id)) fail(400, "Caso inválido");
  const row = await env.DB.prepare("SELECT * FROM cases WHERE id=?")
    .bind(id)
    .first<CaseRow>();
  if (!row || row.status !== "published") fail(404, "Caso no disponible");
  return row;
}
async function issueSession(
  request: Request,
  userId: string,
  env: Env,
  caseIds: string[],
) {
  if (caseIds.length > 100) fail(400, "Demasiadas matrículas");
  const statements = [
    env.DB.prepare("DELETE FROM enrollments WHERE user_id=?").bind(userId),
  ];
  for (const id of new Set(caseIds)) {
    if (!idPattern.test(id)) fail(400, "Matrícula inválida");
    const exists = await env.DB.prepare(
      "SELECT id FROM cases WHERE id=? AND status='published'",
    )
      .bind(id)
      .first();
    if (!exists) fail(400, "Caso matriculado no disponible");
    statements.push(
      env.DB.prepare(
        "INSERT INTO enrollments(user_id,case_id) VALUES(?,?)",
      ).bind(userId, id),
    );
  }
  await env.DB.batch(statements);
  const token = await sign(
    {
      sub: userId,
      iss: "gpa-imaging-lab",
      aud: env.LMS_AUDIENCE,
      exp: Math.floor(Date.now() / 1000) + 1800,
    },
    env.SESSION_SECRET,
  );
  const secure =
    request.headers.get("x-forwarded-proto") === "https" ||
    new URL(request.url).protocol === "https:"
      ? "; Secure"
      : "";
  return json({ userId, caseIds }, 200, {
    "Set-Cookie": `gpa_lab_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=1800${secure}`,
  });
}
async function dicom(request: Request, env: Env, url: URL): Promise<Response> {
  if (request.method !== "GET") fail(405, "Método no permitido");
  const user = await student(request, env);
  const path = url.pathname.slice("/dicomweb".length);
  let uid: string | undefined;
  const search =
    path === "/studies" && url.searchParams.get("StudyInstanceUID");
  if (
    search &&
    [...url.searchParams.keys()].every((k) =>
      [
        "StudyInstanceUID",
        "limit",
        "offset",
        "fuzzymatching",
        "includefield",
      ].includes(k),
    ) &&
    (!url.searchParams.has("limit") ||
      Number(url.searchParams.get("limit")) <= 101) &&
    (!url.searchParams.has("offset") ||
      url.searchParams.get("offset") === "0") &&
    (!url.searchParams.has("fuzzymatching") ||
      url.searchParams.get("fuzzymatching") === "false")
  )
    uid = search;
  const segments = path.split("/").filter(Boolean);
  if (
    segments[0] === "studies" &&
    segments[1] &&
    segments.length >= 2 &&
    segments.every((s) =>
      /^(?:studies|series|instances|frames|metadata|rendered|bulk|[0-9a-fA-F]+(?:\.[0-9a-fA-F]+)*)$/.test(
        s,
      ),
    )
  )
    uid = segments[1];
  if (!uid || !uidPattern.test(uid)) fail(403, "Consulta DICOMweb restringida");
  const row = await env.DB.prepare(
    "SELECT id FROM cases WHERE study_uid=? AND status='published'",
  )
    .bind(uid)
    .first<{ id: string }>();
  if (!row) fail(404, "Estudio no disponible");
  await enrolled(env, user.sub, row.id);
  const upstream = new URL(
    env.ORTHANC_URL.replace(/\/$/, "") + "/dicom-web" + path + url.search,
  );
  const authorization = "Basic " + btoa("gpa:" + env.ORTHANC_PASSWORD);
  const response = await fetch(upstream, {
    headers: {
      Authorization: authorization,
      Accept: request.headers.get("Accept") || "*/*",
      "Accept-Encoding": "identity",
      "X-Forwarded-Host": request.headers.get("x-forwarded-host") || url.host,
      "X-Forwarded-Proto":
        request.headers.get("x-forwarded-proto") || url.protocol.slice(0, -1),
    },
    redirect: "manual",
  });
  const resultHeaders = new Headers();
  for (const name of ["content-type", "content-length", "etag"]) {
    const value = response.headers.get(name);
    if (value) resultHeaders.set(name, value);
  }
  resultHeaders.set("Cache-Control", "private, no-store");
  resultHeaders.set("X-Content-Type-Options", "nosniff");
  if (
    response.ok &&
    response.headers.get("content-type")?.includes("dicom+json")
  ) {
    const content = (await response.json()) as unknown;
    const publicOrigin = `${request.headers.get("x-forwarded-proto") || url.protocol.slice(0, -1)}://${request.headers.get("x-forwarded-host") || url.host}`;
    const rewrite = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.map(rewrite);
      if (value && typeof value === "object")
        return Object.fromEntries(
          Object.entries(value).map(([key, item]) => [key, rewrite(item)]),
        );
      if (
        typeof value === "string" &&
        value.startsWith("http") &&
        value.includes("/dicom-web/")
      )
        return publicOrigin + "/dicomweb/" + value.split("/dicom-web/")[1];
      return value;
    };
    resultHeaders.delete("content-length");
    return new Response(JSON.stringify(rewrite(content)), {
      status: response.status,
      headers: resultHeaders,
    });
  }
  return new Response(response.body, {
    status: response.status,
    headers: resultHeaders,
  });
}
async function api(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname.slice("/api/lab".length);
  if (path === "/health" && request.method === "GET")
    return json({ ok: true, service: "gpa-imaging-lab" });
  if (path === "/auth/demo" && request.method === "POST") {
    if (env.DEMO_MODE !== "true") fail(404, "No disponible");
    const data = await body(request);
    if (!env.DEMO_ACCESS_KEY || data.key !== env.DEMO_ACCESS_KEY)
      fail(403, "Acceso de demostración denegado");
    return issueSession(request, "demo-student", env, ["GPA-NEURO-001"]);
  }
  if (path === "/auth/exchange" && request.method === "POST") {
    const token =
      request.headers.get("authorization")?.replace(/^Bearer /, "") || "";
    const claims = await verify(
      token,
      env.LMS_SHARED_SECRET,
      env.LMS_ISSUER,
      env.LMS_AUDIENCE,
    );
    if (!claims || !Array.isArray(claims.caseIds) || !claims.caseIds.length)
      fail(403, "Token LMS inválido o sin matrícula");
    return issueSession(request, claims.sub, env, claims.caseIds);
  }
  if (path === "/auth/logout" && request.method === "POST")
    return json({ ok: true }, 200, {
      "Set-Cookie":
        "gpa_lab_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
    });
  if (path.startsWith("/admin/")) return admin(request, env, path);
  const user = await student(request, env);
  if (path === "/me" && request.method === "GET")
    return json({ userId: user.sub });
  if (path === "/cases" && request.method === "GET") {
    const rows = await env.DB.prepare(
      "SELECT c.* FROM cases c JOIN enrollments e ON e.case_id=c.id WHERE e.user_id=? AND c.status='published' ORDER BY c.title",
    )
      .bind(user.sub)
      .all<CaseRow>();
    return json(rows.results.map(safeCase));
  }
  const caseMatch = path.match(/^\/cases\/([A-Z0-9-]+)$/);
  if (caseMatch && request.method === "GET") {
    const row = await loadCase(env, caseMatch[1]!);
    await enrolled(env, user.sub, row.id);
    const questions = await env.DB.prepare(
      "SELECT * FROM questions WHERE case_id=? ORDER BY id",
    )
      .bind(row.id)
      .all<QuestionRow>();
    return json({
      case: safeCase(row),
      questions: questions.results.map((q) => safeQuestion(q, "PRACTICE")),
    });
  }
  if (path === "/attempts" && request.method === "POST") {
    const data = await body(request);
    const caseId = string(data.caseId, 60);
    const questionId = string(data.questionId, 60);
    const mode = data.mode;
    if (!["GUIDED", "PRACTICE", "EVALUATION"].includes(String(mode)))
      fail(400, "Modo inválido");
    if (
      !Number.isInteger(data.selected) ||
      (data.selected as number) < 0 ||
      (data.selected as number) > 5
    )
      fail(400, "Respuesta inválida");
    const row = await loadCase(env, caseId);
    await enrolled(env, user.sub, row.id);
    const question = await env.DB.prepare(
      "SELECT * FROM questions WHERE id=? AND case_id=?",
    )
      .bind(questionId, caseId)
      .first<QuestionRow>();
    if (!question) fail(404, "Pregunta no disponible");
    const options: unknown = JSON.parse(question.options);
    if (!Array.isArray(options) || (data.selected as number) >= options.length)
      fail(400, "Respuesta inválida");
    const correct = question.answer === data.selected;
    const now = Date.now();
    await env.DB.prepare(
      "INSERT INTO attempts(id,user_id,case_id,question_id,mode,selected,correct,score,created_at) VALUES(?,?,?,?,?,?,?,?,?)",
    )
      .bind(
        crypto.randomUUID(),
        user.sub,
        caseId,
        questionId,
        mode,
        data.selected,
        correct ? 1 : 0,
        correct ? 100 : 0,
        now,
      )
      .run();
    const old = await env.DB.prepare(
      "SELECT streak, interval_days, due_at, reviews FROM review_cards WHERE user_id=? AND question_id=?",
    )
      .bind(user.sub, questionId)
      .first<{
        streak: number;
        interval_days: number;
        due_at: number;
        reviews: number;
      }>();
    const card = reviewCard(
      old
        ? {
            streak: old.streak,
            interval: old.interval_days,
            dueAt: old.due_at,
            reviews: old.reviews,
          }
        : null,
      { correct, confidence: "Media", now },
    );
    await env.DB.prepare(
      "INSERT INTO review_cards VALUES(?,?,?,?,?,?) ON CONFLICT(user_id,question_id) DO UPDATE SET streak=excluded.streak,interval_days=excluded.interval_days,due_at=excluded.due_at,reviews=excluded.reviews",
    )
      .bind(
        user.sub,
        questionId,
        card.streak,
        card.interval,
        card.dueAt,
        card.reviews,
      )
      .run();
    return json({
      correct,
      score: correct ? 100 : 0,
      answer: question.answer,
      explanation: question.explanation,
      review: card,
    });
  }
  if (path === "/progress" && request.method === "GET") {
    const rows = await env.DB.prepare(
      "SELECT case_id,COUNT(*) attempts,MAX(created_at) last_attempt,ROUND(AVG(score)) average_score FROM attempts WHERE user_id=? GROUP BY case_id",
    )
      .bind(user.sub)
      .all();
    const due = await env.DB.prepare(
      "SELECT question_id,due_at,streak FROM review_cards WHERE user_id=?",
    )
      .bind(user.sub)
      .all();
    return json({ cases: rows.results, reviews: due.results });
  }
  fail(404, "Ruta no encontrada");
}
async function admin(
  request: Request,
  env: Env,
  path: string,
): Promise<Response> {
  await requireAdmin(request, env);
  if (path === "/admin/cases" && request.method === "GET") {
    const rows = await env.DB.prepare(
      "SELECT * FROM cases ORDER BY id",
    ).all<CaseRow>();
    return json(rows.results.map(safeCase));
  }
  if (path === "/admin/cases" && request.method === "POST") {
    const d = await body(request);
    const id = string(d.id, 60),
      uid = string(d.studyUid, 100);
    if (
      !idPattern.test(id) ||
      !uidPattern.test(uid) ||
      !["draft", "published"].includes(String(d.status))
    )
      fail(400, "Identificador, UID o estado inválido");
    for (const field of [
      "title",
      "specialty",
      "category",
      "modality",
      "region",
      "difficulty",
      "clinicalDescription",
      "bibliography",
      "explanation",
    ])
      string(d[field]);
    if (
      !Array.isArray(d.objectives) ||
      !d.objectives.every((x) => typeof x === "string")
    )
      fail(400, "Objetivos inválidos");
    await env.DB.prepare(
      "INSERT INTO cases(id,title,specialty,category,modality,region,difficulty,objectives,clinical_description,study_uid,bibliography,explanation,status,annotations,adapter_version) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)",
    )
      .bind(
        id,
        d.title,
        d.specialty,
        d.category,
        d.modality,
        d.region,
        d.difficulty,
        JSON.stringify(d.objectives),
        d.clinicalDescription,
        uid,
        d.bibliography,
        d.explanation,
        d.status,
        "[]",
      )
      .run();
    return json({ id }, 201);
  }
  const statusMatch = path.match(/^\/admin\/cases\/([A-Z0-9-]+)\/status$/);
  if (statusMatch && request.method === "PUT") {
    const d = await body(request);
    if (!["draft", "published"].includes(String(d.status)))
      fail(400, "Estado inválido");
    await env.DB.prepare("UPDATE cases SET status=? WHERE id=?")
      .bind(d.status, statusMatch[1])
      .run();
    return json({ ok: true });
  }
  if (path === "/admin/questions" && request.method === "POST") {
    const d = await body(request);
    const id = string(d.id, 60),
      caseId = string(d.caseId, 60);
    if (
      !idPattern.test(id) ||
      !idPattern.test(caseId) ||
      !Array.isArray(d.options) ||
      d.options.length < 2 ||
      d.options.length > 6 ||
      !d.options.every(
        (x) => typeof x === "string" && x.length > 0 && x.length < 500,
      ) ||
      !Number.isInteger(d.answer) ||
      (d.answer as number) < 0 ||
      (d.answer as number) >= d.options.length
    )
      fail(400, "Pregunta inválida");
    await env.DB.prepare("INSERT INTO questions VALUES(?,?,?,?,?,?,?,?,?)")
      .bind(
        id,
        caseId,
        string(d.kind, 60),
        string(d.prompt),
        JSON.stringify(d.options),
        d.answer,
        string(d.explanation),
        string(d.source),
        string(d.difficulty, 60),
      )
      .run();
    return json({ id }, 201);
  }
  if (path === "/admin/stats" && request.method === "GET") {
    const rows = await env.DB.prepare(
      "SELECT case_id,COUNT(*) attempts,ROUND(AVG(score)) average_score FROM attempts GROUP BY case_id",
    ).all();
    return json(rows.results);
  }
  fail(404, "Ruta administrativa no encontrada");
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
        const origin = request.headers.get("origin");
        const host = request.headers.get("x-forwarded-host") || url.host;
        const protocol =
          request.headers.get("x-forwarded-proto") || url.protocol.slice(0, -1);
        if (origin && origin !== `${protocol}://${host}`)
          fail(403, "Origen no autorizado");
      }
      if (
        env.RATE_LIMITER &&
        (url.pathname.startsWith("/api/lab/auth/") ||
          url.pathname.startsWith("/api/lab/admin/"))
      ) {
        const ip = request.headers.get("cf-connecting-ip") || "local";
        const result = await env.RATE_LIMITER.limit({
          key: `${url.pathname}:${ip}`,
        });
        if (!result.success) fail(429, "Demasiadas solicitudes");
      }
      if (url.pathname.startsWith("/api/lab/"))
        return await api(request, env, url);
      if (url.pathname.startsWith("/dicomweb/"))
        return await dicom(request, env, url);
      if (
        url.pathname === "/lab" ||
        url.pathname === "/lab/" ||
        url.pathname.startsWith("/lab/")
      ) {
        const assetRequest =
          url.pathname === "/lab"
            ? new Request(new URL("/lab/", url), request)
            : request;
        const response = await env.ASSETS.fetch(assetRequest);
        const assetHeaders = new Headers(response.headers);
        assetHeaders.set(
          "Content-Security-Policy",
          "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'self'",
        );
        assetHeaders.set("X-Content-Type-Options", "nosniff");
        return new Response(response.body, {
          status: response.status,
          headers: assetHeaders,
        });
      }
      return json({ error: "No encontrado" }, 404);
    } catch (error) {
      const e = error as { status?: number; message?: string };
      if (!e.status) console.error("Imaging Lab request failed", e);
      return json(
        { error: e.status ? e.message : "Error interno" },
        e.status || 500,
      );
    }
  },
};
