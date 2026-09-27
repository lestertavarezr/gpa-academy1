// Validates content/*.json; exits non-zero so CI blocks a broken question bank.
import fs from "node:fs";
import { unusedMedia, validateContent } from "../src/core/content.js";

const read = (file) => JSON.parse(fs.readFileSync(new URL(`../content/${file}`, import.meta.url)));
const content = { modules: read("modules.json"), challenges: read("challenges.json"), media: read("media.json") };
const errors = validateContent(content);
for (const [key, m] of Object.entries(content.media)) {
  if (!fs.existsSync(new URL(`../content/media/${m.file}`, import.meta.url))) errors.push(`media "${key}": falta el archivo content/media/${m.file}`);
}
if (errors.length) {
  console.error(`✗ ${errors.length} problemas en el contenido:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
const unused = unusedMedia(content);
console.log(`✓ ${content.challenges.length} desafíos en ${content.modules.length} módulos, ${Object.keys(content.media).length} imágenes.`);
if (unused.length) console.log(`  Aviso: imágenes sin usar: ${unused.join(", ")}`);
