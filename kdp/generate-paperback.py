#!/usr/bin/env python3
"""Generate KDP-ready paperback PDF for The Pivot Pyramid.

Uses md-to-pdf with the existing ebook-styles.css for professional styling,
plus adds:
1. A static Table of Contents
2. Page numbers in the footer

Usage:
    python3 kdp/generate-paperback.py
"""

import json
import re
import shutil
import subprocess
from pathlib import Path

import fitz  # PyMuPDF

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
EBOOK_DIR = PROJECT_ROOT / "ebook"
MANUSCRIPT_DIR = SCRIPT_DIR / "manuscript"
OUTPUT_PDF = MANUSCRIPT_DIR / "pivot-pyramid-paperback.pdf"
SOURCE_MD = EBOOK_DIR / "pivot-pyramid-ebook.md"
STYLESHEET = EBOOK_DIR / "ebook-styles.css"
FONT_FILE = EBOOK_DIR / "fonts" / "Merriweather-Regular.ttf"


def parse_headings(source_text):
    """Extract H1 and H2 headings from the markdown source for the TOC."""
    headings = []

    for line in source_text.split("\n"):
        match = re.match(r"^(#{1,2})\s+(.+)$", line)
        if not match:
            continue

        level = len(match.group(1))
        title = match.group(2).strip()

        # Skip the book title and subtitle
        if title == "The Pivot Pyramid":
            continue
        if title.startswith("A Founder's Complete Guide"):
            continue

        headings.append((level, title))

    return headings


def build_toc_markdown(headings):
    """Build a static Table of Contents as markdown.

    Uses HTML page-break divs (supported by md-to-pdf's CSS).
    Groups chapter entries (H2) under their Part heading (H1).
    """
    lines = ["# Contents", ""]

    pending_items = []

    def flush_items():
        if pending_items:
            for item in pending_items:
                lines.append(f"- {item}")
            lines.append("")
            pending_items.clear()

    for level, title in headings:
        if level == 1:
            flush_items()
            lines.append(f"**{title}**")
            lines.append("")
        elif level == 2:
            pending_items.append(title)

    flush_items()
    lines.append("")

    return "\n".join(lines)


def generate_pdf(modified_md_text):
    """Run md-to-pdf to generate a styled PDF."""
    print("Running md-to-pdf...")

    # Paperback-specific CSS overrides to prevent content bleeding into gutter.
    # KDP flags "insufficient gutter" when any rendered content (including
    # box-shadow, borders, table overflow) extends into the margin area.
    paperback_overrides = """\
<style>
/* KDP paperback gutter fixes: prevent any rendered content from
   extending beyond the Puppeteer margin area. */

/* Remove box-shadow and border from images — they render outside
   the content box and KDP detects them as gutter violations */
img {
  box-shadow: none !important;
  border: none !important;
  max-width: 92% !important;
}

/* Constrain tables: fixed layout prevents cell overflow */
table {
  width: 92% !important;
  table-layout: fixed !important;
}
td, th {
  overflow: hidden !important;
  word-break: break-word !important;
}

/* Prevent code blocks from overflowing horizontally */
pre {
  overflow: hidden !important;
  white-space: pre-wrap !important;
  word-wrap: break-word !important;
}
</style>

"""

    # Write modified markdown to a temp file IN the ebook directory
    # so relative image paths (./figures/optimized/*.png) resolve correctly
    temp_md = EBOOK_DIR / "_temp-paperback.md"

    try:
        # Prepend paperback CSS overrides to the markdown content
        temp_md.write_text(paperback_overrides + modified_md_text, encoding="utf-8")

        # Puppeteer PDF options
        # NOTE: displayHeaderFooter disabled — KDP detects footer text
        # as "text outside the margins" since Puppeteer renders it in
        # the margin area. Page numbers omitted for KDP compliance.
        pdf_options = {
            "width": "6in",
            "height": "9in",
            "margin": {
                "top": "0.75in",
                "bottom": "0.75in",
                "left": "1.0in",
                "right": "1.0in",
            },
            "displayHeaderFooter": False,
            "printBackground": True,
        }

        cmd = [
            "npx", "md-to-pdf",
            str(temp_md),
            "--stylesheet", str(STYLESHEET),
            "--pdf-options", json.dumps(pdf_options),
        ]

        subprocess.run(cmd, check=True, cwd=str(EBOOK_DIR))

        # md-to-pdf outputs next to the source file: _temp-paperback.pdf
        generated_pdf = EBOOK_DIR / "_temp-paperback.pdf"
        if generated_pdf.exists():
            shutil.move(str(generated_pdf), str(OUTPUT_PDF))
            print(f"  -> {OUTPUT_PDF.relative_to(PROJECT_ROOT)}")
        else:
            print("Error: PDF was not generated")

    finally:
        temp_md.unlink(missing_ok=True)


def add_page_numbers(pdf_path, skip_pages=3):
    """Stamp page numbers onto each page using PyMuPDF.

    Places numbers inside the content area (just above the bottom margin)
    so KDP doesn't flag them as "text outside the margins."

    Args:
        pdf_path: Path to the PDF file (modified in place).
        skip_pages: Number of front-matter pages to skip (title, about, TOC).
    """
    print(f"Adding page numbers (skipping first {skip_pages} pages)...")
    doc = fitz.open(str(pdf_path))

    for i, page in enumerate(doc):
        if i < skip_pages:
            continue

        page_num = i + 1
        rect = page.rect  # full page rectangle
        num_str = str(page_num)

        # Position: centered horizontally, 0.55in from the bottom edge.
        # With 0.75in bottom margin, this places the number 0.20in above
        # the margin boundary — safely inside the content area.
        fontsize = 10

        # Use embedded Merriweather font (not Helvetica which isn't embedded)
        font = fitz.Font(fontfile=str(FONT_FILE))
        text_width = font.text_length(num_str, fontsize=fontsize)
        x = (rect.width - text_width) / 2
        y = rect.height - 0.55 * 72  # 0.55 inches from bottom

        tw = page.insert_font(fontname="MerriNum", fontfile=str(FONT_FILE))
        page.insert_text(
            fitz.Point(x, y),
            num_str,
            fontname="MerriNum",
            fontsize=fontsize,
            color=(0.30, 0.28, 0.25),  # dark warm gray
        )

    total = len(doc)
    # Save as new file (not incremental) — incremental saves can fail
    # to render in some PDF viewers with Puppeteer-generated PDFs.
    out_path = str(pdf_path) + ".tmp"
    doc.save(out_path, garbage=4, deflate=True)
    doc.close()
    shutil.move(out_path, str(pdf_path))
    print(f"  -> Page numbers added to pages {skip_pages + 1}-{total}")


def main():
    print("Generating KDP paperback PDF (6x9 in, styled)")
    print(f"Source: {SOURCE_MD.relative_to(PROJECT_ROOT)}")
    print(f"Styles: {STYLESHEET.relative_to(PROJECT_ROOT)}")
    print()

    # Step 1: Read source markdown and parse headings
    source_text = SOURCE_MD.read_text(encoding="utf-8")
    headings = parse_headings(source_text)
    print(f"Found {len(headings)} TOC entries")

    # Step 2: Build static TOC and insert into the markdown
    toc_md = build_toc_markdown(headings)

    # Insert TOC before the foreword ("# Why I Wrote This Book")
    # The H1 CSS rule (page-break-before: always) handles page breaks
    insert_marker = "# Why I Wrote This Book"
    insert_pos = source_text.find(insert_marker)

    if insert_pos == -1:
        print("Error: Could not find '# Why I Wrote This Book' in source")
        return

    modified_text = source_text[:insert_pos] + toc_md + source_text[insert_pos:]

    # Step 3: Generate styled PDF with md-to-pdf (no page numbers yet)
    generate_pdf(modified_text)

    # Step 4: Stamp page numbers onto the PDF using PyMuPDF
    # Skip first 3 pages (title, about author, TOC)
    if OUTPUT_PDF.exists():
        add_page_numbers(OUTPUT_PDF, skip_pages=3)

    size_mb = OUTPUT_PDF.stat().st_size / (1024 * 1024) if OUTPUT_PDF.exists() else 0
    print(f"\nDone! Output: {OUTPUT_PDF.relative_to(PROJECT_ROOT)} ({size_mb:.0f} MB)")
    print("Upload this file to KDP for your paperback.")


if __name__ == "__main__":
    main()
