import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// Modos de build:
//   (por defecto)  juego completo en dist/, con el panel docente
//   demo           demo de la landing en dist-demo/ (carpeta con archivos)
//   demo-single    la misma demo en UN solo archivo HTML (dist-demo-single/),
//                  con todo incrustado, para subirla a la landing tal cual
export default defineConfig(({ mode }) => {
  const single = mode === "demo-single";
  return {
    base: "./",
    publicDir: single ? false : "public",
    plugins: single
      ? [
          viteSingleFile(),
          {
            // Sin manifiesto ni iconos externos: el archivo va solo.
            name: "gpa-demo-single-head",
            transformIndexHtml: (html) =>
              html.replace(
                /\s*<link rel="(manifest|icon|apple-touch-icon)"[^>]*>/g,
                "",
              ),
          },
        ]
      : [],
    build: {
      outDir: single ? "dist-demo-single" : mode === "demo" ? "dist-demo" : "dist",
      chunkSizeWarningLimit: 1600,
      // Los SVG del personaje se sirven como archivo (el cargador de Phaser los
      // rasteriza), salvo en el archivo único, donde todo va incrustado.
      assetsInlineLimit: single
        ? () => true
        : (file) => (file.endsWith(".svg") ? false : undefined),
      rollupOptions: {
        input:
          mode === "default" || mode === "production"
            ? { main: "index.html", docente: "docente.html" }
            : { main: "index.html" },
      },
    },
  };
});
