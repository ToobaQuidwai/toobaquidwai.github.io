#!/usr/bin/env python3
from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image


INPUT_IMAGE = Path("/Users/data/4_MRC-IGMM/Mill lab/Thesis_06012021/chapter3ciliary phenotype of IFT121/figures/JPEGS/3.11_IFT88collage.png")
OUTPUT_IMAGE = Path("/Users/toobaquidwai/Downloads/resume_portfolio/assets/media/ift88-collage-rotated.png")

CROP_BOX = (240, 110, 2320, 2935)
WORKING_SIZE = (1280, 824)
OUTPUT_SIZE = (1280, 824)


def edge_connected_light_mask(arr: np.ndarray, threshold: int = 238) -> np.ndarray:
    h, w, _ = arr.shape
    bright = (arr[:, :, 0] >= threshold) & (arr[:, :, 1] >= threshold) & (arr[:, :, 2] >= threshold)
    visited = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()

    for x in range(w):
        if bright[0, x]:
            q.append((0, x))
            visited[0, x] = True
        if bright[h - 1, x] and not visited[h - 1, x]:
            q.append((h - 1, x))
            visited[h - 1, x] = True

    for y in range(h):
        if bright[y, 0] and not visited[y, 0]:
            q.append((y, 0))
            visited[y, 0] = True
        if bright[y, w - 1] and not visited[y, w - 1]:
            q.append((y, w - 1))
            visited[y, w - 1] = True

    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and bright[ny, nx] and not visited[ny, nx]:
                visited[ny, nx] = True
                q.append((ny, nx))

    return visited


def scale_bar_boxes(arr: np.ndarray, threshold: int = 228) -> list[tuple[int, int, int, int]]:
    bright = (arr[:, :, 0] >= threshold) & (arr[:, :, 1] >= threshold) & (arr[:, :, 2] >= threshold)
    h, w = bright.shape
    visited = np.zeros((h, w), dtype=bool)
    boxes: list[tuple[int, int, int, int]] = []

    for y in range(h):
        for x in range(w):
            if not bright[y, x] or visited[y, x]:
                continue

            q: deque[tuple[int, int]] = deque([(y, x)])
            visited[y, x] = True
            pts: list[tuple[int, int]] = []

            while q:
                cy, cx = q.popleft()
                pts.append((cy, cx))
                for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                    if 0 <= ny < h and 0 <= nx < w and bright[ny, nx] and not visited[ny, nx]:
                        visited[ny, nx] = True
                        q.append((ny, nx))

            ys = [p[0] for p in pts]
            xs = [p[1] for p in pts]
            x1, x2 = min(xs), max(xs)
            y1, y2 = min(ys), max(ys)
            width = x2 - x1 + 1
            height = y2 - y1 + 1
            area = len(pts)

            if 18 <= width <= 40 and 4 <= height <= 12 and 90 <= area <= 320 and width / max(height, 1) >= 2.8:
                boxes.append((x1, y1, x2, y2))

    return boxes


def remove_scale_bars(arr: np.ndarray) -> np.ndarray:
    result = arr.copy()
    for x1, y1, x2, y2 in scale_bar_boxes(result):
        pad_x = 4
        pad_y = 6
        sx1 = max(0, x1 - pad_x)
        sx2 = min(result.shape[1], x2 + pad_x + 1)
        sy1 = max(0, y1 - pad_y)
        sy2 = min(result.shape[0], y2 + pad_y + 1)

        above_y1 = max(0, sy1 - (sy2 - sy1))
        above_y2 = sy1
        below_y1 = sy2
        below_y2 = min(result.shape[0], sy2 + (sy2 - sy1))

        samples = []
        if above_y2 > above_y1:
            samples.append(result[above_y1:above_y2, sx1:sx2])
        if below_y2 > below_y1:
            samples.append(result[below_y1:below_y2, sx1:sx2])

        if samples:
            replacement = np.concatenate(samples, axis=0).mean(axis=0)
            replacement = np.repeat(replacement[np.newaxis, :, :], sy2 - sy1, axis=0)
            result[sy1:sy2, sx1:sx2] = replacement.astype(np.uint8)
    return result


def render() -> None:
    OUTPUT_IMAGE.parent.mkdir(parents=True, exist_ok=True)

    img = Image.open(INPUT_IMAGE).convert("RGB")
    img = img.crop(CROP_BOX)
    img = img.rotate(-90, expand=True)
    img = img.resize(WORKING_SIZE, Image.Resampling.LANCZOS)

    arr = np.array(img)
    bg_mask = edge_connected_light_mask(arr)
    arr[bg_mask] = 0

    working = Image.fromarray(arr)

    # Two-row bands for each genotype, matching the simplified black-background layout.
    top = working.crop((0, 0, 1280, 150))
    middle = working.crop((0, 333, 1280, 484))
    bottom = working.crop((0, 672, 1280, 824))

    gap = 28
    margin = 16
    temp_height = top.height + middle.height + bottom.height + gap * 2 + margin * 2
    rebuilt = Image.new("RGB", (OUTPUT_SIZE[0], temp_height), "black")
    y = margin
    for band in (top, middle, bottom):
        rebuilt.paste(band, (0, y))
        y += band.height + gap

    rebuilt_arr = np.array(rebuilt)
    rebuilt_arr = remove_scale_bars(rebuilt_arr)
    rebuilt_arr[338:385, 470:810] = 0

    final = Image.fromarray(rebuilt_arr).resize(OUTPUT_SIZE, Image.Resampling.LANCZOS)
    final.save(OUTPUT_IMAGE, optimize=True)
    print(OUTPUT_IMAGE)


if __name__ == "__main__":
    render()
