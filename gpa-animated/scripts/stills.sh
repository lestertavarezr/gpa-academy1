#!/usr/bin/env bash
# Genera capturas de validación en out/stills a los segundos indicados:  ./scripts/stills.sh 1.5 3 6.5 ...
cd "$(dirname "$0")/.."
FPS=25; mkdir -p out/stills

for s in "$@"; do
  f=$(python3 -c "print(round($s*$FPS))")
  npx remotion still src/index.ts GPAAcademy "out/stills/t${s}.png" --frame="$f" --gl=swangle ${SCALE:+--scale=$SCALE} 2>&1 | grep -E "Error|error" | head -3
done
