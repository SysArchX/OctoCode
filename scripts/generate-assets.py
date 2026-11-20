"""Generate OctoCode PNG assets (mascot, icons) without native image libraries."""

import math
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PURPLE_DARK = (67, 24, 140)
PURPLE = (91, 33, 182)
PURPLE_LIGHT = (124, 58, 237)
LAVENDER = (245, 243, 255)


class Canvas:
    def __init__(self, width, height, background=None):
        self.w = width
        self.h = height
        self.px = bytearray(width * height * 4)
        if background is not None:
            r, g, b = background
            for i in range(width * height):
                self.px[i * 4 : i * 4 + 4] = bytes((r, g, b, 255))

    def blend(self, x, y, r, g, b, a):
        if a <= 0 or x < 0 or y < 0 or x >= self.w or y >= self.h:
            return
        if a > 1:
            a = 1
        i = (y * self.w + x) * 4
        dr, dg, db, da = self.px[i], self.px[i + 1], self.px[i + 2], self.px[i + 3]
        sr, sg, sb = r / 255.0, g / 255.0, b / 255.0
        dst_a = da / 255.0
        out_a = a + dst_a * (1 - a)
        if out_a <= 0:
            return
        orr = (sr * a + (dr / 255.0) * dst_a * (1 - a)) / out_a
        ogg = (sg * a + (dg / 255.0) * dst_a * (1 - a)) / out_a
        obb = (sb * a + (db / 255.0) * dst_a * (1 - a)) / out_a
        self.px[i] = int(orr * 255 + 0.5)
        self.px[i + 1] = int(ogg * 255 + 0.5)
        self.px[i + 2] = int(obb * 255 + 0.5)
        self.px[i + 3] = int(out_a * 255 + 0.5)

    def fill(self, sd, color, bbox, color_fn=None, alpha=1.0):
        x0, y0, x1, y1 = bbox
        x0 = max(0, int(math.floor(x0)))
        y0 = max(0, int(math.floor(y0)))
        x1 = min(self.w - 1, int(math.ceil(x1)))
        y1 = min(self.h - 1, int(math.ceil(y1)))
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                d = sd(x + 0.5, y + 0.5)
                if d >= 1:
                    continue
                a = (0.5 - d) if d > -0.5 else 1.0
                if a <= 0:
                    continue
                r, g, b = color_fn(x, y) if color_fn else color
                self.blend(x, y, r, g, b, a * alpha)

    def write_png(self, path):
        raw = bytearray()
        for y in range(self.h):
            raw.append(0)
            raw.extend(self.px[y * self.w * 4 : (y + 1) * self.w * 4])

        def chunk(tag, data):
            return (
                struct.pack(">I", len(data))
                + tag
                + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
            )

        png = b"\x89PNG\r\n\x1a\n"
        png += chunk(b"IHDR", struct.pack(">IIBBBBB", self.w, self.h, 8, 6, 0, 0, 0))
        png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        png += chunk(b"IEND", b"")
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        Path(path).write_bytes(png)


def ellipse_sd(cx, cy, rx, ry):
    def sd(x, y):
        nx = (x - cx) / rx
        ny = (y - cy) / ry
        return (math.hypot(nx, ny) - 1.0) * min(rx, ry)

    return sd


def round_rect_sd(cx, cy, hw, hh, r, rotation=0.0):
    cos_a = math.cos(math.radians(-rotation))
    sin_a = math.sin(math.radians(-rotation))

    def sd(x, y):
        dx = x - cx
        dy = y - cy
        lx = dx * cos_a - dy * sin_a
        ly = dx * sin_a + dy * cos_a
        qx = abs(lx) - (hw - r)
        qy = abs(ly) - (hh - r)
        outside = math.hypot(max(qx, 0), max(qy, 0))
        inside = min(max(qx, qy), 0)
        return outside + inside - r

    return sd


def bbox_for(cx, cy, hw, hh, pad=2):
    return (cx - hw - pad, cy - hh - pad, cx + hw + pad, cy + hh + pad)


def lerp(a, b, t):
    t = max(0.0, min(1.0, t))
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def capsule(canvas, points, thickness, color, alpha=1.0):
    radius = thickness / 2.0
    dense = []
    for index in range(len(points) - 1):
        x0, y0 = points[index]
        x1, y1 = points[index + 1]
        steps = max(1, int(math.hypot(x1 - x0, y1 - y0) / max(1.0, radius * 0.4)))
        for step in range(steps + 1):
            t = step / steps
            dense.append((x0 + (x1 - x0) * t, y0 + (y1 - y0) * t))
    if len(points) == 1:
        dense = points
    for px, py in dense:
        sd = ellipse_sd(px, py, radius, radius)
        canvas.fill(sd, color, bbox_for(px, py, radius, radius), alpha=alpha)


def quad_points(p0, p1, p2, steps=26):
    pts = []
    for i in range(steps + 1):
        t = i / steps
        x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0]
        y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1]
        pts.append((x, y))
    return pts


def star(canvas, cx, cy, size, color, alpha=1.0):
    capsule(canvas, [(cx - size, cy), (cx + size, cy)], size * 0.62, color, alpha)
    capsule(canvas, [(cx, cy - size), (cx, cy + size)], size * 0.62, color, alpha)


def draw_octopus(canvas, cx, cy, scale, mood, shadow=True):
    def p(dx, dy):
        return (cx + (dx - 256) * scale, cy + (dy - 256) * scale)

    def s(value):
        return value * scale

    if shadow:
        canvas.fill(
            ellipse_sd(*p(256, 464), s(140), s(20)),
            (91, 33, 182),
            bbox_for(*p(256, 464), s(140), s(20)),
            alpha=0.16,
        )

    for leg_x, rotation in ((148, -9), (216, 0), (284, 0), (352, 9)):
        leg_center = p(leg_x, 372)
        canvas.fill(
            round_rect_sd(*leg_center, s(34), s(88), s(34), rotation),
            PURPLE,
            bbox_for(*leg_center, s(82), s(100)),
        )

    head = p(256, 238)
    head_box = bbox_for(*head, s(196), s(182))
    top_y = head[1] - s(170)
    bottom_y = head[1] + s(175)
    canvas.fill(
        ellipse_sd(*head, s(186), s(172)),
        None,
        head_box,
        color_fn=lambda x, y: lerp(PURPLE_LIGHT, PURPLE_DARK, (y - top_y) / max(1.0, bottom_y - top_y)),
    )

    canvas.fill(
        ellipse_sd(head[0] - s(48), head[1] - s(96), s(92), s(50)),
        (255, 255, 255),
        bbox_for(head[0] - s(48), head[1] - s(96), s(92), s(50)),
        alpha=0.07,
    )

    for eye_dx in (198, 314):
        eye = p(eye_dx, 218)
        canvas.fill(
            ellipse_sd(*eye, s(46), s(52)),
            (255, 255, 255),
            bbox_for(*eye, s(46), s(52)),
        )
        pupil = p(eye_dx + 6, 225)
        canvas.fill(
            ellipse_sd(*pupil, s(20), s(22)),
            (33, 20, 48),
            bbox_for(*pupil, s(20), s(22)),
        )
        glint = p(eye_dx + 13, 214)
        canvas.fill(
            ellipse_sd(*glint, s(7), s(7)),
            (255, 255, 255),
            bbox_for(*glint, s(7), s(7)),
        )

    for blush_dx in (126, 386):
        blush = p(blush_dx, 300)
        canvas.fill(
            ellipse_sd(*blush, s(24), s(14)),
            (196, 181, 253),
            bbox_for(*blush, s(24), s(14)),
            alpha=0.55,
        )

    mouth_color = (42, 17, 80)
    if mood == "happy":
        capsule(canvas, quad_points(p(224, 296), p(256, 330), p(288, 296)), s(13), mouth_color)
        star(canvas, *p(96, 116), s(19), (245, 243, 255), 0.9)
        star(canvas, *p(414, 92), s(13), (245, 243, 255), 0.75)
    elif mood == "sad":
        capsule(canvas, quad_points(p(224, 322), p(256, 296), p(288, 322)), s(13), mouth_color)
        tear = p(338, 300)
        canvas.fill(
            ellipse_sd(*p(338, 306), s(10), s(15)),
            (165, 216, 255),
            bbox_for(*tear, s(16), s(20)),
            alpha=0.9,
        )
        capsule(canvas, quad_points(p(174, 172), p(206, 160), p(232, 170)), s(9), (42, 17, 80), 0.55)
    elif mood == "thinking":
        capsule(canvas, [(p(232, 306)[0], p(232, 306)[1]), (p(280, 306)[0], p(280, 306)[1])], s(13), mouth_color)
        bubble = p(430, 120)
        canvas.fill(
            ellipse_sd(*bubble, s(16), s(16)),
            (196, 181, 253),
            bbox_for(*bubble, s(16), s(16)),
            alpha=0.85,
        )
        bubble2 = p(462, 84)
        canvas.fill(
            ellipse_sd(*bubble2, s(9), s(9)),
            (196, 181, 253),
            bbox_for(*bubble2, s(9), s(9)),
            alpha=0.65,
        )
    else:
        capsule(canvas, [(p(234, 306)[0], p(234, 306)[1]), (p(278, 306)[0], p(278, 306)[1])], s(13), mouth_color)


def mascot_asset(mood, path, size=512):
    canvas = Canvas(size, size)
    draw_octopus(canvas, size / 2, size / 2 - size * 0.01, size / 560.0, mood, shadow=False)
    canvas.write_png(path)


def main():
    mascots = ROOT / "assets" / "mascot"
    for mood in ("idle", "happy", "sad"):
        mascot_asset(mood, mascots / f"mascot-{mood}.png")

    icon = Canvas(1024, 1024, LAVENDER)
    draw_octopus(icon, 512, 500, 1.42, "idle", shadow=False)
    icon.write_png(ROOT / "assets" / "images" / "icon.png")

    adaptive = Canvas(1024, 1024)
    draw_octopus(adaptive, 512, 512, 1.16, "idle", shadow=False)
    adaptive.write_png(ROOT / "assets" / "images" / "adaptive-icon.png")

    splash = Canvas(512, 512)
    draw_octopus(splash, 256, 248, 0.78, "happy", shadow=False)
    splash.write_png(ROOT / "assets" / "images" / "splash-icon.png")

    favicon = Canvas(196, 196, LAVENDER)
    draw_octopus(favicon, 98, 96, 0.30, "idle", shadow=False)
    favicon.write_png(ROOT / "assets" / "images" / "favicon.png")

    print("assets gerados")


if __name__ == "__main__":
    main()
