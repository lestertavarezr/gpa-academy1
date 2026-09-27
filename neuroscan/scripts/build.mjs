// Builds two targets from the same sources:
//   dist/web/          → deployable site served by the Cloudflare Worker (hashed assets, SW, push, sync)
//   dist/standalone/   → one self-contained HTML file that works from file:// (local progress only)
//   dist/artifact/     → the standalone app as a claude.ai Artifact page (host supplies the document and CSP)
//   dist/neuroscan-scorm.zip → SCORM 1.2 package for Moodle and other LMSs (progress and grade in the LMS)
// Usage: node scripts/build.mjs [--target=web|standalone|artifact|scorm|all]
// NEUROSCAN_STANDALONE_API=https://… enables cloud sync in the standalone file (the Worker must allow its origin).
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import * as esbuild from "esbuild";
import { unusedMedia, validateContent } from "../src/core/content.js";
import { scormManifest } from "./scorm-manifest.mjs";
import { createZip } from "./zip.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DIST = path.join(ROOT, "dist");
const read = (file) => fs.readFileSync(path.join(ROOT, file));
const readJSON = (file) => JSON.parse(read(file));
const hash = (data, length = 10) => crypto.createHash("sha256").update(data).digest("hex").slice(0, length);
const sha256b64 = (text) => crypto.createHash("sha256").update(text, "utf8").digest("base64");
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

const target = process.argv.find((a) => a.startsWith("--target="))?.split("=")[1] ?? "all";
const version = readJSON("package.json").version;

const content = { modules: readJSON("content/modules.json"), challenges: readJSON("content/challenges.json"), media: readJSON("content/media.json") };
const errors = validateContent(content);
if (errors.length) {
  console.error(`Contenido inválido (${errors.length} problemas):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
const unused = unusedMedia(content);
if (unused.length) console.warn(`Aviso: imágenes sin usar (no se incluyen en el build): ${unused.join(", ")}`);
const usedMedia = Object.keys(content.media).filter((key) => !unused.includes(key));

const mediaPlugin = (urls) => ({
  name: "media-urls",
  setup(build) {
    build.onResolve({ filter: /^virtual:media-urls$/ }, (args) => ({ path: args.path, namespace: "media-urls" }));
    build.onLoad({ filter: /.*/, namespace: "media-urls" }, () => ({ contents: `export default ${JSON.stringify(urls)};`, loader: "js" }));
  },
});

const defines = (buildTarget, apiBase) => ({
  __BUILD_TARGET__: JSON.stringify(buildTarget),
  __API_BASE__: JSON.stringify(apiBase),
  __APP_VERSION__: JSON.stringify(version),
});

function fillTemplate(template, parts) {
  let html = template;
  for (const [marker, value] of Object.entries(parts)) {
    if (!html.includes(`<!--${marker}-->`)) throw new Error(`Falta el marcador <!--${marker}--> en la plantilla`);
    html = html.replace(`<!--${marker}-->`, () => value);
  }
  return html;
}

const WEB_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'self'",
  "object-src 'none'",
].join("; ");

async function buildWeb() {
  const out = path.join(DIST, "web");
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(path.join(out, "media"), { recursive: true });
  fs.mkdirSync(path.join(out, "icons"), { recursive: true });

  const mediaUrls = {};
  for (const key of usedMedia) {
    const data = read(path.join("content/media", content.media[key].file));
    const name = `media/${key}.${hash(data, 8)}.webp`;
    fs.writeFileSync(path.join(out, name), data);
    mediaUrls[key] = name;
  }

  const result = await esbuild.build({
    absWorkingDir: ROOT,
    entryPoints: { app: "src/main.js", styles: "src/styles.css", admin: "src/admin/admin.js", "admin-styles": "src/admin/admin.css" },
    bundle: true,
    format: "esm",
    minify: true,
    sourcemap: "linked",
    target: ["es2020", "safari15"],
    outdir: out,
    entryNames: "assets/[name]-[hash]",
    define: defines("web", "/api/v1"),
    plugins: [mediaPlugin(mediaUrls)],
    metafile: true,
    logLevel: "warning",
  });
  const outputFor = (entry) => {
    const [file] = Object.entries(result.metafile.outputs).find(([, meta]) => meta.entryPoint === entry);
    return path.relative(out, path.join(ROOT, file)).split(path.sep).join("/");
  };
  const appJs = outputFor("src/main.js");
  const appCss = outputFor("src/styles.css");
  const adminJs = outputFor("src/admin/admin.js");
  const adminCss = outputFor("src/admin/admin.css");

  const head = [
    '<link rel="manifest" href="manifest.webmanifest">',
    '<link rel="icon" href="icons/icon.svg" type="image/svg+xml">',
    '<link rel="apple-touch-icon" href="icons/icon-192.png">',
  ].join("\n");
  fs.writeFileSync(
    path.join(out, "index.html"),
    fillTemplate(read("src/index.html").toString(), {
      HEAD: head,
      STYLES: `<link rel="stylesheet" href="${appCss}">`,
      SCRIPTS: `<script type="module" src="${appJs}"></script>`,
    }),
  );
  fs.writeFileSync(
    path.join(out, "admin.html"),
    fillTemplate(read("src/admin/admin.html").toString(), {
      STYLES: `<link rel="stylesheet" href="${adminCss}">`,
      SCRIPTS: `<script type="module" src="${adminJs}"></script>`,
    }),
  );
  for (const icon of ["icon.svg", "icon-192.png", "icon-512.png"]) fs.copyFileSync(path.join(ROOT, "src/icons", icon), path.join(out, "icons", icon));
  fs.copyFileSync(path.join(ROOT, "src/manifest.webmanifest"), path.join(out, "manifest.webmanifest"));

  const shell = ["./", appJs, appCss, "manifest.webmanifest", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png"];
  const mediaFiles = Object.values(mediaUrls);
  await esbuild.build({
    absWorkingDir: ROOT,
    entryPoints: ["src/sw.js"],
    bundle: true,
    minify: true,
    format: "iife",
    target: ["es2020"],
    outfile: path.join(out, "sw.js"),
    define: {
      __SHELL_FILES__: JSON.stringify(shell),
      __MEDIA_FILES__: JSON.stringify(mediaFiles),
      __CACHE_VERSION__: JSON.stringify(hash(shell.join("|"))),
    },
    logLevel: "warning",
  });

  fs.writeFileSync(
    path.join(out, "_headers"),
    `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Content-Security-Policy: ${WEB_CSP}
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/media/*
  Cache-Control: public, max-age=31536000, immutable
/sw.js
  Cache-Control: no-cache
/
  Cache-Control: no-cache
/index.html
  Cache-Control: no-cache
/admin.html
  Cache-Control: no-store
  X-Robots-Tag: noindex
`,
  );

  const size = (file) => fs.statSync(path.join(out, file)).size;
  const mediaBytes = mediaFiles.reduce((sum, file) => sum + size(file), 0);
  console.log(`web → dist/web  (JS ${kb(size(appJs))}, CSS ${kb(size(appCss))}, ${mediaFiles.length} imágenes ${kb(mediaBytes)} bajo demanda)`);
}

async function inlineBundle(buildTarget, apiBase) {
  const mediaUrls = {};
  for (const key of usedMedia) {
    mediaUrls[key] = `data:image/webp;base64,${read(path.join("content/media", content.media[key].file)).toString("base64")}`;
  }
  const js = await esbuild.build({
    absWorkingDir: ROOT,
    entryPoints: ["src/main.js"],
    bundle: true,
    format: "iife",
    minify: true,
    target: ["es2020", "safari15"],
    write: false,
    define: defines(buildTarget, apiBase),
    plugins: [mediaPlugin(mediaUrls)],
    logLevel: "warning",
  });
  const css = await esbuild.build({ absWorkingDir: ROOT, entryPoints: ["src/styles.css"], bundle: true, minify: true, write: false, logLevel: "warning" });
  const script = js.outputFiles[0].text.trim();
  const style = css.outputFiles[0].text.trim();
  if (/<\/script/i.test(script) || /<\/style/i.test(style)) throw new Error("El bundle contiene una etiqueta de cierre que rompería el HTML en línea");
  return { script, style };
}

async function buildStandalone() {
  const out = path.join(DIST, "standalone");
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const apiBase = process.env.NEUROSCAN_STANDALONE_API ? `${process.env.NEUROSCAN_STANDALONE_API.replace(/\/$/, "")}/api/v1` : "";
  const { script, style } = await inlineBundle("standalone", apiBase);

  // Hash-based CSP: only this exact script and stylesheet may run, no 'unsafe-inline'/'unsafe-eval'.
  const csp = [
    "default-src 'none'",
    `script-src 'sha256-${sha256b64(script)}'`,
    `style-src 'sha256-${sha256b64(style)}'`,
    "img-src data: blob:",
    `connect-src ${apiBase ? new URL(apiBase).origin : "'none'"}`,
    "base-uri 'none'",
    "form-action 'none'",
    "object-src 'none'",
  ].join("; ");
  const html = fillTemplate(read("src/index.html").toString(), {
    HEAD: `<meta http-equiv="Content-Security-Policy" content="${csp}">`,
    STYLES: `<style>${style}</style>`,
    SCRIPTS: `<script>${script}</script>`,
  });
  fs.writeFileSync(path.join(out, "neuroscan-app.html"), html);
  console.log(`standalone → dist/standalone/neuroscan-app.html (${kb(Buffer.byteLength(html))}${apiBase ? `, sincroniza con ${apiBase}` : ", solo progreso local"})`);
}

// The Artifact host wraps the page in its own document and CSP, blocks downloads and
// native dialogs, and requires at least a 16px side gutter at phone width.
async function buildArtifact() {
  const out = path.join(DIST, "artifact");
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const { script, style } = await inlineBundle("artifact", "");
  const template = read("src/index.html").toString();
  const body = /<body>([\s\S]*)<\/body>/.exec(template)[1].replace("<!--SCRIPTS-->", () => `<script>${script}</script>`);
  const gutter = "@media(max-width:680px){body{padding-inline:16px}}";
  const page = `<title>NEURO//SCAN</title>\n<style>${style}${gutter}</style>\n${body.trim()}\n`;
  fs.writeFileSync(path.join(out, "neuroscan.html"), page);
  console.log(`artifact → dist/artifact/neuroscan.html (${kb(Buffer.byteLength(page))})`);
}

// One SCO: the inlined app plus its manifest. Progress goes to cmi.suspend_data, the grade to
// cmi.core.score.raw and completion to cmi.core.lesson_status (see src/services/scorm.js).
async function buildScorm() {
  const out = path.join(DIST, "scorm");
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const { script, style } = await inlineBundle("scorm", "");
  const csp = [
    "default-src 'none'",
    `script-src 'sha256-${sha256b64(script)}'`,
    `style-src 'sha256-${sha256b64(style)}'`,
    "img-src data: blob:",
    "connect-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "object-src 'none'",
  ].join("; ");
  const html = fillTemplate(read("src/index.html").toString(), {
    HEAD: `<meta http-equiv="Content-Security-Policy" content="${csp}">`,
    STYLES: `<style>${style}</style>`,
    SCRIPTS: `<script>${script}</script>`,
  });
  const manifest = scormManifest({ identifier: "gpa-academy-neuroscan", version, title: "NEURO//SCAN · Lectura sistemática de neuroimágenes" });
  fs.writeFileSync(path.join(out, "index.html"), html);
  fs.writeFileSync(path.join(out, "imsmanifest.xml"), manifest);
  const zip = createZip([
    { name: "imsmanifest.xml", data: manifest },
    { name: "index.html", data: html },
  ]);
  fs.writeFileSync(path.join(DIST, "neuroscan-scorm.zip"), zip);
  console.log(`scorm → dist/neuroscan-scorm.zip (${kb(zip.length)}, SCORM 1.2)`);
}

if (target === "web" || target === "all") await buildWeb();
if (target === "standalone" || target === "all") await buildStandalone();
if (target === "artifact" || target === "all") await buildArtifact();
if (target === "scorm" || target === "all") await buildScorm();
