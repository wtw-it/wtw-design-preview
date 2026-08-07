# Overdrachtsmap — hoort NIET bij deze site

Deze map bevat losse modules voor **`wtw-app`** (het ERP van wtw.nl), niet voor
de design-preview of de Installatie- & Verkoop-ERP in deze repo. Ze staan hier
alleen om ze over te dragen: de sessie op de Mac haalt ze hier op en sluit ze
aan op `~/Desktop/wtw-app-live`.

Er wordt niets uit deze map geïmporteerd door de app in deze repo, en de map
staat buiten de typecheck (`exclude` in `tsconfig.json`), zodat de build hier
niets van merkt.

**Begin bij [`LEESMIJ.md`](./LEESMIJ.md)** — daar staat wat elk bestand doet en
hoe je het aansluit op `register.ts`, de agenda-agent en `splitsCodetaal`.

## Wat het oplost

Een monteur inplannen is geen klantafspraak. Noem je een team, dan is het
werkplanning — dat is een opzoeking in `planning_teams`, geen inschatting. En
een bericht met drie opdrachten levert drie antwoorden op, ook als er één
struikelt.

## Tests draaien

```bash
cd handoff/wtw-app-planning
npx tsc --outDir dist --module commonjs --target ES2022 --strict *.ts
node --test "dist/*.test.js"
```

40 tests, allemaal groen op het moment van overdragen.
