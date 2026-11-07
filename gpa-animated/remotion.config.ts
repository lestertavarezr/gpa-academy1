import {Config} from '@remotion/cli/config';
import fs from 'node:fs';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
// WebGL por software (necesario para el halo 3D en entornos sin GPU)
Config.setChromiumOpenGlRenderer('swangle');
Config.setConcurrency(4);

// Usa un navegador local si existe (entornos sin acceso a la descarga de Chrome).
const candidates = [
  process.env.REMOTION_BROWSER,
  '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
].filter(Boolean) as string[];
const local = candidates.find((p) => fs.existsSync(p));
if (local) Config.setBrowserExecutable(local);
