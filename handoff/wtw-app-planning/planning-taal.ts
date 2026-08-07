/**
 * Codetaal omzetten naar een planningsopdracht.
 *
 * Twee regels die hier hard in zitten:
 *  - dag, tijd en team komen ALTIJD van de gebruiker. Staat het er niet, dan
 *    komt het in `ontbreekt` te staan en wordt het nagevraagd — nooit ingevuld.
 *  - een weekdag wordt omgerekend naar een datum, maar dat gebeurt zichtbaar:
 *    `dagBron` houdt vast wat er getypt is, zodat het antwoord kan tonen welke
 *    datum eruit kwam. Klopt de weekdag niet bij de datum, dan is dat een
 *    tegenspraak en wordt er niets gekozen.
 */

import { normaliseer, zoekTeam, type Team } from './routeer';

export type PlanningActie = 'PLANNEN' | 'VERZETTEN' | 'TEAM_ERAF' | 'ANNULEREN' | 'OPVRAGEN';

export interface PlanningOpdracht {
    actie: PlanningActie;
    team?: Team;
    /** ISO-datum (YYYY-MM-DD). Alleen gevuld als de gebruiker een dag gaf. */
    dag?: string;
    /** Wat de gebruiker letterlijk typte, bijv. "donderdag 13 augustus". */
    dagBron?: string;
    /** Doeldatum bij verzetten. */
    naarDag?: string;
    naarDagBron?: string;
    /** HH:MM, alleen als de gebruiker een tijd gaf. */
    tijd?: string;
    /** Ruwe klantnaam; het opzoeken van adres en telefoon gebeurt elders. */
    klant?: string;
    /** Wat je in één zin moet navragen voordat je iets doet. */
    ontbreekt: string[];
    /** Tegenspraak in het bericht, bijv. een weekdag die niet bij de datum past. */
    tegenspraak?: string;
}

const WEEKDAGEN = [
    'zondag',
    'maandag',
    'dinsdag',
    'woensdag',
    'donderdag',
    'vrijdag',
    'zaterdag',
];

const MAANDEN = [
    'januari',
    'februari',
    'maart',
    'april',
    'mei',
    'juni',
    'juli',
    'augustus',
    'september',
    'oktober',
    'november',
    'december',
];

interface DagTreffer {
    iso: string;
    bron: string;
    /** Positie in de genormaliseerde tekst, om "van X naar Y" te ordenen. */
    positie: number;
    tegenspraak?: string;
}

function isoVan(d: Date): string {
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(
        d.getUTCDate(),
    ).padStart(2, '0')}`;
}

/**
 * Alle dagaanduidingen in de tekst, op volgorde van voorkomen.
 *
 * Herkent: "13 augustus", "donderdag 13 augustus", "donderdag", "13-08",
 * "13-08-2026", "vandaag", "morgen", "overmorgen", "volgende week donderdag".
 */
export function zoekDagen(tekst: string, vandaagIso: string): DagTreffer[] {
    const t = normaliseer(tekst);
    const vandaag = new Date(`${vandaagIso}T00:00:00Z`);
    const treffers: DagTreffer[] = [];

    // 1. Dag + maand, eventueel met weekdag ervoor: "(donderdag) 13 augustus (2026)"
    const maandNamen = MAANDEN.join('|');
    const metMaand = new RegExp(
        `(?:(${WEEKDAGEN.join('|')})\\s+)?(\\d{1,2})\\s+(${maandNamen})(?:\\s+(\\d{4}))?`,
        'g',
    );
    for (const m of t.matchAll(metMaand)) {
        const [heel, weekdag, dagStr, maandNaam, jaarStr] = m;
        const maand = MAANDEN.indexOf(maandNaam);
        const jaar = jaarStr ? Number(jaarStr) : vandaag.getUTCFullYear();
        const datum = new Date(Date.UTC(jaar, maand, Number(dagStr)));

        // Geen jaar genoemd en de datum is al ruim voorbij? Dan bedoelt hij volgend jaar.
        if (!jaarStr && datum.getTime() < vandaag.getTime() - 180 * 864e5) {
            datum.setUTCFullYear(jaar + 1);
        }

        let tegenspraak: string | undefined;
        if (weekdag && WEEKDAGEN[datum.getUTCDay()] !== weekdag) {
            tegenspraak = `${dagStr} ${maandNaam} is geen ${weekdag} maar een ${
                WEEKDAGEN[datum.getUTCDay()]
            }`;
        }

        treffers.push({ iso: isoVan(datum), bron: heel.trim(), positie: m.index ?? 0, tegenspraak });
    }

    // 2. Numerieke datum: "13-08" of "13-08-2026" (na normalisatie: "13 08")
    const numeriek = /\b(\d{1,2}) (\d{1,2})(?: (\d{4}))?\b/g;
    for (const m of t.matchAll(numeriek)) {
        if (treffers.some((tr) => overlapt(tr, m.index ?? 0, m[0].length))) continue;
        const [heel, dagStr, maandStr, jaarStr] = m;
        const maand = Number(maandStr) - 1;
        if (maand < 0 || maand > 11 || Number(dagStr) > 31) continue;
        const jaar = jaarStr ? Number(jaarStr) : vandaag.getUTCFullYear();
        const datum = new Date(Date.UTC(jaar, maand, Number(dagStr)));
        treffers.push({ iso: isoVan(datum), bron: heel.trim(), positie: m.index ?? 0 });
    }

    // 3. Losse weekdag: eerstvolgende vanaf vandaag. "volgende week donderdag" telt er 7 bij.
    const losseWeekdag = new RegExp(`(volgende week\\s+)?(${WEEKDAGEN.join('|')})`, 'g');
    for (const m of t.matchAll(losseWeekdag)) {
        if (treffers.some((tr) => overlapt(tr, m.index ?? 0, m[0].length))) continue;
        const doel = WEEKDAGEN.indexOf(m[2]);
        let verschil = (doel - vandaag.getUTCDay() + 7) % 7;
        if (m[1]) verschil += 7;
        const datum = new Date(vandaag.getTime() + verschil * 864e5);
        treffers.push({ iso: isoVan(datum), bron: m[0].trim(), positie: m.index ?? 0 });
    }

    // 4. Vandaag, morgen, overmorgen.
    const relatief: Record<string, number> = { vandaag: 0, morgen: 1, overmorgen: 2 };
    for (const [woord, dagen] of Object.entries(relatief)) {
        const idx = ` ${t} `.indexOf(` ${woord} `);
        if (idx === -1) continue;
        if (treffers.some((tr) => overlapt(tr, idx, woord.length))) continue;
        treffers.push({
            iso: isoVan(new Date(vandaag.getTime() + dagen * 864e5)),
            bron: woord,
            positie: idx,
        });
    }

    return treffers.sort((a, b) => a.positie - b.positie);
}

function overlapt(treffer: DagTreffer, positie: number, lengte: number): boolean {
    const eind = treffer.positie + treffer.bron.length;
    return positie < eind && positie + lengte > treffer.positie;
}

/** Eerste tijd in de tekst: "08:30", "8.30", "8u30", "half 9" wordt niet geraden. */
export function zoekTijd(tekst: string): string | undefined {
    const m = tekst.match(/\b(\d{1,2})\s*[:.u]\s*(\d{2})\b/);
    if (!m) return undefined;
    const uur = Number(m[1]);
    const minuut = Number(m[2]);
    if (uur > 23 || minuut > 59) return undefined;
    return `${String(uur).padStart(2, '0')}:${String(minuut).padStart(2, '0')}`;
}

/**
 * De klantnaam achter "bij", "voor" of "naar". Datum, tijd en teamnaam worden
 * er eerst uitgeknipt, zodat "bij Cees donderdag" alleen "Cees" oplevert.
 */
export function zoekKlant(tekst: string, teams: Team[], dagen: DagTreffer[]): string | undefined {
    let rest = tekst;
    for (const dag of dagen) rest = rest.replace(new RegExp(dag.bron, 'i'), ' ');
    const team = zoekTeam(tekst, teams);
    if (team) {
        for (const naam of [team.naam, ...(team.aliassen ?? [])]) {
            rest = rest.replace(new RegExp(`\\b${naam}\\b`, 'gi'), ' ');
        }
    }
    rest = rest.replace(/\b\d{1,2}\s*[:.u]\s*\d{2}\b/g, ' ');

    const m = rest.match(/\b(?:bij|voor|naar)\s+([A-Za-zÀ-ÿ][\wÀ-ÿ'.-]*(?:\s+[A-Za-zÀ-ÿ][\wÀ-ÿ'.-]*)?)/);
    if (!m) return undefined;

    const kandidaat = m[1].trim().replace(/\s+(de|het|een|op|om|van)$/i, '').trim();
    return kandidaat || undefined;
}

/** Welke actie wordt er gevraagd? Null als het geen planningsopdracht is. */
function bepaalActie(genormaliseerd: string): PlanningActie | null {
    const heeft = (...woorden: string[]) =>
        woorden.some((w) => ` ${genormaliseerd} `.includes(` ${w} `));

    if (heeft('wie', 'welke') && heeft('staat', 'staan', 'ingepland', 'gepland', 'planning')) {
        return 'OPVRAGEN';
    }
    if (heeft('verzet', 'verplaats', 'verschuif') || (heeft('van') && heeft('naar'))) {
        return 'VERZETTEN';
    }
    if (heeft('gaat niet door', 'afzeggen', 'annuleer', 'annuleren', 'geannuleerd', 'vervalt')) {
        return 'ANNULEREN';
    }
    if (heeft('haal', 'haalt') && heeft('af', 'eraf', 'uit', 'weg')) {
        return heeft('planning') && !heeft('haal') ? 'ANNULEREN' : 'TEAM_ERAF';
    }
    // Bewust smal: "stuur" en "boek" horen hier niet bij, anders wordt
    // "stuur de factuur" een planningsopdracht.
    if (heeft('zet', 'plan', 'inplannen', 'inplan', 'plannen')) {
        return 'PLANNEN';
    }
    return null;
}

/**
 * Ontleedt één opdracht. Geeft null als het geen planningsopdracht is —
 * dan hoort het bericht ergens anders thuis.
 */
export function ontleedPlanningOpdracht(
    tekst: string,
    teams: Team[],
    vandaagIso: string,
): PlanningOpdracht | null {
    const genormaliseerd = normaliseer(tekst);
    const actie = bepaalActie(genormaliseerd);
    if (!actie) return null;

    const dagen = zoekDagen(tekst, vandaagIso);
    const team = zoekTeam(tekst, teams);
    const tijd = zoekTijd(tekst);
    const klant = zoekKlant(tekst, teams, dagen);
    const tegenspraak = dagen.find((d) => d.tegenspraak)?.tegenspraak;

    // "zet" alleen is te weinig: zonder team, dag of tijd gaat dit bericht
    // ergens anders over ("zet de offerte erbij"). Niet raden, teruggeven.
    if (actie === 'PLANNEN' && !team && dagen.length === 0 && !tijd) {
        return null;
    }

    const opdracht: PlanningOpdracht = {
        actie,
        team,
        tijd,
        klant,
        ontbreekt: [],
        tegenspraak,
    };

    if (actie === 'VERZETTEN') {
        // "verzet Clinton van donderdag naar vrijdag": eerste dag is de bron,
        // tweede de bestemming. Staat er maar één dag, dan is dat de bestemming.
        if (dagen.length >= 2) {
            opdracht.dag = dagen[0].iso;
            opdracht.dagBron = dagen[0].bron;
            opdracht.naarDag = dagen[1].iso;
            opdracht.naarDagBron = dagen[1].bron;
        } else if (dagen.length === 1) {
            opdracht.naarDag = dagen[0].iso;
            opdracht.naarDagBron = dagen[0].bron;
        }
    } else if (dagen.length >= 1) {
        opdracht.dag = dagen[0].iso;
        opdracht.dagBron = dagen[0].bron;
    }

    // Wat er ontbreekt wordt gevraagd, niet ingevuld.
    if (actie === 'PLANNEN') {
        if (!team) opdracht.ontbreekt.push('welk team');
        if (!opdracht.dag) opdracht.ontbreekt.push('welke dag');
        if (!klant) opdracht.ontbreekt.push('bij welke klant');
    }
    if (actie === 'VERZETTEN' && !opdracht.naarDag) opdracht.ontbreekt.push('naar welke dag');
    if (actie === 'TEAM_ERAF') {
        if (!team) opdracht.ontbreekt.push('welk team');
        if (!opdracht.dag) opdracht.ontbreekt.push('welke dag');
    }
    if (actie === 'ANNULEREN' && !klant && !opdracht.dag) {
        opdracht.ontbreekt.push('welke klus');
    }
    if (actie === 'OPVRAGEN' && !opdracht.dag) opdracht.ontbreekt.push('welke dag');

    return opdracht;
}
