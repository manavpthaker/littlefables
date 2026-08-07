#!/usr/bin/env bash
# Render the four landing-page loops and the web-sized full film, then copy
# them into the app's static assets. Muted, no burned-in captions — the page's
# step copy carries the words, and the loops carry the motion.
#
#   ./render-loops.sh
#
# Output:
#   public/landing/motion/loop-step-{1..4}.mp4  (~720p, no audio, ≤~3MB)
#   public/landing/motion/loop-step-{1..4}-poster.png
#   public/landing/motion/walkthrough.mp4        (~720p, audio kept, ~15-20MB)
#   public/landing/motion/walkthrough-poster.png

set -euo pipefail
cd "$(dirname "$0")"

OUT="out/loops"
mkdir -p "$OUT"

APP_MOTION="../public/landing/motion"
mkdir -p "$APP_MOTION"

encode_loop () {
  local id=$1
  # Poster extension: photographic frames (step 3 lands on a painted scene)
  # go to JPEG so they don't dwarf the loop itself — a fresh 720p painted
  # PNG lands at ~2MB, a JPEG at q=4 lands under 200K without visible loss.
  # UI-heavy posters (chip forms, email chrome) stay PNG.
  local poster_ext=${2:-png}
  local raw="$OUT/$id.raw.mp4"
  local final="$OUT/$id.mp4"
  local poster="$OUT/$id-poster.$poster_ext"

  echo ""
  echo "→ $id"
  npx remotion render src/index.ts "$id" "$raw" --log=error

  # Strip audio entirely (-an, not just muted), H.264 CRF 23, yuv420p so
  # Safari can decode it, faststart so the browser can start playing before
  # the whole file has arrived.
  ffmpeg -y -loglevel error -i "$raw" \
    -an \
    -c:v libx264 -pix_fmt yuv420p -crf 23 -preset veryfast \
    -movflags +faststart \
    "$final"

  # Poster: a fully-resolved frame at ~55% through the clip, so we skip both
  # the cream fade-in and the fade-out and land inside the settled content.
  local dur
  dur=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$final")
  local mid
  mid=$(awk -v d="$dur" 'BEGIN { printf "%.2f", d * 0.55 }')
  if [ "$poster_ext" = "jpg" ]; then
    ffmpeg -y -loglevel error -ss "$mid" -i "$final" -frames:v 1 -q:v 4 "$poster"
  else
    ffmpeg -y -loglevel error -ss "$mid" -i "$final" -frames:v 1 "$poster"
  fi

  rm -f "$raw"

  local size
  size=$(du -h "$final" | cut -f1)
  echo "   $final  $size"
}

encode_loop LoopStep1
encode_loop LoopStep2
encode_loop LoopStep3 jpg
encode_loop LoopStep4

# Web-sized full film. The delivery cut in out/walkthrough-final.mp4 is ~30MB
# at 1080p — halve resolution and lift CRF a step to land under 20MB while
# keeping the piano and narration intact.
FILM_SRC="out/walkthrough-final.mp4"
FILM_OUT="$OUT/walkthrough.mp4"
FILM_POSTER="$OUT/walkthrough-poster.png"

if [ -f "$FILM_SRC" ]; then
  echo ""
  echo "→ web-sized walkthrough"
  ffmpeg -y -loglevel error -i "$FILM_SRC" \
    -vf "scale=-2:720" \
    -c:v libx264 -pix_fmt yuv420p -crf 26 -preset veryfast \
    -c:a aac -b:a 128k -ar 48000 -ac 2 \
    -movflags +faststart \
    "$FILM_OUT"

  # Poster: the Rosa-and-Grandma-June spread is inside the reading beat
  # (payoff, 66-90s). 75s lands on a settled painted page one, before the
  # first turn — a warmly-lit spread, not a mid-turn blur.
  ffmpeg -y -loglevel error -ss 75 -i "$FILM_OUT" -frames:v 1 "$FILM_POSTER"

  echo "   $FILM_OUT  $(du -h "$FILM_OUT" | cut -f1)"
else
  echo ""
  echo "  ! $FILM_SRC missing — run ./render.sh to build the full film first"
fi

# Publish.
echo ""
echo "→ copying to $APP_MOTION"
cp "$OUT"/LoopStep1.mp4 "$APP_MOTION/loop-step-1.mp4"
cp "$OUT"/LoopStep2.mp4 "$APP_MOTION/loop-step-2.mp4"
cp "$OUT"/LoopStep3.mp4 "$APP_MOTION/loop-step-3.mp4"
cp "$OUT"/LoopStep4.mp4 "$APP_MOTION/loop-step-4.mp4"
cp "$OUT"/LoopStep1-poster.png "$APP_MOTION/loop-step-1-poster.png"
cp "$OUT"/LoopStep2-poster.png "$APP_MOTION/loop-step-2-poster.png"
cp "$OUT"/LoopStep3-poster.jpg "$APP_MOTION/loop-step-3-poster.jpg"
cp "$OUT"/LoopStep4-poster.png "$APP_MOTION/loop-step-4-poster.png"
if [ -f "$FILM_OUT" ]; then
  cp "$FILM_OUT" "$APP_MOTION/walkthrough.mp4"
  cp "$FILM_POSTER" "$APP_MOTION/walkthrough-poster.png"
fi

echo ""
echo "done."
ls -lh "$APP_MOTION"
