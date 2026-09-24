// Genera paquetes SCORM 1.2 a partir de dist/ (ejecutar después de vite build):
//   release/scorm/Guardia-de-Quirofano-SCORM-completo.zip  (20 misiones)
//   release/scorm/Guardia-de-Quirofano-SCORM-modulo-N.zip  (4 misiones del módulo N)
// El panel docente no se incluye: es para el profesorado, no para la LMS.

import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, relative } from "node:path";

const PASSING = Number(process.env.VITE_PASSING_SCORE) || 70;
const MODULES = [
  "Asepsia y antisepsia",
  "Heridas y suturas",
  "Equipamiento y tecnología",
  "Instrumental por especialidad",
  "Repaso integrador",
];
const EXCLUDE = new Set(["docente.html"]);

function listFiles(dir, root = dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? listFiles(path, root) : [relative(root, path)];
  });
}
const xml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

function manifest({ id, title, parameters, files }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${id}" version="1.2"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="GPA_ORG">
    <organization identifier="GPA_ORG">
      <title>${xml(title)}</title>
      <item identifier="GPA_ITEM" identifierref="GPA_RES" isvisible="true"${parameters ? ` parameters="${xml(parameters)}"` : ""}>
        <title>${xml(title)}</title>
        <adlcp:masteryscore>${PASSING}</adlcp:masteryscore>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="GPA_RES" type="webcontent" adlcp:scormtype="sco" href="index.html">
${files.map((f) => `      <file href="${xml(f.split("\\").join("/"))}"/>`).join("\n")}
    </resource>
  </resources>
</manifest>
`;
}

const out = "release/scorm";
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const files = listFiles("dist").filter((f) => !EXCLUDE.has(f) && !/docente/.test(f));

const packages = [
  { slug: "completo", id: "GPA_GUARDIA_QX", title: "Guardia de Quirófano · Curso completo", parameters: "" },
  ...MODULES.map((name, i) => ({
    slug: `modulo-${i + 1}`,
    id: `GPA_GUARDIA_QX_M${i + 1}`,
    title: `Guardia de Quirófano · Módulo ${i + 1}: ${name}`,
    parameters: `?modulo=${i + 1}`,
    module: i + 1,
  })),
];

for (const p of packages) {
  const dir = join(out, p.slug);
  mkdirSync(dir, { recursive: true });
  for (const f of files) cpSync(join("dist", f), join(dir, f), { recursive: true });
  // El módulo queda grabado en el propio paquete, sin depender de que la LMS
  // respete el parámetro de lanzamiento.
  if (p.module) {
    const index = join(dir, "index.html");
    const html = readFileSync(index, "utf8").replace(
      "<head>",
      `<head>\n    <script>window.GPA_MODULE = ${p.module};</script>`,
    );
    writeFileSync(index, html);
  }
  writeFileSync(join(dir, "imsmanifest.xml"), manifest({ ...p, files }));
  const zip = `Guardia-de-Quirofano-SCORM-${p.slug}.zip`;
  execFileSync("zip", ["-qr", `../${zip}`, "."], { cwd: dir });
  rmSync(dir, { recursive: true });
  console.log(`Creado ${join(out, zip)}`);
}
