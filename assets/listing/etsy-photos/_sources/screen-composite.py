#!/usr/bin/env python3
"""
Composite a UI screenshot into a device photo with correct perspective.

The mockups read as fake because the screen graphic is pasted flat onto a device
that is tilted in 3D. This finds the blank screen quad in the plate and warps the
UI into it, then adds the light spill a real emitting screen would throw.

    python screen-composite.py plate.png ui.png out.png
    python screen-composite.py plate.png ui.png out.png --dark   # night mode

Requires: opencv-python-headless, numpy
"""
import sys, argparse
import numpy as np
import cv2


def find_screen_quad(plate, dark=False):
    """Locate the blank screen in the plate. Returns corners tl,tr,br,bl."""
    hsv = cv2.cvtColor(plate, cv2.COLOR_BGR2HSV)
    if dark:
        # dim warm rectangle against a very dark room
        mask = ((hsv[:, :, 2] > 70) & (hsv[:, :, 2] < 210) & (hsv[:, :, 1] < 90))
    else:
        mask = ((hsv[:, :, 2] > 200) & (hsv[:, :, 1] < 60))
    mask = (mask.astype(np.uint8)) * 255
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))

    cnts, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not cnts:
        raise SystemExit("No screen found. Check the plate, or pass --dark.")
    c = max(cnts, key=cv2.contourArea)

    hull = cv2.convexHull(c)
    pts = None
    for eps in np.arange(0.005, 0.08, 0.002):
        ap = cv2.approxPolyDP(hull, eps * cv2.arcLength(hull, True), True)
        if len(ap) == 4:
            pts = ap.reshape(4, 2).astype(np.float32)
            break
    if pts is None:                       # fall back to min-area rect
        pts = cv2.boxPoints(cv2.minAreaRect(c)).astype(np.float32)

    s = pts.sum(1)
    d = pts[:, 0] - pts[:, 1]
    return np.array([pts[np.argmin(s)],    # tl
                     pts[np.argmax(d)],    # tr
                     pts[np.argmax(s)],    # br
                     pts[np.argmin(d)]],   # bl
                    dtype=np.float32)


def composite(plate, ui, quad, dark=False):
    ph, pw = plate.shape[:2]
    uh, uw = ui.shape[:2]
    src = np.array([[0, 0], [uw, 0], [uw, uh], [0, uh]], dtype=np.float32)
    M = cv2.getPerspectiveTransform(src, quad)

    warp = cv2.warpPerspective(ui, M, (pw, ph), flags=cv2.INTER_LANCZOS4)
    mask = cv2.warpPerspective(np.full((uh, uw), 255, np.uint8), M, (pw, ph),
                               flags=cv2.INTER_LINEAR)
    a = cv2.GaussianBlur(mask, (3, 3), 0).astype(np.float32)[..., None] / 255.0

    wf = warp.astype(np.float32)
    if dark:
        wf *= 0.80                        # a night screen is dim, not bright
        spill_strength, sigma = 0.30, 70
    else:
        wf[..., 0] *= 0.95                # pull blue — match tungsten rooms
        wf[..., 2] *= 1.04
        wf = np.clip(wf * 1.06, 0, 255)   # lift so it reads as emitting
        spill_strength, sigma = 0.20, 55

    out = plate.astype(np.float32) * (1 - a) + wf * a
    spill = cv2.GaussianBlur(a[..., 0], (0, 0), sigma)[..., None]
    glow = cv2.GaussianBlur(wf * a, (0, 0), sigma)
    return np.clip(out + glow * spill * spill_strength, 0, 255).astype(np.uint8)


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("plate"); p.add_argument("ui"); p.add_argument("out")
    p.add_argument("--dark", action="store_true",
                   help="night-mode plate: dim screen, wider softer spill")
    a = p.parse_args()

    plate = cv2.imread(a.plate)
    ui = cv2.imread(a.ui)
    if plate is None or ui is None:
        raise SystemExit("Could not read plate or ui image.")

    quad = find_screen_quad(plate, a.dark)
    print("screen quad tl,tr,br,bl:\n", quad.astype(int))

    w = (np.linalg.norm(quad[1] - quad[0]) + np.linalg.norm(quad[2] - quad[3])) / 2
    h = (np.linalg.norm(quad[3] - quad[0]) + np.linalg.norm(quad[2] - quad[1])) / 2
    print(f"screen aspect ~{w/h:.3f} — render the UI at this ratio "
          f"so nothing stretches")

    cv2.imwrite(a.out, composite(plate, ui, quad, a.dark))
    print("wrote", a.out)
