# ADR 0005: QR codes generated in the browser

- **Status:** Accepted (2026-10-08)
- **Source:** M1 D5

## Context

Every link should be downloadable as a QR code. Generating images on the server costs CPU on every request and adds an endpoint to secure and cache.

## Decision

- Generate QR codes **in the browser** with the `qrcode` package, loaded lazily when the dialog opens.
- Encode the full short URL (`<origin>/r/<code>`), black on white, error correction `M`, 2-module quiet zone.
- Offer **SVG** (vector, for print) and **PNG** at 256, 512, or 1024 px. Files are named `pulse-<code>.{svg,png}`.
- Remove the placeholder `/qr-codes` page; QR lives on each link card.

## Consequences

- Zero server cost and no new attack surface.
- QR codes can't be fetched by URL; a public QR endpoint can come with the API in M4.
- Customization (colors, logo) is post-v1.
