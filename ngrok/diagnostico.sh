#!/bin/bash
# Diagnóstico rápido del túnel ngrok
echo "=== Estado ngrok ==="
systemctl status ngrok --no-pager 2>/dev/null || echo "Servicio ngrok no instalado"

echo ""
echo "=== Proceso ngrok activo ==="
pgrep -a ngrok || echo "Ningún proceso ngrok corriendo"

echo ""
echo "=== Túneles activos (API local) ==="
curl -s http://localhost:4040/api/tunnels 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for t in data.get('tunnels', []):
        print(f\"  {t['name']}: {t['public_url']} -> {t['config']['addr']}\")
except:
    print('No se pudo conectar a la API de ngrok (puerto 4040)')
"

echo ""
echo "=== Últimos logs de ngrok ==="
journalctl -u ngrok --no-pager -n 20 2>/dev/null || echo "No hay logs de systemd para ngrok"
