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
echo "==> Descargando el binario del navegador Camoufox (~300MB, solo la primera vez)..."
npx camoufox-js fetch

echo ""
echo "==> Exponiendo el bin camofox-browser-mcp en el PATH (npm link)..."
(cd node_modules/@askjo/camofox-browser && npm link)

echo ""
echo "✓ Instalado."
echo ""
echo "1) Iniciar el servidor REST (déjalo corriendo en background, puerto 9377):"
echo "     npx @askjo/camofox-browser"
echo "     Docs interactivas: http://localhost:9377/docs"
echo "     Salud del servidor: http://localhost:9377/health"
echo ""
echo "2) Registrar el MCP server en Claude Code (una sola vez):"
echo "     claude mcp add camofox-browser -s user -- camofox-browser-mcp"
echo "   Verificar: claude mcp list  (o /mcp dentro de una sesión de Claude Code)"
