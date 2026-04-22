#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw


INPUT_IMAGE = Path("/Users/data/4_MRC-IGMM/Mill lab/Thesis_06012021/chapter3ciliary phenotype of IFT121/figures/JPEGS/3.11_IFT88collage.png")
OUTPUT_IMAGE = Path("/Users/toobaquidwai/Downloads/resume_portfolio/assets/media/ift88-collage-rotated.png")

# Crop away the white margin labels while keeping the collage tiles intact.
CROP_BOX = (240, 110, 2320, 2935)
OUTPUT_SIZE = (1280, 860)


def render() -> None:
    OUTPUT_IMAGE.parent.mkdir(parents=True, exist_ok=True)
    img = Image.open(INPUT_IMAGE).convert("RGB")
    img = img.crop(CROP_BOX)
    img = img.rotate(-90, expand=True)
    img = img.resize((1280, 944), Image.LANCZOS)

    # Rebuild the collage from the three tile bands only, which removes the
    # rotated genotype labels and keeps the layout visually symmetrical.
    row1 = img.crop((0, 0, 1280, 210))
    row2 = img.crop((0, 320, 1280, 540))
    row3 = img.crop((0, 650, 1280, 850))
    gap = 28
    rebuilt = Image.new("RGB", OUTPUT_SIZE, "white")
    rebuilt.paste(row1, (0, 0))
    rebuilt.paste(row2, (0, row1.height + gap))
    rebuilt.paste(row3, (0, row1.height + gap + row2.height + gap))
    draw = ImageDraw.Draw(rebuilt)
    draw.rectangle([470, 220, 780, 305], fill="white")
    draw.rectangle([500, 515, 735, 600], fill="white")

    rebuilt.save(OUTPUT_IMAGE, optimize=True)
    print(OUTPUT_IMAGE)


if __name__ == "__main__":
    render()
