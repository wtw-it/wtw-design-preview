# WTW Design Preview

Stand-alone visuele preview van de nieuwe richting voor het WTW offerte-systeem.
Apple-ademruimte × Stripe data-scherpte × WTW-groen.

**Niet voor klanten. Interne visualisatie alleen.**

## Schermen

1. **Configurator** — `/configurator` — Unit-cards met prijs, extras, vloer-pill, dakdoorvoer-stepper
2. **Bedankt** — `/bedankt` — Success-state met glow-icoon, bedrag-card, 4 CTAs
3. **Email** — `/email` — Email-template in device-frame, Lucide trust-iconen
4. **Akkoord** — `/akkoord` — Callback-variant met 4 tijdsblok-cards
5. **PDF** — `/pdf` — A4-mockup Stripe-stijl met watermark

## ERP (nieuw)

**`/erp`** — Installatie- & Verkoop-ERP voor wtw-winkel.nl en wtwstore.com,
los van de ERP van wtw.nl. Producten, leveranciers, bezorgers, klanten,
offertes, orders, voorraad, WooCommerce-koppeling en een master chat om
offertes in gewone taal in te typen.

Zie [`docs/erp.md`](./docs/erp.md) en [`.env.example`](./.env.example).

## Tech

- Next.js 16 · App Router
- React 19
- Tailwind CSS 4 (met `@theme` tokens in `globals.css`)
- Lucide-react (stroke-width 1.5)
- Inter via `next/font/google`

## Design tokens

Zie [`design-tokens.md`](./design-tokens.md) voor het volledige design-system.

## Dev

```bash
npm install
npm run dev
```

## Status

Preview-only. Productie-implementatie volgt na visuele goedkeuring.
