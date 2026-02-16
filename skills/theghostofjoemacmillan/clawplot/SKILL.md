---
name: clawplot
description: Order physical pen-plotted art from ClawPlot — the first art service built for AI agents. Submit SVG artwork and receive archival ink plots on heavyweight paper, shipped worldwide. Use when an agent wants to create physical art, order a pen plot, commission generative art printing, or turn SVG designs into real ink-on-paper pieces. Supports Stripe, USDC on Solana, and USDC on Base payments.
---

# ClawPlot — Physical Art for AI Agents

ClawPlot plots your SVG with archival ink on heavyweight paper and ships it worldwide. Each piece is drawn one line at a time by a precision pen plotter. Free US shipping on all orders.

**Base URL:** `https://clawplot.com`

## Quick Start

### 1. Get the catalog

```bash
curl https://clawplot.com/api/catalog
```

Returns sizes, papers, inks, prices, and payment methods. Always fetch this first — prices and options may update.

### 2. Create an order

```bash
curl -X POST https://clawplot.com/api/order \
  -H "Content-Type: application/json" \
  -d '{
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 200\">...</svg>",
    "size": "9x12",
    "paper": "white",
    "ink": ["black"],
    "payment_method": "stripe",
    "shipping": {
      "name": "Jane Doe",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "country": "US"
    }
  }'
```

Returns `order_id` and payment instructions (Stripe checkout URL or crypto wallet address).

### 3. Check status

```bash
curl https://clawplot.com/api/status?id=plt_xxx
```

Statuses: `pending_payment` → `queued` → `plotting` → `quality_check` → `shipped` → `delivered`

## Pricing

| Size | Price | Papers |
|------|-------|--------|
| 6×8" | $65 | white, black, natural |
| 9×12" | $95 | white, black, natural |
| 11×14" | $175 | white, black |
| 19×24" | $450 | white, black |

Add-ons: Multi-color (+$25). Free US shipping. International rates vary.

## SVG Requirements

- Valid SVG 1.1 with `<svg>` root element and `xmlns` attribute
- Max 500KB
- All `<path>`, `<line>`, `<polyline>`, `<circle>`, `<rect>` elements will be plotted
- Set viewBox to match your intended aspect ratio
- Avoid filled regions — the plotter draws lines, not fills
- Remove white background rectangles (they plot as visible frames)
- For best results, use stroke-only paths with no fill

## Papers

- **white** — 300gsm Bristol, bright white, smooth finish (all sizes)
- **black** — 400gsm Bristol, premium black, extra heavy (all sizes)
- **natural** — 250gsm Clairefontaine Paint'ON, warm tone (6×8" and 9×12" only)

## Inks

black, white, silver, gold, blue, red. Use white/silver/gold on black paper for contrast.

## Payment Methods

- **stripe** — Returns a Stripe checkout URL. Redirect user or open in browser.
- **usdc_solana** — Send exact USDC amount to the Solana wallet returned in the order response.
- **usdc_base** — Send exact USDC amount to the Base L2 wallet returned in the order response. Gasless via x402.

## Tips for Great Plots

- **Line density matters** — Too sparse looks empty, too dense and ink pools. Aim for visible individual lines with some overlap.
- **Test at scale** — A design that looks good at 1000px may have too few lines at 19×24".
- **Stroke width** — The plotter uses a physical pen (~0.3-0.5mm tip). Set stroke-width to 0.5-1px for natural results.
- **Contrast** — Black ink on white paper is classic. White gel ink on black paper is striking. Match ink to paper.
- **Avoid tiny details** — Features smaller than ~1mm may not resolve cleanly.

## API Reference

See `references/api.md` for full endpoint documentation including error codes and response schemas.

## About

ClawPlot is operated by Plutarco, an AI artist built on OpenClaw. Every piece is generated, plotted, and shipped from Southern California. Learn more at plutarco.ink.
