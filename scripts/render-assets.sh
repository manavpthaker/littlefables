#!/usr/bin/env bash
# Render Etsy and Pinterest marketing assets from the Heritage design system.
#
#   ./scripts/render-assets.sh            # render everything
#   ./scripts/render-assets.sh pin        # only assets whose name matches "pin"
#
# Screenshots the DS outward components in headless Chrome at native design
# size x2, so the output is retina-sharp for Etsy (which upscales aggressively
# in search results) and Pinterest.
#
# Output lands in assets/listing/. Google Fonts are fetched at render time, so
# this needs network.

set -euo pipefail
cd "$(dirname "$0")/.."

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
HARNESS="file://$(pwd)/scripts/render-assets/index.html"
OUT="assets/listing"
FILTER="${1:-}"

if [ ! -x "$CHROME" ]; then
  echo "Google Chrome not found at: $CHROME" >&2
  exit 1
fi

mkdir -p "$OUT"

# name|component|width|height|scale|props-json
#
# Design sizes: EtsyHero 1350x1012, PinterestPin 1000x1500. Rendered at 2x.
# Etsy crops to square in search, so the hero keeps its subject centred.
ASSETS=(
  "etsy-hero-main|EtsyHero|2700|2025|2|{}"
  "etsy-hero-turnaround|EtsyHero|2700|2025|2|{\"headline\":\"Their face, not a template\",\"points\":[\"You approve the character before we build the book\",\"Unlimited revisions until you love it\",\"Or your money back\"]}"
  "etsy-hero-speed|EtsyHero|2700|2025|2|{\"headline\":\"No shipping, ever\",\"points\":[\"Style previews in 24 hours\",\"Finished book in 3-4 days\",\"Christmas orders through Dec 22\"]}"
  "etsy-hero-screentime|EtsyHero|2700|2025|2|{\"headline\":\"Screen time that earns its place\",\"points\":[\"No ads. No algorithm. No autoplay.\",\"Twenty quiet minutes\",\"Then it ends, on purpose\"]}"
  "etsy-hero-second-book|EtsyHero|2700|2025|2|{\"headline\":\"The second book is \$17\",\"points\":[\"We keep their profile only if you ask\",\"Same character, new story\",\"One click, half price\"]}"
  # Pinterest is parked for launch — Etsy plus the landing page is enough
  # surface. One pin kept as a working template.
  "pin-christmas|PinterestPin|2000|3000|2|{\"title\":\"A Christmas gift they'll open all year\",\"line\":\"Custom storybook - delivered in days\"}"
  "coloring-page|ColoringPage|1700|2200|4.35|{}"
  "gift-certificate|GiftCertificate|1700|2200|4.35|{}"
)

urlencode() {
  python3 -c "import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1],safe=''))" "$1"
}

count=0
for row in "${ASSETS[@]}"; do
  IFS='|' read -r name comp w h scale props <<< "$row"
  if [ -n "$FILTER" ] && [[ "$name" != *"$FILTER"* ]]; then continue; fi

  case "$comp" in
    EtsyHero|PinterestPin) sizing="scale=${scale}" ;;
    *)                     sizing="zoom=${scale}"  ;;
  esac
  url="${HARNESS}?c=${comp}&${sizing}&props=$(urlencode "$props")"

  "$CHROME" \
    --headless \
    --disable-gpu \
    --hide-scrollbars \
    --force-device-scale-factor=1 \
    --virtual-time-budget=8000 \
    --window-size="${w},${h}" \
    --screenshot="${OUT}/${name}.png" \
    "$url" 2>/dev/null

  if [ -f "${OUT}/${name}.png" ]; then
    printf "  %-26s %sx%s\n" "$name" "$w" "$h"
    count=$((count + 1))
  else
    echo "  FAILED: $name" >&2
  fi
done

echo ""
echo "$count assets → $OUT/"
