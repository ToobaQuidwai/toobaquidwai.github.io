#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw, ImageFilter


INPUT_VIDEO = Path("/Users/toobaquidwai/Desktop/dync2h1null.avi")
OUTPUT_VIDEO = Path("/Users/toobaquidwai/Downloads/resume_portfolio/assets/media/dync2h1null-movie.mp4")
FPS = 25
FRAME_SIZE = (960, 1408)


def dilate(mask: np.ndarray, iterations: int = 2) -> np.ndarray:
    mask = mask.astype(bool)
    for _ in range(iterations):
        expanded = mask.copy()
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if dx == 0 and dy == 0:
                    continue
                expanded |= np.roll(np.roll(mask, dy, axis=0), dx, axis=1)
        mask = expanded
    return mask


def build_overlay_mask(arr: np.ndarray) -> np.ndarray:
    r = arr[..., 0].astype(np.int16)
    g = arr[..., 1].astype(np.int16)
    b = arr[..., 2].astype(np.int16)
    maxc = np.maximum(np.maximum(r, g), b)
    minc = np.minimum(np.minimum(r, g), b)

    # Saturated colored overlays: magenta/purple arrows and green legend text.
    colorful = (maxc - minc > 70) & (maxc > 120)

    # Bottom legend band with colored labels is removed completely from the processed frame.
    colorful[-90:, :] = True

    return dilate(colorful, iterations=3)


def arrow_mask(size: tuple[int, int]) -> np.ndarray:
    width, height = size
    mask_img = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(mask_img)

    # Fixed cleanup zones covering the arrow overlays in section-2 and section-3 frames.
    regions = [
        [(205, 470), (300, 560)],   # left/middle arrow
        [(285, 555), (415, 640)],   # right arrow
        [(205, 620), (350, 725)],   # basal body arrow
        [(360, 435), (520, 560)],   # section-3 right-side arrow
    ]

    for box in regions:
        draw.ellipse(box, fill=255)

    return np.asarray(mask_img) > 0


def clean_frame(frame: np.ndarray) -> Image.Image:
    image = Image.fromarray(frame).convert("RGB")
    arr = np.asarray(image)
    mask = build_overlay_mask(arr) | arrow_mask(image.size)

    gray = image.convert("L")
    median = gray.filter(ImageFilter.MedianFilter(size=11))
    soft = median.filter(ImageFilter.GaussianBlur(radius=5))

    base = np.asarray(gray)
    replacement = np.asarray(soft)
    cleaned = base.copy()
    cleaned[mask] = replacement[mask]

    # Trim the bottom legend area after overlay cleanup so the final movie stays minimal.
    cleaned_img = Image.fromarray(cleaned, mode="L").crop((0, 0, image.width, image.height - 70))
    return cleaned_img.resize(FRAME_SIZE, Image.LANCZOS).convert("RGB")


def render_movie() -> None:
    OUTPUT_VIDEO.parent.mkdir(parents=True, exist_ok=True)
    writer = imageio.get_writer(
        str(OUTPUT_VIDEO),
        fps=FPS,
        codec="libx264",
        quality=8,
        pixelformat="yuv420p",
    )
    try:
        reader = imageio.get_reader(str(INPUT_VIDEO))
        try:
            for frame in reader:
                writer.append_data(np.asarray(clean_frame(frame)))
        finally:
            reader.close()
    finally:
        writer.close()


if __name__ == "__main__":
    render_movie()
    print(OUTPUT_VIDEO)
