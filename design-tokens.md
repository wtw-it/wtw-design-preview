# WTW Design Tokens

Gegenereerd voor `wtw-design-preview`. Bron-definities in `src/app/globals.css` onder `@theme`.
Apple × Stripe in WTW-stijl: ademruimte, soft shadows, data-scherpte.

---

## Kleurpalet

### WTW-groen (primary, met zachte gloed-varianten)
| Token | Hex | Gebruik |
|---|---|---|
| `wtw-50`  | `#ECFDF5` | Hover-/selected-tints, ISDE-callout |
| `wtw-100` | `#D1FAE5` | Watermark, soft-borders |
| `wtw-200` | `#A7F3D0` | Callout-borders |
| `wtw-300` | `#6EE7B7` | — |
| `wtw-400` | `#34D399` | Glow-blur effect |
| `wtw-500` | `#10B981` | Border selected-state |
| `wtw-600` | `#059669` | **Primary** — CTA-knoppen, primary text |
| `wtw-700` | `#047857` | Hover op primary, headings-accent |
| `wtw-800` | `#065F46` | — |
| `wtw-900` | `#064E3B` | — |

**Glow**: `--color-wtw-glow: rgba(16, 185, 129, 0.18)` — `box-shadow` voor selected-cards en focus-states.

### Ink (tekst + UI — niet pure black, beter leesbaar)
| Token | Hex | Gebruik |
|---|---|---|
| `ink-900` | `#0A0A0B` | Headings, harde nadruk |
| `ink-800` | `#1A1A1C` | Body-tekst |
| `ink-700` | `#2D2D32` | Secondary headings |
| `ink-600` | `#5C5C66` | Body secondary, sub-tekst |
| `ink-500` | `#8C8C99` | Muted labels, captions |
| `ink-400` | `#B8B8C2` | Placeholder, disabled |
| `ink-300` | `#D8D8DD` | Borders heavy |
| `ink-200` | `#ECECEE` | Borders light, dividers |
| `ink-100` | `#F5F5F7` | Card-bg (Apple-stijl) |
| `ink-50`  | `#FAFAFB` | Page-bg subtiel |

---

## Typografie

**Font**: Inter via `next/font/google`, fallback `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`.

**Features**: `cv11`, `ss01`, `kern` ingeschakeld voor strakker letter-beeld. `.tabular` utility voor cijfer-uitlijning.

**Schaal** (6 levels):
| Level | Size | Weight | Use |
|---|---|---|---|
| Display | 48–64px | 700 | Hero-bedragen, page-title |
| H1 | 36–48px | 700 | Page heading |
| H2 | 28–32px | 600–700 | Section heading |
| H3 | 18–20px | 600 | Card heading |
| Body | 14–16px | 400–500 | Lopende tekst |
| Caption | 11–12px | 400–600 | Labels, meta |

Letter-spacing: `tracking-tight` (-0.01em) op alles boven 24px.

---

## Spacing

Tailwind default + semantische tokens:
- `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96`
- `--spacing-section: 96px` — tussen secties
- `--spacing-gutter: 24px` — horizontale page-padding

---

## Border radius

| Token | px | Use |
|---|---|---|
| `--radius-sm` | 8 | Tiny pills, input-edges |
| `--radius-md` | 12 | Cards, inputs, buttons |
| `--radius-lg` | 16 | Hero-cards, modals |
| `rounded-2xl` (16) | 16 | Standard card |
| `rounded-3xl` (24) | 24 | Hero bedrag-card |
| `rounded-full` | ∞ | Pill toggles, icon-circles |

---

## Shadows

Apple-soft, geen materials:
- `--shadow-sm`: `0 1px 2px rgba(10,10,11,0.04)` — subtle button hover
- `--shadow-md`: `0 1px 3px rgba(10,10,11,0.05), 0 4px 10px -4px rgba(10,10,11,0.04)` — cards
- `--shadow-lg`: `0 2px 4px rgba(10,10,11,0.05), 0 12px 32px -12px rgba(10,10,11,0.10)` — hero-cards, hover-lift
- `--shadow-glow`: `0 0 0 4px var(--color-wtw-glow)` — focus-ring
- `--shadow-glow-strong`: `0 0 0 6px var(--color-wtw-glow), 0 8px 24px -8px rgba(16,185,129,0.30)` — selected card

---

## Iconography

- **Lucide-react**, outline-only
- **Stroke-width: 1.5** standaard (Apple-feel)
- **Sizes**: 14 / 16 / 20 / 24 / 36 / 44px
- **Strokes always rounded** (Lucide default)
- **No fills** — alleen outlines

Voorkeursicoonset voor trust-strip: `ShieldCheck`, `Wallet`, `MapPin`, `Award`.

---

## Micro-interactions

- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` overal (CSS `transition-timing-function: *`)
- Hover-lift: `transform: translateY(-1px)` + shadow-lg upgrade (200ms)
- Focus-ring: 4px ring met `--shadow-glow`
- Selected-state: `card-glow-selected` utility class — border + spread shadow

---

## Wat bewust anders dan productie wtw.nl

| Productie | Preview |
|---|---|
| Vol-breedte groene CTA-banners | Smalle CTAs (max 320px in mail, 400px op pages), gecentreerd |
| Pure white + emerald | Drie-laags ink-grijs voor zachte hiërarchie |
| Decoratieve arrows + shapes (uit live) | Geen — alleen Lucide outline icons |
| Materials-shadows | Apple soft-shadows (zelden zichtbaar, geen "elevation") |
| Tracking-wider op uppercase headers | Geen letter-spacing op caps (rustige typografie) |
| Volle groen-vlakken | Glow-effect (blur + soft border) op selected/hero |
| Photo-cards | Geometrische Lucide-icons (`Wind`/`Gauge`/`Activity` voor Q350/450/600) |

---

## Adoption-strategie

Tokens kunnen 1-op-1 worden overgenomen naar `wtw-website/src/app/globals.css` zodra dit ontwerp goedgekeurd is. Component-patterns (card-glow-selected, hover-lift, pill-toggle, stepper, device-frame, watermark) zijn drop-in herbruikbaar.
