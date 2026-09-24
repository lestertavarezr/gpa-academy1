import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Genera un único dist/index.html con JS, CSS, fuentes e imágenes incrustados:
// se abre con doble clic (file://) sin servidor ni conexión a Internet.
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
});
