#!/usr/bin/env python3
"""
Render a Little Fables page spread as a flat listing image.

Built against the reader's own source, not an approximation:

  app/read/story/[id]/page-spread.tsx   48% / 52% columns, art full bleed,
                                        words vertically centred, max 520px,
                                        controls under the words only
  app/globals.css  .lf-gutter           88px crease, bright page edge at dead
                                        centre, fold darkening BOTH leaves
  design-system/tokens/colors.css       --paper #EDE3CE  --ink #2A1D12
  design-system/tokens/bedtime.css      --paper #1F1A14  --ink #F0E5CD
  design-system/tokens/typography.css   IM Fell English, 30px / 1.55

Night mode has no illustration at all — that is the design, not an omission.

    python make-spread.py --illo art.png --out 03.png \
        --title "The Lantern of Round Pond" --child Rosa \
        --text "Rosa was not a patient girl, and she knew it."

    python make-spread.py --night --out 07.png --title "..." --child Arjun \
        --text "..."                      # no --illo needed

Requires: pillow. Fonts: IMFell-Regular.ttf / IMFell-Italic.ttf beside this file.
"""
import argparse, os, textwrap
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))

# --- tokens, lifted verbatim -------------------------------------------------
PAPER      = (0xED, 0xE3, 0xCE)   # --paper
PAPER_WARM = (0xF3, 0xEB, 0xD8)   # --paper-warm
PAPER_DEEP = (0xD9, 0xC7, 0xA2)   # --paper-deep — the field the page sits on
INK        = (0x2A, 0x1D, 0x12)   # --ink
INK_SOFT   = (0x57, 0x43, 0x2E)   # --ink-soft
INK_FAINT  = (0x8A, 0x71, 0x56)   # --ink-faint

N_PAPER = (0x1F, 0x1A, 0x14)      # bedtime --paper
N_INK   = (0xF0, 0xE5, 0xCD)      # bedtime --ink
N_FAINT = (0x8A, 0x71, 0x56)

READING_PX, READING_LH = 30, 1.55           # --text-reading-size / -lh
ART_COL, MEASURE_PX = 0.48, 520             # grid + article maxWidth
PAD7, PAD5 = 32, 20                         # --space-7 / --space-5
GUTTER_PX = 88
VIEWPORT_W = 1180                           # reference landscape viewport


def font(italic=False, size=40):
    f = "IMFell-Italic.ttf" if italic else "IMFell-Regular.ttf"
    return ImageFont.truetype(os.path.join(HERE, f), size)


def fill_cover(im, w, h):
    """background: url() center/cover"""
    s = max(w / im.width, h / im.height)
    im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
    return im.crop(((im.width - w) // 2, (im.height - h) // 2,
                    (im.width - w) // 2 + w, (im.height - h) // 2 + h))


def draw_gutter(page, x_center, k):
    """.lf-gutter — the crease. Bright page edge at dead centre, fold
    darkening both leaves, weighted harder on the art side."""
    W, H = page.size
    half = int(GUTTER_PX * k / 2)
    px = page.load()
    for dx in range(-half, half + 1):
        t = (dx + half) / (2 * half)                     # 0..1 across the band
        # fold: rgba(58,43,30, .12 @24% .32 @42% .46 @49-51% .24 @58% .08 @76%)
        stops = [(0.0, 0), (0.24, .12), (0.42, .32), (0.49, .46),
                 (0.51, .46), (0.58, .24), (0.76, .08), (1.0, 0)]
        a = 0.0
        for (p0, a0), (p1, a1) in zip(stops, stops[1:]):
            if p0 <= t <= p1:
                a = a0 + (a1 - a0) * ((t - p0) / (p1 - p0) if p1 > p0 else 0)
                break
        x = x_center + dx
        if not (0 <= x < W):
            continue
        # the hairline: bright leaf edge just left of centre, dark line at centre
        edge = None
        if -2 <= dx <= -1:  edge, ea = (250, 244, 230), .75
        elif dx == 0:       edge, ea = (46, 33, 22), .55
        elif 1 <= dx <= 2:  edge, ea = (46, 33, 22), .16
        for y in range(H):
            r, g, b = px[x, y][:3]
            r = int(r * (1 - a) + 58 * a); g = int(g * (1 - a) + 43 * a); b = int(b * (1 - a) + 30 * a)
            if edge:
                r = int(r * (1 - ea) + edge[0] * ea)
                g = int(g * (1 - ea) + edge[1] * ea)
                b = int(b * (1 - ea) + edge[2] * ea)
            px[x, y] = (r, g, b)


def controls(d, cx, y, title, k, faint):
    """Tree glyph · ‹ · pause · › · title — under the words, never over the art."""
    small = font(size=int(15 * k))
    ital = font(True, size=int(15 * k))
    r = int(17 * k)
    d.ellipse([cx - r, y - r, cx + r, y + r], fill=(*faint, 40) if len(faint) == 3 else faint,
              outline=None)
    bw, bh = int(4 * k), int(13 * k)
    d.rectangle([cx - int(5 * k), y - bh // 2, cx - int(5 * k) + bw, y + bh // 2], fill=faint)
    d.rectangle([cx + int(1.5 * k), y - bh // 2, cx + int(1.5 * k) + bw, y + bh // 2], fill=faint)
    d.text((cx - int(46 * k), y - int(12 * k)), "‹", font=small, fill=faint)
    d.text((cx + int(36 * k), y - int(12 * k)), "›", font=small, fill=faint)
    d.text((cx + int(62 * k), y - int(11 * k)), title, font=ital, fill=faint)


def render(out, text, title, child, illo=None, night=False, S=2400, caption=None):
    paper = N_PAPER if night else PAPER
    ink   = N_INK if night else INK
    faint = N_FAINT if night else INK_FAINT

    field = (0x16, 0x12, 0x09) if night else PAPER_DEEP   # bedtime --paper-deep
    img = Image.new("RGB", (S, S), field)

    # the spread occupies a 3:2 band across the square — an open book, filling
    # the frame rather than sitting on it. No card, no radius: the source calls
    # that out as the thing that made it read as a thumbnail.
    PW = int(S * 0.94)
    PH = int(PW / 1.62)
    ox, oy = (S - PW) // 2, int(S * 0.235)
    k = PW / VIEWPORT_W                      # scale reader px → render px

    page = Image.new("RGB", (PW, PH), paper)

    if night:
        d = ImageDraw.Draw(page)
        body = font(size=int(READING_PX * k))
        lh = int(READING_PX * READING_LH * k)
        lines = textwrap.wrap(text, 42)
        y = (PH - len(lines) * lh) // 2 - int(20 * k)
        for ln in lines:                                  # centred, max 620
            w = d.textlength(ln, font=body)
            d.text(((PW - w) / 2, y), ln, font=body, fill=ink); y += lh
        controls(d, PW // 2, PH - int(46 * k), title, k, faint)
    else:
        aw = int(PW * ART_COL)
        page.paste(fill_cover(Image.open(illo).convert("RGB"), aw, PH), (0, 0))
        d = ImageDraw.Draw(page)
        tx = aw + int(PAD7 * k)
        body = font(size=int(READING_PX * k))
        lh = int(READING_PX * READING_LH * k)
        measure = int(MEASURE_PX * k)
        avg = d.textlength("n", font=body)
        lines = textwrap.wrap(text, max(12, int(measure / (avg * 1.02))))
        y = (PH - len(lines) * lh) // 2 - int(30 * k)     # alignContent: center
        for ln in lines:
            d.text((tx, y), ln, font=body, fill=ink); y += lh
        controls(d, aw + (PW - aw) // 2, PH - int(46 * k), title, k, faint)
        draw_gutter(page, aw, k)

    img.paste(page, (ox, oy))
    # the leaf edge — enough to separate paper from the surface under it
    ImageDraw.Draw(img).rectangle([ox, oy, ox + PW, oy + PH],
                                  outline=(0xC2, 0xAF, 0x8A) if not night else (0x2A, 0x23, 0x18),
                                  width=max(1, S // 1200))

    d = ImageDraw.Draw(img)
    if caption:
        cap = font(size=int(S * 0.026))
        w = d.textlength(caption, font=cap)
        d.text(((S - w) / 2, oy + PH + int(S * 0.045)), caption, font=cap, fill=ink)
    sub = font(True, size=int(S * 0.019))
    line = f"{title}  ·  written for {child}"
    w = d.textlength(line, font=sub)
    d.text(((S - w) / 2, oy + PH + int(S * 0.045) + (int(S * 0.040) if caption else 0)),
           line, font=sub, fill=faint)
    d.text((int(S * 0.05), S - int(S * 0.07)), "Little Fables",
           font=font(size=int(S * 0.019)), fill=ink)

    img.save(out)
    return out


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--out", required=True); p.add_argument("--text", required=True)
    p.add_argument("--title", required=True); p.add_argument("--child", required=True)
    p.add_argument("--illo"); p.add_argument("--night", action="store_true")
    p.add_argument("--caption"); p.add_argument("--size", type=int, default=2400)
    a = p.parse_args()
    if not a.night and not a.illo:
        raise SystemExit("--illo is required unless --night (night has no art)")
    print("wrote", render(a.out, a.text, a.title, a.child, a.illo, a.night, a.size, a.caption))
