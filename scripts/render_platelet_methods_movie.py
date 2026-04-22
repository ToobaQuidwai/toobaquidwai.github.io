#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps


SOURCES = [
    ("Confocal platelet", Path("/Users/toobaquidwai/Desktop/your-figure/confocal platelet.mov")),
    ("Platelet microtubules PALM", Path("/Users/toobaquidwai/Desktop/your-figure/Platelet Microtubues PALM imaging.avi")),
    ("Platelet gamma-tubulin PALM", Path("/Users/toobaquidwai/Desktop/your-figure/Platelet gamma tutbulin PALM imaging.avi")),
    ("Platelet microtubules PALM 3D", Path("/Users/toobaquidwai/Desktop/your-figure/Platelet Microtubues PALM imaging1.avi")),
]

OUTPUT_VIDEO = Path("/Users/toobaquidwai/Downloads/resume_portfolio/assets/media/platelet-imaging-methods.mp4")
FRAME_SIZE = (1280, 720)
FPS = 10
TOTAL_FRAMES = 324
PANEL_SIZE = (640, 360)
PANEL_POSITIONS = [
    (0, 0),
    (640, 0),
    (0, 360),
    (640, 360),
]


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Helvetica.ttc",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue
    return ImageFont.load_default()


def open_reader(path: Path):
    return imageio.get_reader(str(path))


def load_frames(path: Path) -> list[np.ndarray]:
    reader = open_reader(path)
    try:
        return [frame for frame in reader]
    finally:
        reader.close()


def normalize_frame(frame: np.ndarray, label: str) -> Image.Image:
    image = Image.fromarray(frame).convert("RGB")

    if "Confocal platelet" in label:
        image = image.crop((10, 8, 242, 250))
        image = ImageEnhance.Contrast(image).enhance(1.15)
        image = ImageEnhance.Brightness(image).enhance(1.08)
        image = ImageEnhance.Color(image).enhance(1.08)
    elif "gamma-tubulin" in label:
        image = image.crop((74, 52, 432, 432))
        image = ImageEnhance.Contrast(image).enhance(1.42)
        image = ImageEnhance.Brightness(image).enhance(1.1)
        image = image.filter(ImageFilter.SHARPEN)
    elif "3D" in label:
        image = image.crop((244, 88, 548, 650))
        image = ImageEnhance.Contrast(image).enhance(1.28)
        image = ImageEnhance.Brightness(image).enhance(1.18)
        image = ImageEnhance.Color(image).enhance(1.1)
    else:
        image = image.crop((54, 54, 456, 456))
        image = ImageEnhance.Contrast(image).enhance(1.22)
        image = ImageEnhance.Brightness(image).enhance(1.08)
        image = ImageEnhance.Color(image).enhance(1.18)

    return ImageOps.fit(image, PANEL_SIZE, Image.Resampling.LANCZOS, centering=(0.5, 0.5))


def render_panel(draw: ImageDraw.ImageDraw, canvas: Image.Image, frame_image: Image.Image, position: tuple[int, int], label: str, chip_font) -> None:
    x, y = position
    canvas.paste(frame_image, position)

    chip_box = (x + 14, y + 14, x + 14 + 220, y + 14 + 28)
    draw.rounded_rectangle(chip_box, radius=14, fill=(9, 15, 24, 190), outline=(255, 255, 255, 35), width=1)
    draw.text((x + 28, y + 21), label, font=chip_font, fill="#f7fbff")


def render_movie() -> None:
    OUTPUT_VIDEO.parent.mkdir(parents=True, exist_ok=True)

    chip_font = load_font(15, bold=True)

    clips = [(label, load_frames(path)) for label, path in SOURCES]

    writer = imageio.get_writer(
        str(OUTPUT_VIDEO),
        fps=FPS,
        codec="libx264",
        quality=8,
        pixelformat="yuv420p",
    )

    try:
        for frame_index in range(TOTAL_FRAMES):
            canvas = Image.new("RGB", FRAME_SIZE, "#060a10")
            draw = ImageDraw.Draw(canvas, "RGBA")

            for (label, frames), position in zip(clips, PANEL_POSITIONS):
                raw = frames[frame_index % len(frames)]
                frame_image = normalize_frame(raw, label)
                render_panel(draw, canvas, frame_image, position, label, chip_font)

            writer.append_data(np.asarray(canvas))
    finally:
        writer.close()


if __name__ == "__main__":
    render_movie()
    print(OUTPUT_VIDEO)
