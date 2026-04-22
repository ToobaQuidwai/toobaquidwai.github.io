from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "media" / "wdr35-multiscale-panel.png"

CONFOCAL_SOURCE = Path("/Users/toobaquidwai/Downloads/STED_WDR35.png")
TEM_SOURCE = Path("/Users/toobaquidwai/Desktop/your-figure/EM.png")


def fit_panel(image: Image.Image, width: int, height: int) -> Image.Image:
    return ImageOps.fit(image, (width, height), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))


def enhance_panel(image: Image.Image, *, contrast: float, brightness: float, color: float = 1.0, sharpness: float = 1.0) -> Image.Image:
    image = ImageEnhance.Contrast(image).enhance(contrast)
    image = ImageEnhance.Brightness(image).enhance(brightness)
    image = ImageEnhance.Color(image).enhance(color)
    image = ImageEnhance.Sharpness(image).enhance(sharpness)
    return image


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


def draw_centered_text(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], text: str, font: ImageFont.ImageFont, fill: str) -> None:
    left, top, right, bottom = box
    bbox = draw.textbbox((0, 0), text, font=font)
    width = bbox[2] - bbox[0]
    height = bbox[3] - bbox[1]
    x = left + (right - left - width) / 2
    y = top + (bottom - top - height) / 2 - 1
    draw.text((x, y), text, font=font, fill=fill)


def main() -> None:
    panel_width = 520
    panel_height = 360
    header_height = 38
    footer_height = 162
    width = panel_width * 3
    height = header_height + panel_height + footer_height

    confocal_source = Image.open(CONFOCAL_SOURCE).convert("RGB")
    tem_source = Image.open(TEM_SOURCE).convert("RGB")

    confocal = confocal_source.crop((24, 92, 438, 430))
    sted = confocal_source.crop((460, 92, 874, 430))
    tem = tem_source.crop((0, 0, 714, 744))

    confocal = fit_panel(confocal, panel_width, panel_height)
    sted = fit_panel(sted, panel_width, panel_height)
    tem = fit_panel(tem, panel_width, panel_height)

    confocal = enhance_panel(confocal, contrast=1.28, brightness=1.08, color=1.12, sharpness=1.08)
    sted = enhance_panel(sted, contrast=1.45, brightness=1.13, color=1.18, sharpness=1.18)
    tem = ImageOps.autocontrast(tem, cutoff=1)
    tem = enhance_panel(tem, contrast=1.34, brightness=1.06, sharpness=1.06)

    canvas = Image.new("RGB", (width, height), "#f6f8fb")
    draw = ImageDraw.Draw(canvas)

    canvas.paste(confocal, (0, header_height))
    canvas.paste(sted, (panel_width, header_height))
    canvas.paste(tem, (panel_width * 2, header_height))

    header_font = load_font(22, bold=True)
    label_font = load_font(18, bold=True)
    small_font = load_font(15, bold=False)
    tiny_font = load_font(13, bold=True)

    draw.rectangle((0, 0, width, header_height), fill="#f6f8fb")
    draw.text((26, 9), "MULTISCALE IMAGING", font=header_font, fill="#203447")

    footer_top = header_height + panel_height
    draw.rectangle((0, footer_top, width, height), fill="#f7f8fb")

    ruler_left = 40
    ruler_right = width - 40
    ruler_y = footer_top + 34
    ruler_height = 18

    for x in range(ruler_left, ruler_right):
      fraction = (x - ruler_left) / (ruler_right - ruler_left)
      if fraction < 0.36:
          start = (145, 177, 229)
          end = (193, 213, 177)
          blend = fraction / 0.36
      elif fraction < 0.68:
          start = (193, 213, 177)
          end = (220, 223, 169)
          blend = (fraction - 0.36) / 0.32
      else:
          start = (220, 223, 169)
          end = (202, 185, 221)
          blend = (fraction - 0.68) / 0.32

      color = tuple(int(start[i] + (end[i] - start[i]) * blend) for i in range(3))
      draw.line((x, ruler_y, x, ruler_y + ruler_height), fill=color)

    draw.line((ruler_left, ruler_y, ruler_right, ruler_y), fill="#1e2833", width=2)

    major_positions = [
        (0.0, "10 um"),
        (0.22, "1 um"),
        (0.42, "100 nm"),
        (0.62, "10 nm"),
        (0.81, "1 nm"),
        (1.0, "0.1 nm"),
    ]

    for index, (fraction, label) in enumerate(major_positions):
        x = ruler_left + int((ruler_right - ruler_left) * fraction)
        draw.line((x, ruler_y - 9, x, ruler_y + 18), fill="#1e2833", width=2)
        bbox = draw.textbbox((0, 0), label, font=small_font)
        label_width = bbox[2] - bbox[0]
        if index == 0:
            text_x = x
        elif index == len(major_positions) - 1:
            text_x = x - label_width
        else:
            text_x = x - label_width / 2
        draw.text((text_x, ruler_y - 31), label, font=small_font, fill="#203447")

    for step in range(1, 50):
        fraction = step / 50
        x = ruler_left + int((ruler_right - ruler_left) * fraction)
        is_major = any(abs(fraction - point[0]) < 0.015 for point in major_positions)
        if is_major:
            continue
        tick_height = 14 if step % 5 == 0 else 9
        draw.line((x, ruler_y - 5, x, ruler_y + tick_height), fill="#1e2833", width=1)

    draw.text((ruler_left, footer_top + 2), "LARGER SCALE", font=tiny_font, fill="#3259a7")
    smaller_bbox = draw.textbbox((0, 0), "SMALLER SCALE", font=tiny_font)
    smaller_width = smaller_bbox[2] - smaller_bbox[0]
    draw.text((ruler_right - smaller_width, footer_top + 2), "SMALLER SCALE", font=tiny_font, fill="#7659aa")

    sections = [
        {
            "box": (0, footer_top + 74, panel_width, height - 16),
            "title": "CONFOCAL",
            "subtitle": "~200-250 nm resolution",
            "color": "#3259a7",
        },
        {
            "box": (panel_width, footer_top + 74, panel_width * 2, height - 16),
            "title": "STED SUPER-RESOLUTION",
            "subtitle": "~20-100 nm resolution",
            "color": "#5a8d33",
        },
        {
            "box": (panel_width * 2, footer_top + 74, width, height - 16),
            "title": "TEM",
            "subtitle": "~0.1-1 nm resolution",
            "color": "#7757a7",
        },
    ]

    for section in sections:
        left, top, right, bottom = section["box"]
        draw.line((left + 24, top, right - 24, top), fill=section["color"], width=3)
        draw_centered_text(draw, (left + 12, top + 6, right - 12, top + 30), section["title"], label_font, section["color"])
        draw_centered_text(draw, (left + 12, top + 34, right - 12, bottom), section["subtitle"], small_font, "#526270")

    canvas.save(OUTPUT, quality=95)


if __name__ == "__main__":
    main()
