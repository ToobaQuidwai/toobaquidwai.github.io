#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps


SOURCES = [
    ("Confocal", Path("/Users/toobaquidwai/Desktop/your-figure/confocal platelet.mov")),
    ("alpha tubulin PALM", Path("/Users/toobaquidwai/Desktop/your-figure/Platelet Microtubues PALM imaging.avi")),
    ("γ-tubulin PALM", Path("/Users/toobaquidwai/Desktop/your-figure/Platelet gamma tutbulin PALM imaging.avi")),
    ("alpha tubulin PALM", Path("/Users/toobaquidwai/Desktop/your-figure/Platelet Microtubues PALM imaging1.avi")),
]

OUTPUT_VIDEO = Path("/Users/toobaquidwai/Downloads/resume_portfolio/assets/media/platelet-imaging-methods.mp4")
FRAME_SIZE = (1280, 720)
FPS = 10
TOTAL_FRAMES = 120
PANEL_SIZE = (560, 255)
PANEL_POSITIONS = [
    (48, 120),
    (672, 120),
    (48, 408),
    (672, 408),
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


def normalize_frame(frame: np.ndarray, label: str) -> Image.Image:
    image = Image.fromarray(frame).convert("RGB")

    if label == "Confocal":
        image = image.crop((10, 8, 242, 250))
        image = ImageEnhance.Contrast(image).enhance(1.15)
        image = ImageEnhance.Brightness(image).enhance(1.08)
        image = ImageEnhance.Color(image).enhance(1.08)
    elif "γ-tubulin" in label:
        image = image.crop((74, 52, 432, 432))
        image = ImageEnhance.Contrast(image).enhance(1.42)
        image = ImageEnhance.Brightness(image).enhance(1.1)
        image = image.filter(ImageFilter.SHARPEN)
    elif frame.shape[0] > 700:
        image = image.crop((244, 88, 548, 650))
        image = ImageEnhance.Contrast(image).enhance(1.28)
        image = ImageEnhance.Brightness(image).enhance(1.18)
        image = ImageEnhance.Color(image).enhance(1.1)
    else:
        image = image.crop((54, 54, 456, 456))
        image = ImageEnhance.Contrast(image).enhance(1.22)
        image = ImageEnhance.Brightness(image).enhance(1.08)
        image = ImageEnhance.Color(image).enhance(1.18)

    return ImageOps.contain(image, PANEL_SIZE, Image.Resampling.LANCZOS)


def render_panel(draw: ImageDraw.ImageDraw, canvas: Image.Image, frame_image: Image.Image, position: tuple[int, int], label: str, body_font, chip_font) -> None:
    x, y = position
    panel = Image.new("RGB", PANEL_SIZE, "#060a10")
    px = (PANEL_SIZE[0] - frame_image.width) // 2
    py = (PANEL_SIZE[1] - frame_image.height) // 2
    panel.paste(frame_image, (px, py))

    canvas.paste(panel, position)
    draw.rounded_rectangle((x, y, x + PANEL_SIZE[0], y + PANEL_SIZE[1]), radius=18, outline=(255, 255, 255, 28), width=1)

    chip_box = (x + 14, y + 14, x + 14 + 220, y + 14 + 28)
    draw.rounded_rectangle(chip_box, radius=14, fill=(9, 15, 24, 190), outline=(255, 255, 255, 35), width=1)
    draw.text((x + 28, y + 21), label, font=chip_font, fill="#f7fbff")


def render_movie() -> None:
    OUTPUT_VIDEO.parent.mkdir(parents=True, exist_ok=True)

    title_font = load_font(34, bold=True)
    subtitle_font = load_font(16, bold=False)
    chip_font = load_font(15, bold=True)

    readers = [(label, open_reader(path)) for label, path in SOURCES]

    writer = imageio.get_writer(
        str(OUTPUT_VIDEO),
        fps=FPS,
        codec="libx264",
        quality=8,
        pixelformat="yuv420p",
    )

    try:
        for frame_index in range(TOTAL_FRAMES):
            canvas = Image.new("RGB", FRAME_SIZE, "#f4f6f8")
            draw = ImageDraw.Draw(canvas, "RGBA")

            draw.text((48, 38), "Platelet Imaging Methods", font=title_font, fill="#203447")
            draw.text((50, 80), "Confocal and PALM-based views combined into one comparative movie.", font=subtitle_font, fill="#627282")

            for (label, reader), position in zip(readers, PANEL_POSITIONS):
                try:
                    raw = reader.get_data(frame_index)
                except Exception:
                    raw = reader.get_data(frame_index % 30)
                frame_image = normalize_frame(raw, label)
                render_panel(draw, canvas, frame_image, position, label, subtitle_font, chip_font)

            writer.append_data(np.asarray(canvas))
    finally:
        for _, reader in readers:
            reader.close()
        writer.close()


if __name__ == "__main__":
    render_movie()
    print(OUTPUT_VIDEO)
