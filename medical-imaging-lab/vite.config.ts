import { defineConfig } from "vite";
import { resolve } from "node:path";
export default defineConfig({
  root: "src",
  base: "/lab/",
  build: {
    outDir: "../dist/lab",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        app: resolve(import.meta.dirname, "src/index.html"),
        admin: resolve(import.meta.dirname, "src/admin.html"),
      },
    },
  },
});
