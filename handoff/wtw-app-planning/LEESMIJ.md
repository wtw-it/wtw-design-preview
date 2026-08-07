# Monteursplanning — de keuze, de foutisolatie en de dagvraag

Vijf bestanden om in `wtw-app-live` te laten vallen, plus tests. Ze zijn
dependency-vrij: geen imports uit jouw codebase, dus ze breken niets bij het
neerzetten. Er is **geen nieuwe agent** bijgekomen en `splitsCodetaal` is niet
aangeraakt — die blijft doen wat hij doet.

| Bestand | Wat het doet |
|---|---|
| `routeer.ts` | De keuze tussen werkplanning en klantafspraak, plus de grens naar de klantagenda |
| `teams.ts` | `planning_teams` → de vorm die de routering nodig heeft |
| `planning-taal.ts` | Codetaal → dag, tijd, team, klant, actie |
| `opdrachten.ts` | Meerdere opdrachten in één bericht, met foutisolatie |
| `antwoord.ts` | De antwoordregels voor 390 px |

Tests: `node --test` na compileren, of via jouw testrunner. 40 tests, allemaal groen.

---

## 1. De keuze repareren

Het ging mis bij het kiezen, niet bij het uitvoeren. `kiesRoute` doet die keuze
als **opzoeking**: staat de naam in de teamlijst, dan is het planning. Er wordt
niets gewogen.

Zet dit vóór de bestaande routering in `register.ts`:

```ts
import { listTeams } from '@/lib/planning-store';        // bestaand
import { kiesRoute, magKlantagendaRaadplegen } from './planning/routeer';
import { alsTeams } from './planning/teams';

const teams = alsTeams(await listTeams());               // uit planning_teams

const besluit = kiesRoute(deel, teams);

if (besluit.route === 'PLANNING') return PLANNING;
if (besluit.route === 'AFSPRAAK') return AFSPRAAK;
// ONBEKEND: laat de bestaande router beslissen, precies zoals nu.
```

Die laatste regel is met opzet zo: de module beslist alleen als hij zeker is,
dus alle andere routes (offerte, mail, klant) blijven lopen zoals ze liepen.

`alsTeams` is puur een vormvertaling van `planning_teams`. De **chef** wordt de
naam waarop gezocht wordt — dat is wat je typt — en het **hulpje** komt er als
alias bij, zodat ook diens naam naar hetzelfde team wijst. `kleur` en `token`
blijven buiten de routering. Wil je het hulpje níet laten meetellen, haal
`aliassen` dan uit `alsTeam` weg; de rest blijft gelijk. `listTeams()` blijft de
enige bron — er wordt hier niets gedupliceerd en niets gecachet.

**En de tweede helft van de bug** — het zoeken in de klantagenda naar iets dat
werkplanning is. Zet in de agenda-agent, vóór hij gaat zoeken:

```ts
if (!magKlantagendaRaadplegen(besluit)) {
    throw new Error('Dit is werkplanning, geen klantafspraak — niet in de klantagenda gezocht.');
}
```

Dat is wat er bij Cees gebeurde: een prullenbak-melding terwijl er niets mis was.

**De test die het vasthoudt** staat in `routeer.test.ts` en gebruikt het bericht
dat de fout blootlegde:

```
zet Clinton donderdag 13 augustus 08:30 bij Cees  →  PLANNING
                                                  →  klantagenda: verboden
```

Verschuift iemand de routering later, dan valt die test om. Er staat ook een
test die elk team uit de lijst afzonderlijk langsloopt, zodat een nieuw team
niet stilletjes buiten de regel valt.

---

## 2. Eén bericht, meerdere opdrachten

`voerAlleOpdrachtenUit` neemt de delen die uit **jouw** `splitsCodetaal` komen:

```ts
import { voerAlleOpdrachtenUit, stelAntwoordSamen } from './planning/opdrachten';

const delen = splitsCodetaal(bericht);          // bestaand, ongewijzigd

const resultaten = await voerAlleOpdrachtenUit(delen, async (deel) => {
    const besluit = kiesRoute(deel, teams);
    const uitkomst = await bestaandeUitvoering(deel, besluit);
    return { antwoord: uitkomst.tekst };
});

return stelAntwoordSamen(resultaten);
```

Drie dingen liggen daarmee vast: elk deel krijgt een antwoord, een deel dat
struikelt stopt de rij niet, en de volgorde blijft jouw volgorde (serieel —
"klant, dan offerte, dan mail" leunt op elkaar).

Zo ziet het eruit als het tweede deel vastloopt:

```
✓ Clinton — do 13 aug 08:30
Cees Bakker · Katwijk

× Geen afspraak bij Cees Bakker om af te zeggen. Gekeken in zijn klantagenda, 10–17 augustus.
```

Het eerste deel blijft staan. Dat was het punt.

---

## 3. Wat je nu kunt vragen

`ontleedPlanningOpdracht` herkent vijf acties. De laatste is nieuw:

| Jij typt | Actie |
|---|---|
| `zet Clinton donderdag 13 augustus 08:30 bij Cees` | `PLANNEN` |
| `verzet Clinton van donderdag naar vrijdag` | `VERZETTEN` |
| `haal Rami er donderdag af` | `TEAM_ERAF` |
| `Cees gaat niet door, haal hem uit de planning` | `ANNULEREN` |
| **`wie staat er donderdag ingepland`** | **`OPVRAGEN`** |

Antwoord op die laatste:

```
donderdag 13 augustus — 2 klussen
08:30 Clinton · Cees Bakker, Katwijk
13:00 Moncif · Fam. de Wit, Leiden
```

`toonDag(dag, klussen)` maakt die lijst; de klussen haal je uit je eigen
planning-opslag.

---

## 4. Wat de module nooit doet

- **Geen dag verzinnen.** Staat er geen dag, dan komt `'welke dag'` in
  `ontbreekt` en vraag je het na met `vraagNa(...)` — één zin, geen formulier.
- **Geen team kiezen.** Zelfde verhaal.
- **Niet gokken bij tegenspraak.** "vrijdag 13 augustus" terwijl dat een
  donderdag is, levert `tegenspraak` op in plaats van een keuze.
- **Niet raden welke route.** Twijfel → `ONBEKEND` → jouw bestaande router.

Een weekdag wordt wél omgerekend naar een datum — dat moet, anders is er niets
op te slaan. Dat gebeurt zichtbaar: `dagBron` houdt vast wat je typte, en het
antwoord toont de datum die eruit kwam ("do 13 aug"), zodat je het ziet.

**"donderdag" is de eerstvolgende donderdag, en op donderdag is dat vandaag.**
Alleen "volgende week donderdag" schuift een week op. Dat ligt vast in
`planning-taal.test.ts`.

---

## 5. Aanroepvolgorde bij verzetten en afzeggen

Je wilt eerst zien wat er gevonden is, dan pas de handeling:

```ts
const gevonden = await zoekKlussen(opdracht);

if (gevonden.length === 0) {
    return meldNietGevonden(
        `Geen klus van ${opdracht.team?.naam} op ${kortDatum(opdracht.dag)}`,
        'de planning van 10–17 augustus',        // zeg waar je hebt gekeken
    );
}

const aankondiging = kondigAan(opdracht, gevonden);   // eerst tonen
await voerUit(opdracht, gevonden);                    // dan doen
```

`meldNietGevonden` dwingt het tweede argument af: er staat altijd bij waar er
gezocht is.

---

## Wat ik niet heb kunnen doen

Deze modules zijn geschreven zonder `wtw-app-live` te kunnen inzien — die repo
kreeg ik in deze sessie niet gekoppeld. Dat betekent concreet:

- De **aansluitpunten** hierboven beschrijf ik op gedrag, niet op regelnummer.
  De namen `register.ts`, `PLANNING`, `AFSPRAAK`, `splitsCodetaal` komen uit
  jouw opdracht; hoe ze precies aangeroepen worden heb ik niet gezien.
- De **opslag** van klussen is `planning_opdrachten` via jouw bestaande
  planning-agent. `zoekKlussen` en `voerUit` in het voorbeeld hierboven zijn
  jouw functies; daar zit niets van mij in.
- De schermafdruk is de **antwoordvorm** op 390 px in de huisstijl, echt door
  deze functies heen gehaald — geen schermafdruk van wtw-app zelf.

Zet de repo erbij en ik sluit het aan, inclusief de plek in `register.ts` en
een echte schermafdruk uit de app.
