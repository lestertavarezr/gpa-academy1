import { defineConfig } from "vite";

// base relativa: el build funciona en cualquier hosting, subcarpeta o LMS.
export default defineConfig({
  base: "./",
  build: {
    chunkSizeWarningLimit: 1600,
    // Los SVG del personaje se sirven como archivo (el cargador de Phaser los rasteriza).
    assetsInlineLimit: (file) => (file.endsWith(".svg") ? false : undefined),
  },
});
