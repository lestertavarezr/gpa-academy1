import { defineConfig } from "vite";

// base relativa: el build funciona en cualquier hosting, subcarpeta o LMS.
// `--mode demo` (npm run build:demo) genera la demo de la landing en
// dist-demo/, sin el panel docente.
export default defineConfig(({ mode }) => ({
  base: "./",
  build: {
    outDir: mode === "demo" ? "dist-demo" : "dist",
    chunkSizeWarningLimit: 1600,
    // Los SVG del personaje se sirven como archivo (el cargador de Phaser los rasteriza).
    assetsInlineLimit: (file) => (file.endsWith(".svg") ? false : undefined),
    rollupOptions: {
      input:
        mode === "demo"
          ? { main: "index.html" }
          : { main: "index.html", docente: "docente.html" },
    },
  },
}));
