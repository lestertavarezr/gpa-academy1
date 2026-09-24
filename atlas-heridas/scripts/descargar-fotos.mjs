#!/usr/bin/env node

/**
 * Descarga y optimiza imágenes clínicas para ATLAS Heridas
 * Ejecutar en una máquina con acceso a internet sin restricciones
 *
 * Uso:
 *   node scripts/descargar-fotos.mjs
 *
 * Requisitos:
 *   npm install sharp
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const imagesDir = path.join(projectRoot, 'src', 'images');
const clinicalDir = path.join(imagesDir, 'clinical');

// Asegurar que existen los directorios
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
if (!fs.existsSync(clinicalDir)) fs.mkdirSync(clinicalDir, { recursive: true });

// Candidatos de imágenes a descargar
// Formato: { id, filename, url, license, author, description, notes }
const candidates = [
  // ===== APÓSITOS (Prioridad 1) =====
  {
    id: 'film',
    filename: 'film.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Transparente_Wundverband_mit_Gaze.jpg',
    downloadUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Transparente_Wundverband_mit_Gaze.jpg/1024px-Transparente_Wundverband_mit_Gaze.jpg',
    license: 'CC BY-SA 4.0',
    author: 'Enter',
    description: 'Película transparente de poliuretano adhesiva',
    notes: 'Buscar en Wikimedia Commons - similar a otros apósitos de Enter'
  },
  {
    id: 'contact',
    filename: 'contact.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Tüll_Wundauflage.JPG',
    downloadUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/T%C3%BCll_Wundauflage.JPG/1024px-T%C3%BCll_Wundauflage.JPG',
    license: 'CC BY-SA 4.0',
    author: 'Enter',
    description: 'Apósito no adherente tipo tulle de interfase de silicona',
    notes: 'Equivalente a interfase no adherente de malla'
  },
  {
    id: 'dry',
    filename: 'dry.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Gazestreifen.JPG',
    downloadUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Gazestreifen.JPG/1024px-Gazestreifen.JPG',
    license: 'CC BY-SA 4.0',
    author: 'Enter',
    description: 'Gasa simple con almohadilla absorbente (island dressing)',
    notes: 'Cobertura seca estándar para heridas limpias'
  },

  // ===== CASOS CLÍNICOS OPCIONALES (Prioridad 2) =====
  {
    id: 'caso-m1-a',
    filename: 'clinical/m1-a-sutured-cut.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Sutured_wound_linear.jpg',
    downloadUrl: null,
    license: 'CC BY / CC0',
    author: 'Por determinar',
    description: 'Corte lineal suturado, bordes aproximados, rosado',
    notes: 'PENDIENTE: Búsqueda en Wikimedia por "sutured wound linear" + licencia CC'
  },
  {
    id: 'caso-m2-a',
    filename: 'clinical/m2-a-pressure-ulcer.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Pressure_ulcer_stage2.jpg',
    downloadUrl: null,
    license: 'CC BY / CC BY-SA',
    author: 'Por determinar',
    description: 'Lesión por presión categoría 2, talón, dermis expuesta',
    notes: 'PENDIENTE: Open-i o Wikimedia con "pressure ulcer stage 2" sin cara/identifying marks'
  },
  {
    id: 'caso-m3-a',
    filename: 'clinical/m3-a-clean-cut.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Clean_wound_hand.jpg',
    downloadUrl: null,
    license: 'CC BY / CC0',
    author: 'Por determinar',
    description: 'Corte limpio reciente, mano, exudado bajo',
    notes: 'PENDIENTE: Búsqueda en Wikimedia o Open-i'
  },
  {
    id: 'caso-m4-c',
    filename: 'clinical/m4-c-venous-ulcer.jpg',
    url: 'https://commons.wikimedia.org/wiki/File:Venous_ulcer_ankle.jpg',
    downloadUrl: null,
    license: 'CC BY / CC BY-SA',
    author: 'Por determinar',
    description: 'Úlcera venosa, maléolo medial, granulación, exudado abundante',
    notes: 'DIFÍCIL: Privacidad - sin extremidad inferior completa identificable'
  },
];

/**
 * Descarga un archivo desde una URL
 */
async function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} para ${url}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {}); // Eliminar archivo parcial
      reject(err);
    });
  });
}

/**
 * Optimiza una imagen JPEG
 */
async function optimizeImage(inputPath, outputPath, maxWidth = 640, quality = 75) {
  try {
    const metadata = await sharp(inputPath).metadata();
    const width = Math.min(metadata.width || 640, maxWidth);

    await sharp(inputPath)
      .resize(width, null, { withoutEnlargement: true })
      .jpeg({ quality, progressive: true })
      .toFile(outputPath);

    const stats = fs.statSync(outputPath);
    console.log(`✓ ${path.basename(outputPath)}: ${(stats.size / 1024).toFixed(1)} KB`);
    return stats.size;
  } catch (err) {
    console.error(`✗ Error al optimizar ${inputPath}:`, err.message);
    throw err;
  }
}

/**
 * Descarga y procesa un candidato
 */
async function processCandidateImage(candidate) {
  const { id, filename, url, downloadUrl, license, author, description, notes } = candidate;
  const outputPath = path.join(imagesDir, filename);

  console.log(`\n📷 ${id}: ${description}`);
  console.log(`   Licencia: ${license} · Autor: ${author}`);

  if (!downloadUrl) {
    console.log(`   ⚠️  PENDIENTE: ${notes}`);
    console.log(`   Buscar en: ${url}`);
    return { id, status: 'pending', notes };
  }

  try {
    console.log(`   Descargando desde: ${downloadUrl}`);
    const tempPath = outputPath + '.tmp';
    await downloadFile(downloadUrl, tempPath);

    console.log(`   Optimizando...`);
    await optimizeImage(tempPath, outputPath, 640, 75);

    fs.unlinkSync(tempPath);
    console.log(`   ✅ Guardado: ${filename}`);

    return { id, status: 'downloaded', path: filename, size: fs.statSync(outputPath).size };
  } catch (err) {
    console.error(`   ❌ Error: ${err.message}`);
    return { id, status: 'error', error: err.message };
  }
}

/**
 * Main
 */
async function main() {
  console.log('🔽 Descargador de imágenes para ATLAS Heridas');
  console.log(`   Destino: ${imagesDir}\n`);

  const results = [];

  for (const candidate of candidates) {
    const result = await processCandidateImage(candidate);
    results.push(result);
  }

  // Resumen
  console.log('\n📊 RESUMEN:');
  const downloaded = results.filter(r => r.status === 'downloaded');
  const pending = results.filter(r => r.status === 'pending');
  const errors = results.filter(r => r.status === 'error');

  console.log(`   ✅ Descargadas: ${downloaded.length}`);
  console.log(`   ⏳ Pendientes: ${pending.length}`);
  console.log(`   ❌ Errores: ${errors.length}`);

  if (pending.length > 0) {
    console.log(`\n⚠️  PENDIENTES - Requieren búsqueda manual:`);
    pending.forEach(p => console.log(`   - ${p.id}: ${p.notes}`));
  }

  // Guardar reporte
  const report = { timestamp: new Date().toISOString(), results, candidates };
  fs.writeFileSync(path.join(projectRoot, 'descarga-fotos-reporte.json'), JSON.stringify(report, null, 2));
  console.log(`\n📄 Reporte guardado: descarga-fotos-reporte.json`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
