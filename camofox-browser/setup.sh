#!/bin/bash
# Script de instalación de camofox-browser (navegador stealth para agentes de IA)
# Repo: https://github.com/jo-inc/camofox-browser
# Paquete npm: @askjo/camofox-browser
# Uso previsto: automatización/scraping de sitios propios de GPA Academy.
# Ejecutar: bash setup.sh

set -e

echo "==> Verificando Node.js/npm..."
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm no está instalado. Instala Node.js primero: https://nodejs.org/"
    exit 1
fi
echo "==> npm detectado: $(npm --version)"

echo ""
echo "==> Instalando @askjo/camofox-browser..."
npm install @askjo/camofox-browser

echo ""
echo "✓ Instalado. Para iniciar el servidor (puerto 9377 por defecto):"
echo "    npx @askjo/camofox-browser"
echo ""
echo "  Documentación interactiva una vez iniciado: http://localhost:9377/docs"
echo "  Esquema OpenAPI: http://localhost:9377/openapi.json"
