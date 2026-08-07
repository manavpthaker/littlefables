#!/usr/bin/env bash
# Render the updated Etsy listing and About-page featured photos.

set -euo pipefail
cd "$(dirname "$0")/.."

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
HARNESS="file://$(pwd)/scripts/render-etsy-photos/index.html"
OUT="assets/listing/etsy-photos"

if [ ! -x "$CHROME" ]; then
  echo "Google Chrome not found at: $CHROME" >&2
  exit 1
fi

mkdir -p "$OUT"

render() {
  local key="$1"
  local file="$2"
  local width="${3:-2700}"
  local height="${4:-2025}"

  "$CHROME" \
    --headless \
    --disable-gpu \
    --hide-scrollbars \
    --allow-file-access-from-files \
    --force-device-scale-factor=1 \
    --virtual-time-budget=8000 \
    --window-size="${width},${height}" \
    --screenshot="${OUT}/${file}" \
    "${HARNESS}?photo=${key}" 2>/dev/null

  printf "  %-36s %sx%s\n" "$file" "$width" "$height"
}

render "01" "01A-thumbnail-illustration.png"
render "01b" "01B-thumbnail-range-grid.png"
render "02" "02-four-children-four-styles.png"
render "03" "03-intake-to-character.png"
render "04" "04-reference-books-to-style.png"
render "05" "05-preview-revisions.png"
render "06" "06-reader-day-mode-device.png"
render "07" "07-home-screen-icon.png"
render "07b" "07B-phone-on-counter.png"
render "08" "08-turnaround-card.png"
render "09" "09-night-mode.png"
render "10a" "10A-gift-certificate-table.png"
render "10b" "10B-christmas-cutoff.png"
render "10c" "10C-gift-handoff.png"
render "11" "11-twenty-quiet-minutes.png"
render "extra-no-ads" "extra-no-ads-card.png"
render "featured-01" "featured-01-character-sheet.png"
render "featured-02" "featured-02-rough-to-final.png"
render "featured-03" "featured-03-coloring-page.png"
render "thumbnail-test" "00-thumbnail-test-170.png" 2900 360

echo ""
echo "20 assets -> $OUT/"
