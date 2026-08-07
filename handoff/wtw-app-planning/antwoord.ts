/**
 * De antwoorden, geschreven voor 390 px en één duim.
 *
 * Wie, waar, wanneer — in één blik. Geen alinea's over wat er is overwogen.
 * Gaat er iets mis, dan één zin: wat en waarom. En bij "niets gevonden" staat
 * er altijd bij waar er gekeken is, want "ik vind niets" helpt niemand.
 */

import type { PlanningOpdracht } from './planning-taal';
import type { Team } from './routeer';

export interface Klant {
    id: string;
    naam: string;
    adres?: string;
    postcode?: string;
    plaats?: string;
    telefoon?: string;
}

export interface Klus {
    id: string;
    dag: string;
    tijd?: string;
    team: Team;
    klant: Klant;
    /** Wat er gedaan wordt, als dat uit de offerte of aanvraag blijkt. */
    omschrijving?: string;
}

const WEEKDAGEN = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
const MAANDEN = [
    'jan', 'feb', 'mrt', 'apr', 'mei', 'jun',
    'jul', 'aug', 'sep', 'okt', 'nov', 'dec',
];

/** "do 13 aug" — kort genoeg voor één regel op een telefoon. */
export function kortDatum(iso: string): string {
    const d = new Date(`${iso}T00:00:00Z`);
    return `${WEEKDAGEN[d.getUTCDay()]} ${d.getUTCDate()} ${MAANDEN[d.getUTCMonth()]}`;
}

/** "donderdag 13 augustus" — voor een kop boven een lijst. */
export function langDatum(iso: string): string {
    const d = new Date(`${iso}T00:00:00Z`);
    return d.toLocaleDateString('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: 'UTC',
    });
}

/** Adresregel zonder lege komma's als er iets ontbreekt. */
export function adresregel(klant: Klant): string {
    return [klant.adres, [klant.postcode, klant.plaats].filter(Boolean).join(' ')]
        .filter(Boolean)
        .join(', ');
}

/**
 * Wat er gaat gebeuren, vóórdat het gebeurt. Bij verzetten en afzeggen wil hij
 * eerst zien wat er gevonden is — dan pas de handeling.
 */
export function kondigAan(opdracht: PlanningOpdracht, gevonden: Klus[]): string {
    if (gevonden.length === 0) return '';

    const regels = gevonden.map(
        (k) => `${kortDatum(k.dag)}${k.tijd ? ` ${k.tijd}` : ''} · ${k.team.naam} · ${k.klant.naam}`,
    );

    const kop =
        opdracht.actie === 'VERZETTEN'
            ? `Gevonden, ik verzet ${gevonden.length === 1 ? 'deze' : 'deze'} naar ${
                  opdracht.naarDag ? kortDatum(opdracht.naarDag) : 'de nieuwe dag'
              }:`
            : opdracht.actie === 'ANNULEREN'
              ? 'Gevonden, ik haal dit uit de planning:'
              : 'Gevonden:';

    return [kop, ...regels].join('\n');
}

/** Klus ingepland. Wie, waar, wanneer — en het telefoonnummer erbij. */
export function meldIngepland(klus: Klus): string {
    const regels = [
        `${klus.team.naam} — ${kortDatum(klus.dag)}${klus.tijd ? ` ${klus.tijd}` : ''}`,
        klus.klant.naam + (adresregel(klus.klant) ? ` · ${adresregel(klus.klant)}` : ''),
    ];
    if (klus.klant.telefoon) regels.push(klus.klant.telefoon);
    if (klus.omschrijving) regels.push(klus.omschrijving);
    return regels.join('\n');
}

export function meldVerzet(klus: Klus, vanDag: string): string {
    return [
        `${klus.team.naam} — ${kortDatum(vanDag)} → ${kortDatum(klus.dag)}${
            klus.tijd ? ` ${klus.tijd}` : ''
        }`,
        klus.klant.naam + (adresregel(klus.klant) ? ` · ${adresregel(klus.klant)}` : ''),
    ].join('\n');
}

export function meldEraf(team: Team, dag: string, klant?: Klant): string {
    return `${team.naam} staat niet meer ingepland op ${kortDatum(dag)}${
        klant ? ` bij ${klant.naam}` : ''
    }`;
}

/**
 * Niets gevonden. Altijd mét de plek waar gezocht is — dat was precies wat er
 * bij Cees ontbrak.
 */
export function meldNietGevonden(wat: string, waarGezocht: string): string {
    return `${wat}. Gekeken in ${waarGezocht}.`;
}

/** De dagvraag: "wie staat er donderdag ingepland". */
export function toonDag(dag: string, klussen: Klus[]): string {
    if (klussen.length === 0) {
        return `${langDatum(dag)} — niets ingepland`;
    }

    const gesorteerd = [...klussen].sort((a, b) => (a.tijd ?? '').localeCompare(b.tijd ?? ''));
    const kop = `${langDatum(dag)} — ${klussen.length} ${
        klussen.length === 1 ? 'klus' : 'klussen'
    }`;

    const regels = gesorteerd.map((k) => {
        const plaats = k.klant.plaats ? `, ${k.klant.plaats}` : '';
        return `${k.tijd ?? '--:--'} ${k.team.naam} · ${k.klant.naam}${plaats}`;
    });

    return [kop, ...regels].join('\n');
}

/** Ontbrekende gegevens: één zin, geen formulier. */
export function vraagNa(ontbreekt: string[]): string {
    if (ontbreekt.length === 1) return `Zeg even ${ontbreekt[0]}?`;
    const laatste = ontbreekt[ontbreekt.length - 1];
    return `Zeg even ${ontbreekt.slice(0, -1).join(', ')} en ${laatste}?`;
}

/** Tegenspraak in het bericht: melden, niet kiezen. */
export function meldTegenspraak(tegenspraak: string): string {
    return `${tegenspraak}. Welke bedoel je?`;
}
