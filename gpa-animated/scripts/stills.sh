#!/usr/bin/env bash
# Capturas de validación:  ./scripts/stills.sh 01 3 6.6 12.6   (id de video, luego segundos)
cd "$(dirname "$0")/.."
ID=$1; shift; FPS=25; mkdir -p out/stills/$ID
for s in "$@"; do
  f=$(python3 -c "print(round($s*$FPS))")
  npx remotion still src/index.ts "Video$ID" "out/stills/$ID/t${s}.png" --frame="$f" --gl=swangle ${SCALE:+--scale=$SCALE} 2>&1 | grep -E "Error|error" | head -3
done
