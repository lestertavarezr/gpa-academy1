import { defineConfig } from "vite";

// base relativa: el build funciona en cualquier hosting, subcarpeta o LMS.
export default defineConfig({
  base: "./",
  build: { chunkSizeWarningLimit: 1600 },
});
