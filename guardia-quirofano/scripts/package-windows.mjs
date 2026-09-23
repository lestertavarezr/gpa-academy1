// Empaqueta el build (dist/) con el lanzador de Windows en release/*.zip.
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";

const out = "release/Guardia-de-Quirofano-Windows";
rmSync("release", { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync("dist", out, { recursive: true });
cpSync("windows", out, { recursive: true });
execFileSync("zip", ["-qr", "../Guardia-de-Quirofano-Windows.zip", "."], {
  cwd: out,
});
console.log("Creado release/Guardia-de-Quirofano-Windows.zip");
