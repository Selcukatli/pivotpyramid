#!/bin/bash
# Generate KDP paperback full-wrap cover
# 180 pages, 6x9 trim, white paper
#
# Spine width: 180 * 0.002252 = 0.405"
# Total: 0.125 + 6 + 0.405 + 6 + 0.125 = 12.655" x 9.250"
# At 300 DPI: 3797 x 2775 px

set -e
cd "$(dirname "$0")"

# Dimensions
BACK_W=1838    # (0.125 + 6) * 300 = 1837.5 → 1838
SPINE_W=121    # 0.405 * 300 = 121.5 → 121
FRONT_W=1838   # (6 + 0.125) * 300 = 1837.5 → 1838
TOTAL_W=$((BACK_W + SPINE_W + FRONT_W))  # 3797
HEIGHT=2775    # 9.250 * 300

echo "Cover dimensions: ${TOTAL_W} x ${HEIGHT} px"
echo "Back: ${BACK_W}  Spine: ${SPINE_W}  Front: ${FRONT_W}"

# Step 1: Crop back cover to size
# back-v6.png is 1920x2880. Crop to 1838x2775.
# Keep left edge (outer bleed), trim right (spine side)
# Center vertically (trim 52 from top, 53 from bottom)
echo "Step 1: Cropping back cover..."
magick back-v6.png -crop ${BACK_W}x${HEIGHT}+0+52 +repage back-cropped.png

# Step 2: Fix back cover bottom text — blank out centered text, add left-aligned
# The bottom ~180px has PIVOTPYRAMID.COM centered. Cover it with orange, re-add left-aligned.
echo "Step 2: Fixing back cover bottom text..."
magick back-cropped.png \
  -fill '#f59e0b' -draw "rectangle 0,$((HEIGHT-170)) ${BACK_W},${HEIGHT}" \
  -font 'Avenir-Black' -pointsize 36 -fill 'white' \
  -gravity SouthWest -annotate +80+80 'PIVOTPYRAMID.COM' \
  -font 'Avenir-Book' -pointsize 20 -fill 'rgba(255,255,255,0.85)' \
  -gravity SouthWest -annotate +80+45 '@selcukatli  ·  selcukatli.com' \
  back-final.png

# Step 3: Create spine with rotated text
echo "Step 3: Creating spine..."
magick -size ${SPINE_W}x${HEIGHT} xc:'#f59e0b' \
  -font 'Avenir-Black' -pointsize 24 -fill 'white' \
  -gravity Center -annotate 90x90+0+0 'THE PIVOT PYRAMID' \
  spine-new.png

# Step 4: Crop front cover to size
# front-cover-seedream.png is 1920x2880. Crop to 1838x2775.
# Keep right edge (outer bleed), trim left (spine side)
echo "Step 4: Cropping front cover..."
magick front-cover-seedream.png -crop ${FRONT_W}x${HEIGHT}+$((1920-FRONT_W))+52 +repage front-cropped.png

# Step 5: Composite all three panels
echo "Step 5: Compositing full cover..."
magick back-final.png spine-new.png front-cropped.png +append paperback-cover-full.png

# Verify dimensions
ACTUAL=$(magick identify -format '%wx%h' paperback-cover-full.png)
echo "Final cover: ${ACTUAL} (expected: ${TOTAL_W}x${HEIGHT})"

# Step 6: Convert to PDF at 300 DPI
echo "Step 6: Converting to PDF..."
magick paperback-cover-full.png \
  -resize ${TOTAL_W}x${HEIGHT}! \
  -page "${TOTAL_W}x${HEIGHT}" \
  -density 300 \
  PDF:paperback-cover-full.pdf

echo "Done! Files:"
echo "  paperback-cover-full.png ($(du -h paperback-cover-full.png | cut -f1))"
echo "  paperback-cover-full.pdf ($(du -h paperback-cover-full.pdf | cut -f1))"

# Cleanup intermediate files
rm -f back-cropped.png back-final.png spine-new.png front-cropped.png
