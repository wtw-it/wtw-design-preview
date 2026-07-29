# Installatie- & Verkoop-ERP

ERP voor de twee verkoop-B.V.'s — **wtw-winkel.nl** en **wtwstore.com** — los van de
bestaande ERP van wtw.nl. Draait op `/erp`.

Eén app met een bedrijfs-switch linksboven: alle producten, klanten, offertes en
orders hangen aan een `company`. Je onderhoudt het systeem één keer, maar de
data van beide B.V.'s blijft strikt gescheiden — ook in de database, via RLS.

## Vormgeving

Volgt het bestaande bedrijfssysteem van wtw.nl: donkergroen (`--color-brand-*`,
header `#146C43`), mobile-first met bottom-tabs en een drawer met groepen
DAGELIJKS / ADMINISTRATIE / MAGAZIJN / INSTELLINGEN, bedrijfskiezer linksboven
in de kopbalk, begroetings-hero op het dashboard en statkaarten met groene
bovenrand. De design-preview-schermen houden hun eigen lichtere palet.

## Schermen

| Scherm | Wat het doet |
|---|---|
| Dashboard | Begroeting, open offertes, ritten vandaag, voorraadsignaal, snelacties |
| **Master chat** | Offerte intypen in gewone taal; Claude zoekt artikelen en klanten op en stelt de regels voor |
| Offertes | Lijst + detail, statusflow concept → verstuurd → akkoord (akkoord maakt direct een order) |
| Orders | Webshop- en installatie-orders, status, planning en bezorger |
| Planning | Agenda per dag met adres en bezorger; ongeplande orders direct inplannen |
| Producten | Catalogus met inkoop, verkoop, marge, voorraad en webshop-id |
| Voorraad | Voorraadwaarde, minimum-signalering, bijbestellen per leverancier |
| Klanten | Particulier/zakelijk, met bron (webshop, offerte, telefoon) |
| Leveranciers | Econox, Wasco, Technische Unie — korting, levertijd, bestelroute |
| Bezorgers | Freightways Katwijk — tarieven, rayon, ingeplande ritten |
| Koppelingen | WooCommerce-status per webshop, met verbindingstest |

## Master chat

`POST /api/erp/chat` — streamt via SSE. De client stuurt een snapshot van de
data van het actieve bedrijf mee; Claude (`claude-opus-5`) krijgt drie tools:

- `zoek_producten` — echte SKU's en prijzen in plaats van gokwerk
- `zoek_klant` — voorkomt dubbele klanten
- `stel_offerte_voor` — het voorstel verschijnt als kaart in de UI

De chat schrijft **niets** weg. Een offerte ontstaat pas als je op
"Vastleggen als concept" klikt. Zet `ANTHROPIC_API_KEY` om hem te activeren;
zonder sleutel blijft de rest van de ERP gewoon werken.

## Webshop-koppeling

`GET /api/erp/woocommerce?company=…&actie=status|orders|producten` en
`POST` om prijs + voorraad naar de shop te duwen. Sleutels komen uit de
omgeving (zie `.env.example`) en staan nooit in de code of database.

Standaardrichting per shop: producten en voorraad van ERP → shop, orders van
shop → ERP.

**Nog te doen aan jouw kant:** in elke WooCommerce onder *Instellingen →
Geavanceerd → REST API* een sleutel met lees/schrijf-rechten aanmaken en de
`WOO_*`-vars invullen. Daarna toont "Test verbinding" op /erp/koppelingen groen
en zet ik de order-webhook aan.

## Data

Nu: seed-data in `src/lib/erp/seed.ts`, wijzigingen blijven in localStorage
staan. Zo werkt alles zonder database.

Straks: `supabase/schema.sql` is het volledige Postgres-schema, inclusief
`company_members` + RLS-policies zodat een medewerker alleen zijn bedrijven
ziet. `ErpData` in `src/lib/erp/types.ts` heeft dezelfde vorm als de tabellen —
alleen het laden en schrijven verandert.

## Ideeën voor de volgende ronde

- **Inkooporders** — voorraad onder minimum automatisch bundelen per
  leverancier (Econox portal, Wasco EDI, TU portal) en als bestelling versturen.
- **Ritplanning** — orders per dag naar Freightways met een adressenlijst en
  tijdvak, in plaats van los bellen.
- **Marge-alarm** — signaal wanneer een inkoopprijs stijgt en de webshopprijs
  achterblijft; nu zie je dat pas achteraf.
- **Facturatie-koppeling** — order → factuur naar de boekhouding, per B.V.
  gescheiden.
- **Onderdelen-abonnement** — filtersets zijn een terugkerende verkoop; een
  halfjaarlijkse herinnering per klant is bijna gratis omzet.
