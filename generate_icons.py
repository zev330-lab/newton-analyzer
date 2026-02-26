#!/usr/bin/env python3
"""Generate PWA app icons for Newton Analyzer."""
from PIL import Image, ImageDraw

NAVY = (27, 42, 74)       # #1B2A4A
GOLD = (212, 168, 67)     # #D4A843

def draw_icon(size):
    """Create a polished app icon at given size."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Rounded rectangle background
    margin = int(size * 0.04)
    radius = int(size * 0.18)
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=radius, fill=NAVY
    )

    s = size  # shorthand

    # House body (rectangle)
    bx1 = int(s * 0.22)
    by1 = int(s * 0.44)
    bx2 = int(s * 0.68)
    by2 = int(s * 0.82)
    draw.rectangle([bx1, by1, bx2, by2], fill=GOLD)

    # Roof (triangle)
    roof_peak = (int(s * 0.45), int(s * 0.20))
    roof_left = (int(s * 0.16), int(s * 0.47))
    roof_right = (int(s * 0.74), int(s * 0.47))
    draw.polygon([roof_peak, roof_left, roof_right], fill=GOLD)

    # Door (dark rectangle in house body)
    dx1 = int(s * 0.38)
    dy1 = int(s * 0.58)
    dx2 = int(s * 0.52)
    dy2 = int(s * 0.82)
    draw.rectangle([dx1, dy1, dx2, dy2], fill=NAVY)

    # Left window
    wx = int(s * 0.26)
    wy = int(s * 0.50)
    ws = int(s * 0.08)
    draw.rectangle([wx, wy, wx + ws, wy + ws], fill=NAVY)

    # Right window
    wx2 = int(s * 0.56)
    draw.rectangle([wx2, wy, wx2 + ws, wy + ws], fill=NAVY)

    # Magnifying glass (overlapping top-right)
    # Circle
    cx = int(s * 0.68)
    cy = int(s * 0.30)
    cr = int(s * 0.14)
    lw = max(int(s * 0.035), 2)

    # Glass circle outline (draw thick by filling outer then cutting inner)
    draw.ellipse([cx - cr, cy - cr, cx + cr, cy + cr], fill=GOLD)
    inner = lw
    draw.ellipse([cx - cr + inner, cy - cr + inner, cx + cr - inner, cy + cr - inner], fill=NAVY)

    # Handle (line at 45 degrees from circle)
    import math
    angle = math.radians(45)
    hx1 = cx + int((cr - 1) * math.cos(angle))
    hy1 = cy + int((cr - 1) * math.sin(angle))
    hx2 = cx + int((cr + s * 0.12) * math.cos(angle))
    hy2 = cy + int((cr + s * 0.12) * math.sin(angle))
    draw.line([hx1, hy1, hx2, hy2], fill=GOLD, width=max(int(s * 0.04), 2))

    # Small plus sign inside magnifying glass (search indicator)
    plus_size = int(s * 0.05)
    draw.line([cx - plus_size, cy, cx + plus_size, cy], fill=GOLD, width=max(int(s * 0.02), 1))
    draw.line([cx, cy - plus_size, cx, cy + plus_size], fill=GOLD, width=max(int(s * 0.02), 1))

    return img

# Generate all three sizes
for name, sz in [("icon-180.png", 180), ("icon-192.png", 192), ("icon-512.png", 512)]:
    img = draw_icon(sz)
    img.save(name, "PNG")
    print(f"Created {name} ({sz}x{sz})")
