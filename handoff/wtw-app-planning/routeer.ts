/**
 * De keuze tussen klantafspraak en werkplanning.
 *
 * Dit is de reparatie van de bug: een bericht waarin een team wordt genoemd
 * ging naar de agenda-agent, die vervolgens in de klantagenda zocht naar een
 * afspraak die daar nooit heeft gestaan.
 *
 * De regel is een OPZOEKING, geen inschatting: staat de naam in de teamlijst,
 * dan is het werkplanning. Altijd. Er wordt niets gewogen en niets geraden.
 *
 * Deze module beslist alleen als hij zeker is. Weet hij het niet, dan geeft hij
 * ONBEKEND terug en houdt de bestaande router de regie — zo repareert dit de
 * keuze zonder de rest van de routering te veranderen.
 */

export type Route = 'PLANNING' | 'AFSPRAAK' | 'ONBEKEND';

export interface Team {
    id: string;
    naam: string;
    /** Bijnamen zoals ze in codetaal voorkomen, bijv. ['clint'] naast 'Clinton'. */
    aliassen?: string[];
}

export interface RouteBesluit {
    route: Route;
    /** Eén zin, bedoeld voor de log en voor de foutmelding op de telefoon. */
    reden: string;
    /** Het team dat de doorslag gaf. Alleen gevuld bij een teamtreffer. */
    team?: Team;
    /**
     * Waar is: er stond óók afspraaktaal in het bericht ("bel", "inmeten").
     * Het besluit blijft PLANNING — het team wint — maar dit is het signaal
     * om het te melden in plaats van stilzwijgend door te gaan.
     */
    botsing: boolean;
}

/** Woorden die het over de werkplanning hebben, ook zonder teamnaam. */
const PLANNINGSTAAL = [
    'planning',
    'ingepland',
    'inplannen',
    'inplan',
    'plannen',
    'klus',
    'klussen',
    'monteur',
    'monteurs',
    'ploeg',
    'team',
    'teams',
    'uitvoering',
    'montage',
];

/** Woorden die over een afspraak van de eigenaar zelf gaan. */
const AFSPRAAKTAAL = [
    'afspraak',
    'afspraken',
    'adviesgesprek',
    'advies',
    'inmeten',
    'inmeet',
    'inmeting',
    'langsgaan',
    'langskomen',
    'langs',
    'terugbellen',
    'bellen',
    'bel',
    'gebeld',
    'bezoek',
    'bezoeken',
    'kijken',
];

/**
 * Kleine letters, accenten eraf, koppeltekens naar spaties. Zo matcht
 * "Moncif" ook op "moncif" en "Rami's" op "rami".
 */
export function normaliseer(tekst: string): string {
    return tekst
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

/** Staat het woord er als heel woord in, niet als deel van een ander woord? */
function bevatWoord(genormaliseerdeTekst: string, woord: string): boolean {
    const doel = normaliseer(woord);
    if (!doel) return false;
    return ` ${genormaliseerdeTekst} `.includes(` ${doel} `);
}

/**
 * Zoekt het eerste team waarvan de naam of een alias in de tekst staat.
 * Langere namen eerst, zodat "Jan Willem" niet door "Jan" wordt weggekaapt.
 */
export function zoekTeam(tekst: string, teams: Team[]): Team | undefined {
    const genormaliseerd = normaliseer(tekst);

    const kandidaten = teams
        .flatMap((team) => [team.naam, ...(team.aliassen ?? [])].map((naam) => ({ team, naam })))
        .sort((a, b) => normaliseer(b.naam).length - normaliseer(a.naam).length);

    return kandidaten.find(({ naam }) => bevatWoord(genormaliseerd, naam))?.team;
}

/**
 * De keuze. Roep dit aan vóór de bestaande routering; is het besluit
 * ONBEKEND, laat dan de bestaande router zijn werk doen.
 */
export function kiesRoute(tekst: string, teams: Team[]): RouteBesluit {
    const genormaliseerd = normaliseer(tekst);
    const planningSignaal = PLANNINGSTAAL.some((w) => bevatWoord(genormaliseerd, w));
    const afspraakSignaal = AFSPRAAKTAAL.some((w) => bevatWoord(genormaliseerd, w));

    // 1. Teamnaam gevonden: opzoeking, geen oordeel. Dit is de reparatie.
    const team = zoekTeam(tekst, teams);
    if (team) {
        return {
            route: 'PLANNING',
            reden: `${team.naam} staat in de teamlijst, dus dit is werkplanning`,
            team,
            botsing: afspraakSignaal,
        };
    }

    // 2. Geen team, maar het gaat onmiskenbaar over de planning
    //    ("haal hem uit de planning", "wie staat er donderdag ingepland").
    if (planningSignaal && !afspraakSignaal) {
        return {
            route: 'PLANNING',
            reden: 'het bericht gaat over de planning',
            botsing: false,
        };
    }

    // 3. Afspraaktaal zonder team: dit is de agenda van de eigenaar.
    if (afspraakSignaal && !planningSignaal) {
        return {
            route: 'AFSPRAAK',
            reden: 'het bericht gaat over een afspraak',
            botsing: false,
        };
    }

    // 4. Beide of geen van beide: niet raden. De bestaande router beslist.
    return {
        route: 'ONBEKEND',
        reden: planningSignaal
            ? 'zowel planning- als afspraaktaal, en geen team genoemd'
            : 'geen team en geen duidelijk signaal',
        botsing: planningSignaal && afspraakSignaal,
    };
}

/**
 * Harde grens: bij werkplanning wordt de klantagenda niet geraadpleegd.
 * Dat is precies wat er bij Cees misging — er werd gezocht naar een afspraak
 * die er nooit is geweest, met een prullenbak-melding tot gevolg.
 *
 * Roep dit aan in de agenda-agent voordat hij gaat zoeken.
 */
export function magKlantagendaRaadplegen(besluit: RouteBesluit): boolean {
    return besluit.route !== 'PLANNING';
}
