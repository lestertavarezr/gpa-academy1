#!/bin/bash
# Script de instalación y arranque de ngrok para GPA Academy LMS
# Ejecutar como root: bash setup.sh

set -e

echo "==> Verificando instalación de ngrok..."
if ! command -v ngrok &> /dev/null; then
    echo "==> Instalando ngrok..."
    curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc | tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
    echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | tee /etc/apt/sources.list.d/ngrok.list
    apt-get update -q && apt-get install -y ngrok
else
    echo "==> ngrok ya está instalado: $(ngrok --version)"
fi

echo ""
echo "==> Configurando ngrok..."
mkdir -p /etc/ngrok
cp "$(dirname "$0")/ngrok.yml" /etc/ngrok/ngrok.yml

echo ""
echo "IMPORTANTE: Edita /etc/ngrok/ngrok.yml y reemplaza TU_AUTHTOKEN_AQUI"
echo "Encuentra tu authtoken en: https://dashboard.ngrok.com/get-started/your-authtoken"
echo ""
read -p "¿Ya pegaste tu authtoken en el archivo? (s/n): " confirm
if [[ "$confirm" != "s" && "$confirm" != "S" ]]; then
    echo "Abre /etc/ngrok/ngrok.yml, pega el authtoken y ejecuta este script de nuevo."
    exit 1
fi

echo ""
echo "==> Instalando ngrok como servicio del sistema..."
cp "$(dirname "$0")/ngrok.service" /etc/systemd/system/ngrok.service
systemctl daemon-reload
systemctl enable ngrok
systemctl restart ngrok

echo ""
echo "==> Estado del servicio:"
systemctl status ngrok --no-pager

echo ""
echo "✓ Listo. El túnel https://gpa-academy-lms.ngrok.app debería estar activo."
echo "  Para verificar: systemctl status ngrok"
echo "  Para ver logs:  journalctl -u ngrok -f"
