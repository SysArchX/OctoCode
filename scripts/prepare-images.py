"""Prepare the official OctoCode artwork.

Takes the two source JPGs at the repository root, removes the white studio
background with a connected flood fill from the borders (so the white of the
eyes stays intact), feathers the cut-out edge and writes transparent PNGs:

  assets/mascot/mascot.png      full octopus (mascote.jpg)
  assets/mascot/logo-icon.png   minimal • < mark (minalista.jpg)

It also regenerates the Expo icon, adaptive icon, splash and favicon from the
minimal mark.
"""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"


def remove_background(source: Path, target: Path, threshold: int = 232, pad: int = 24) -> Image.Image:
    image = Image.open(source).convert("RGB")
    width, height = image.size
    pixels = image.load()

    background = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def near_white(x: int, y: int) -> bool:
        r, g, b = pixels[x, y]
        return min(r, g, b) >= threshold

    for x in range(width):
        for y in (0, height - 1):
            if near_white(x, y) and not background[y * width + x]:
                background[y * width + x] = 1
                queue.append((x, y))
    for y in range(height):
        for x in (0, width - 1):
            if near_white(x, y) and not background[y * width + x]:
                background[y * width + x] = 1
                queue.append((x, y))

    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < width and 0 <= ny < height:
                index = ny * width + nx
                if not background[index] and near_white(nx, ny):
                    background[index] = 1
                    queue.append((nx, ny))

    alpha = Image.new("L", (width, height), 255)
    alpha_pixels = alpha.load()
    for y in range(height):
        for x in range(width):
            if background[y * width + x]:
                alpha_pixels[x, y] = 0

    # Feather the hard cut-out edge so it does not look pasted on, then clip the
    # result back to the artwork bounds with a small transparent margin.
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.8))

    rgba = image.convert("RGBA")
    rgba.putalpha(alpha)

    bbox = alpha.point(lambda value: 255 if value > 8 else 0).getbbox()
    if bbox:
        left, top, right, bottom = bbox
        rgba = rgba.crop(
            (
                max(0, left - pad),
                max(0, top - pad),
                min(width, right + pad),
                min(height, bottom + pad),
            )
        )

    target.parent.mkdir(parents=True, exist_ok=True)
    rgba.save(target)
    print(f"{target.relative_to(ROOT)}: {rgba.width}x{rgba.height} background removed")
    return rgba


def square(image: Image.Image, size: int, margin_ratio: float = 0.08) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    margin = int(size * margin_ratio)
    inner = size - margin * 2
    scale = min(inner / image.width, inner / image.height)
    resized = image.resize(
        (max(1, round(image.width * scale)), max(1, round(image.height * scale))),
        Image.LANCZOS,
    )
    canvas.alpha_composite(
        resized,
        ((size - resized.width) // 2, (size - resized.height) // 2),
    )
    return canvas


def main() -> None:
    mascot = remove_background(ROOT / "mascote.jpg", ASSETS / "mascot" / "mascot.png", pad=18)
    logo = remove_background(ROOT / "minalista.jpg", ASSETS / "mascot" / "logo-icon.png", pad=10)

    images = ASSETS / "images"
    images.mkdir(parents=True, exist_ok=True)

    icon = square(logo, 1024, margin_ratio=0.06)
    icon.save(images / "icon.png")

    adaptive = square(logo, 1024, margin_ratio=0.22)
    adaptive.save(images / "adaptive-icon.png")

    splash = square(mascot, 1024, margin_ratio=0.04)
    splash.save(images / "splash-icon.png")

    favicon = square(logo, 96, margin_ratio=0.02)
    favicon.save(images / "favicon.png")

    website = ROOT / "website" / "assets"
    website.mkdir(parents=True, exist_ok=True)
    square(mascot, 512, margin_ratio=0.02).save(website / "mascot.png")
    square(logo, 512, margin_ratio=0.04).save(website / "logo-icon.png")
    square(logo, 64, margin_ratio=0.0).save(website / "favicon.png")

    print("icon assets regenerated from the official artwork")


if __name__ == "__main__":
    main()
