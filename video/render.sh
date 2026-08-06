#!/usr/bin/env bash
# Render the film and normalise it for delivery.
#
#   ./render.sh
#
# This exists because the normalise step was being retyped by hand every time,
# and a flag went missing: without an explicit -ar, loudnorm's internal
# upsampling left the output at 96 kHz AAC. ffmpeg and ffprobe decode that
# happily — every level measurement looked correct — but most players will not,
# so the delivered file was silent while every check said it had audio.
#
# Verify by playing it, not by measuring it. A measurement proves the samples
# exist, not that anything can hear them.

set -euo pipefail
cd "$(dirname "$0")"

OUT_RAW="out/walkthrough.mp4"
OUT_FINAL="out/walkthrough-final.mp4"

node check-clips.mjs

echo ""
echo "  rendering…"
npx remotion render src/index.ts Walkthrough "$OUT_RAW" --log=error

echo "  normalising to -14 LUFS…"
ffmpeg -y -loglevel error -i "$OUT_RAW" \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" \
  -c:v copy \
  -c:a aac -b:a 192k -ar 48000 -ac 2 \
  "$OUT_FINAL"

echo ""
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUT_FINAL" \
  | awk '{printf "  duration   %.1fs\n", $1}'
ffprobe -v error -select_streams a:0 \
  -show_entries stream=codec_name,sample_rate,channels -of default=nw=1:nk=1 "$OUT_FINAL" \
  | paste -sd' ' - | awk '{printf "  audio      %s %s Hz, %s ch\n", $1, $2, $3}'

RATE=$(ffprobe -v error -select_streams a:0 -show_entries stream=sample_rate -of default=nw=1:nk=1 "$OUT_FINAL")
if [ "$RATE" != "48000" ]; then
  echo "  ✗ audio is ${RATE} Hz — most players will not decode this" >&2
  exit 1
fi

# Prove the track actually carries signal rather than trusting the container.
PEAK=$(ffmpeg -hide_banner -nostats -i "$OUT_FINAL" -af volumedetect -f null - 2>&1 \
  | sed -n 's/.*max_volume: \(-\{0,1\}[0-9.]*\) dB.*/\1/p')
echo "  peak       ${PEAK} dB"
awk -v p="$PEAK" 'BEGIN { if (p < -40) { print "  ✗ track is effectively silent"; exit 1 } }'

echo "  → $OUT_FINAL"
