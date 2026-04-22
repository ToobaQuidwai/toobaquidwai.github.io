#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageEnhance


INPUT_VIDEO = Path("/Users/toobaquidwai/Desktop/XYZT_dual channel data.mp4")
OUTPUT_VIDEO = Path("/Users/toobaquidwai/Downloads/resume_portfolio/assets/media/xyzt-dual-channel-walkthrough.mp4")
FRAME_SIZE = (1280, 720)
FPS = 10

# Crop chosen to remove the top ruler, bottom scale/color legend, right-side ruler,
# and the gray side padding while preserving the microscopy field itself.
CROP_BOX = (115, 32, 883, 720)
def clean_frame(frame: np.ndarray) -> Image.Image:
    image = Image.fromarray(frame).convert("RGB")
    image = image.crop(CROP_BOX)
    image = ImageEnhance.Contrast(image).enhance(1.08)
    image = ImageEnhance.Color(image).enhance(1.03)
    image = ImageEnhance.Sharpness(image).enhance(1.08)
    return image.resize(FRAME_SIZE, Image.LANCZOS)


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
