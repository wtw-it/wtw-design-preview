# WTW Design Preview + Installatie- & Verkoop-ERP

Twee dingen in één repo:

1. **Design-preview** — visuele richting voor het WTW offerte-systeem
   (Apple-ademruimte × Stripe data-scherpte × WTW-groen). Niet voor klanten.
2. **ERP op `/erp`** — Installatie- & Verkoop-ERP voor **wtw-winkel.nl** en
   **wtwstore.com**, los van de bestaande ERP van wtw.nl, in dezelfde
   donkergroene huisstijl als het bedrijfssysteem.

## Deploy op Vercel

1. Importeer deze GitHub-repo in Vercel (framework wordt automatisch herkend:
   Next.js, geen extra instellingen nodig).
2. Zet de environment-variabelen uit [`.env.example`](./.env.example):

   | Variabele | Nodig voor | Zonder |
   |---|---|---|
   | `ANTHROPIC_API_KEY` | Master chat | ERP werkt, chat toont nette melding |
   | `WOO_WTW_WINKEL_URL` / `_KEY` / `_SECRET` | Koppeling wtw-winkel.nl | Status "niet-geconfigureerd" |
   | `WOO_WTWSTORE_URL` / `_KEY` / `_SECRET` | Koppeling wtwstore.com | Status "niet-geconfigureerd" |
   | `NEXT_PUBLIC_SUPABASE_URL` e.a. | Database (nog niet aangesloten) | App draait op seed-data + localStorage |

3. Deploy. Alles is optioneel — de app bouwt en draait ook met nul env-vars.

Daarna: [`supabase/schema.sql`](./supabase/schema.sql) op een Supabase-project
draaien zodra je van seed-data naar een echte database wilt.

## ERP-schermen

Dashboard · Master chat (offerte intypen in gewone taal) · Offertes · Orders ·
Planning · Facturen · Producten · Voorraad · Klanten · Leveranciers ·
Bezorgers · Koppelingen (WooCommerce per webshop).

De hele keten sluit: offerte → akkoord → order → geleverd → factuur → betaald.
Volledige beschrijving in [`docs/erp.md`](./docs/erp.md).

**Let op:** de BV-gegevens (KvK, btw, IBAN) in `src/lib/erp/seed.ts` zijn
placeholders tot de definitieve gegevens zijn aangeleverd.

## Preview-schermen

1. **Configurator** — `/configurator` — Unit-cards met prijs, extras, vloer-pill, dakdoorvoer-stepper
2. **Bedankt** — `/bedankt` — Success-state met glow-icoon, bedrag-card, 4 CTAs
3. **Email** — `/email` — Email-template in device-frame, Lucide trust-iconen
4. **Akkoord** — `/akkoord` — Callback-variant met 4 tijdsblok-cards
5. **PDF** — `/pdf` — A4-mockup Stripe-stijl met watermark

## Tech

- Next.js 16 · App Router · React 19
- Tailwind CSS 4 (`@theme` tokens in `globals.css`)
- Lucide-react · Inter via `next/font/google`
- Claude API (`@anthropic-ai/sdk`) voor de master chat
- WooCommerce REST v3 voor de webshop-koppeling

## Design tokens

Zie [`design-tokens.md`](./design-tokens.md). De ERP gebruikt daarnaast het
donkergroene `--color-brand-*` palet (header `#146C43`).

## Dev

```bash
npm install
npm run dev
```

Open `http://localhost:3000/erp` voor de ERP, `/configurator` voor de preview.
