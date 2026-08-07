/**
 * Eén bericht met meerdere opdrachten.
 *
 * Wat er misging: het bericht had twee opdrachten, de eerste ging naar planning,
 * de tweede liep vast — en alleen die tweede kwam in beeld. Wat er met de eerste
 * gebeurd was, was niet te zien.
 *
 * Drie regels:
 *  - elk deel wordt uitgevoerd en elk deel krijgt een antwoord;
 *  - struikelt er één, dan gaan de andere gewoon door;
 *  - de volgorde blijft de volgorde van de gebruiker.
 *
 * De ontleding zit hier NIET in: die doet `splitsCodetaal` al. Geef de delen
 * die daar uitkomen door aan `voerAlleOpdrachtenUit`.
 */

export type DeelStatus = 'gelukt' | 'mislukt' | 'navraag';

export interface DeelResultaat<T = unknown> {
    /** Positie in het bericht, 0-gebaseerd. De volgorde blijft de zijne. */
    index: number;
    /** Het stukje codetaal waar dit resultaat bij hoort. */
    invoer: string;
    status: DeelStatus;
    /** Eén regel voor op de telefoon. */
    antwoord: string;
    data?: T;
    /** Alleen bij mislukt: wat er misging, in één zin. */
    fout?: string;
}

export interface Uitvoering<T> {
    antwoord: string;
    data?: T;
    /** Zet dit als je iets moet navragen; het deel telt dan niet als mislukt. */
    navraag?: boolean;
}

/**
 * Voert alle delen uit, op volgorde, en geeft er precies evenveel resultaten
 * voor terug als er delen waren. Een deel dat gooit stopt de rij niet.
 *
 * Bewust serieel: "klant, dan offerte, dan mail" moet in die volgorde, want
 * het tweede deel leunt vaak op het eerste.
 */
export async function voerAlleOpdrachtenUit<T>(
    delen: string[],
    uitvoer: (deel: string, index: number) => Promise<Uitvoering<T>>,
): Promise<DeelResultaat<T>[]> {
    const resultaten: DeelResultaat<T>[] = [];

    for (const [index, deel] of delen.entries()) {
        try {
            const uitkomst = await uitvoer(deel, index);
            resultaten.push({
                index,
                invoer: deel,
                status: uitkomst.navraag ? 'navraag' : 'gelukt',
                antwoord: uitkomst.antwoord,
                data: uitkomst.data,
            });
        } catch (fout) {
            resultaten.push({
                index,
                invoer: deel,
                status: 'mislukt',
                antwoord: korteFout(fout),
                fout: korteFout(fout),
            });
        }
    }

    return resultaten;
}

/** Eén zin: wat er misging. Geen stacktrace op een telefoonscherm. */
export function korteFout(fout: unknown): string {
    if (fout instanceof Error) return fout.message;
    if (typeof fout === 'string') return fout;
    return 'Onbekende fout';
}

const TEKEN: Record<DeelStatus, string> = {
    gelukt: '✓',
    navraag: '?',
    mislukt: '×',
};

/**
 * Alles onder elkaar, één regel per opdracht, in de volgorde van het bericht.
 * Zo is in één blik te zien wat er met élk onderdeel gebeurd is — ook met de
 * onderdelen die het wel deden.
 */
export function stelAntwoordSamen(resultaten: DeelResultaat[]): string {
    if (resultaten.length === 0) return '';
    if (resultaten.length === 1) return resultaten[0].antwoord;

    return resultaten
        .map((r) => `${TEKEN[r.status]} ${r.antwoord}`)
        .join('\n\n');
}

/** Voor de log en voor een korte kop boven het antwoord. */
export function telResultaten(resultaten: DeelResultaat[]) {
    return {
        totaal: resultaten.length,
        gelukt: resultaten.filter((r) => r.status === 'gelukt').length,
        navraag: resultaten.filter((r) => r.status === 'navraag').length,
        mislukt: resultaten.filter((r) => r.status === 'mislukt').length,
    };
}
