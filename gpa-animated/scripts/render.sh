#!/usr/bin/env bash
# Render final con el audio ORIGINAL copiado sin recodificar:  ./scripts/render.sh 02
cd "$(dirname "$0")/.."
ID=${1:?id de video, p.ej. 01}
mkdir -p out
npx remotion render src/index.ts "Video$ID" "out/_video_$ID.mp4" --codec=h264 --crf=16 --pixel-format=yuv420p --gl=swangle --muted
ffmpeg -v error -y -i "out/_video_$ID.mp4" -i "public/$ID/audio.m4a" -map 0:v:0 -map 1:a:0 -c copy -movflags +faststart "out/gpa-academy-animated-$ID.mp4"
rm -f "out/_video_$ID.mp4"
echo "→ out/gpa-academy-animated-$ID.mp4"
