#!/usr/bin/env bash
# Turn a generated piano track into a music bed.
#
#   ./prep-audio.sh ~/Downloads/"Warm Melancholy Piano (Take 2).mp3" [START_SECONDS]
#
# Generated tracks tend to drift louder as they go — a build that reads as
# "expressive" on its own will fight narration once it is under a film. This
# trims to the flattest stretch, levels the dynamics, and fades the ends.
#
# Use analyse-audio.mjs first to find where a track sits flattest.

set -euo pipefail
cd "$(dirname "$0")"

SRC="${1:?usage: ./prep-audio.sh <track.mp3> [start-seconds]}"
START="${2:-50}"
LEN=95          # film is 90s; the tail needs somewhere to fade
OUT="public/audio/bed.mp3"

mkdir -p public/audio

ffmpeg -y -loglevel error \
  -ss "$START" -t "$LEN" -i "$SRC" \
  -af "dynaudnorm=f=250:g=15:p=0.6,loudnorm=I=-23:LRA=4:TP=-3,afade=t=in:st=0:d=2,afade=t=out:st=$((LEN - 5)):d=5" \
  -c:a libmp3lame -b:a 192k \
  "$OUT"

echo "  → $OUT"
echo ""
echo "  levelled result:"
node analyse-audio.mjs "$OUT" | tail -12
