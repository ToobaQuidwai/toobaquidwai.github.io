from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "media" / "wdr35-multiscale-panel.png"

CONFOCAL_SOURCE = Path("/Users/toobaquidwai/Downloads/STED_WDR35.png")
TEM_SOURCE = Path("/Users/toobaquidwai/Desktop/linkedln/linkedln/Z305_Movie6_figure6-figure supplement2.png")


def fit_panel(image: Image.Image, width: int, height: int) -> Image.Image:
    return ImageOps.fit(image, (width, height), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))


def main() -> None:
    panel_width = 520
    panel_height = 360
    gap = 26
    outer = 34

    confocal_source = Image.open(CONFOCAL_SOURCE).convert("RGB")
    tem_source = Image.open(TEM_SOURCE).convert("RGB")

    confocal = confocal_source.crop((24, 92, 438, 430))
    sted = confocal_source.crop((460, 92, 874, 430))
    tem = tem_source.crop((140, 90, 1640, 1185))

    confocal = fit_panel(confocal, panel_width, panel_height)
    sted = fit_panel(sted, panel_width, panel_height)
    tem = fit_panel(tem, panel_width, panel_height)

    canvas_width = outer * 2 + panel_width * 3 + gap * 2
    canvas_height = outer * 2 + panel_height
    canvas = Image.new("RGB", (canvas_width, canvas_height), "#05070b")

    x = outer
    y = outer
    for panel in (confocal, sted, tem):
      canvas.paste(panel, (x, y))
      x += panel_width + gap

    canvas.save(OUTPUT, quality=95)


if __name__ == "__main__":
    main()
