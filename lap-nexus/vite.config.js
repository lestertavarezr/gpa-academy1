import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// JS y CSS van incrustados en dist/index.html; las fotos quedan en dist/images/ con rutas
// relativas. Así el juego se abre con doble clic (file://) sin servidor ni conexión.
export default defineConfig({
  base: './',
  plugins: [viteSingleFile({ useRecommendedBuildConfig: true, removeViteModuleLoader: true })],
  build: { assetsInlineLimit: 0 },
});
