#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

import imageio.v2 as imageio
import numpy as np
from PIL import Image


INPUT_VIDEO = Path("/Users/toobaquidwai/Desktop/dync2h1null.avi")
OUTPUT_VIDEO = Path("/Users/toobaquidwai/Downloads/resume_portfolio/assets/media/dync2h1null-movie.mp4")
FPS = 25
FRAME_SIZE = (960, 1408)


def clean_frame(frame: np.ndarray) -> Image.Image:
    image = Image.fromarray(frame).convert("RGB")
    # Remove only the colored label strip at the bottom; keep arrows and the
    # rest of the original movie annotation intact.
    image = image.crop((0, 0, image.width, image.height - 70))
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
