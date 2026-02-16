---
name: printer
description: >-
  Print images and PDFs to any CUPS printer. PPD-aware: reads paper sizes,
  margins, resolution, and duplex at runtime. Use when the user wants to
  print files (images like PNG/JPG or PDFs) or query printer capabilities.
summary: "Print images and PDFs to any CUPS printer with PPD-aware settings."
version: 1.1.1
homepage: https://github.com/odrobnik/printer-skill
metadata:
  openclaw:
    emoji: "🖨️"
    requires:
      bins:
        - python3
        - lp
        - lpstat
        - lpoptions
      python:
        - Pillow
---

# Printer

Print images and PDF files to any CUPS printer. All settings (paper size, margins, resolution, duplex) are read from the printer's PPD file at runtime.

**Entry point:** `{baseDir}/scripts/print.py`

## Setup

See [SETUP.md](SETUP.md) for prerequisites and platform notes.

## Commands

### List Printers

```bash
uv run {baseDir}/scripts/print.py list
uv run {baseDir}/scripts/print.py list --json
```

Shows available printers with status and which is the system default.

### Print a File

```bash
uv run {baseDir}/scripts/print.py print /path/to/file.pdf
uv run {baseDir}/scripts/print.py print /path/to/image.png
uv run {baseDir}/scripts/print.py print /path/to/file.pdf --printer "Custom_Printer"
uv run {baseDir}/scripts/print.py print /path/to/file.pdf -o InputSlot=tray-2
uv run {baseDir}/scripts/print.py print /path/to/file.pdf -o cupsPrintQuality=High -o sides=one-sided
uv run {baseDir}/scripts/print.py print /path/to/file.pdf --json
```

- **PDFs**: Sent directly to the printer with correct media/duplex settings
- **Images** (PNG, JPG, GIF, BMP, TIFF, WebP): Converted to PDF at the printer's native DPI, centered within the printable area, then printed
- **`-o KEY=VALUE`**: Pass any CUPS option (repeatable). Use `options` to discover available settings (tray, quality, media type, duplex, color mode).
- Symlinks are followed but the resolved path must be inside the workspace or `/tmp`

### Printer Info

```bash
uv run {baseDir}/scripts/print.py info
uv run {baseDir}/scripts/print.py info --printer "Custom_Printer"
uv run {baseDir}/scripts/print.py info --json
```

Shows manufacturer, model, resolution, color support, default paper, duplex mode, input trays, and all paper sizes with margins.

### Printer Options

```bash
uv run {baseDir}/scripts/print.py options
uv run {baseDir}/scripts/print.py options --printer "Custom_Printer"
uv run {baseDir}/scripts/print.py options --json
```

Shows all CUPS options with current values and available choices.

## Notes

- Uses the **system default printer** unless `--printer` is specified
- All commands support `--json` for machine-readable output
- Image conversion respects the printer's imageable area (margins) from the PPD
- Only printable file types accepted: PDF, PNG, JPG, GIF, BMP, TIFF, WebP
