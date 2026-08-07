/**
 * De teamlijst uit Firestore, vertaald naar wat de routering nodig heeft.
 *
 * Bron: collectie `planning_teams`, opgehaald met `listTeams()` uit
 * `src/lib/planning-store.ts`. Er wordt hier geen nieuwe lijst gemaakt en niets
 * gedupliceerd — dit is alleen een vormvertaling, zodat `routeer.ts` niets van
 * Firestore hoeft te weten en los te testen blijft.
 */

import type { Team } from './routeer';

/** Zoals een team in `planning_teams` staat. */
export interface PlanningTeam {
    id: string;
    /** De chef. Dit is de naam die in codetaal getypt wordt: "Clinton". */
    chef: string;
    /** De tweede man, als het team er een heeft. */
    hulpje?: string | null;
    /** Voor de kleur in de planning; niet gebruikt bij het routeren. */
    kleur?: string | null;
    /** Voor de monteurspagina; niet gebruikt bij het routeren. */
    token?: string | null;
}

/**
 * Eén team omzetten.
 *
 * De chef is de identiteit — dat is de naam die getypt wordt. Het hulpje komt
 * er als alias bij: wordt díe naam genoemd, dan is het net zo goed werkplanning
 * en wijst het naar hetzelfde team. Wil je dat niet, laat `hulpje` dan weg uit
 * `aliassen` — de routering blijft verder gelijk.
 */
export function alsTeam(team: PlanningTeam): Team {
    const aliassen = [team.hulpje].filter(
        (naam): naam is string => typeof naam === 'string' && naam.trim().length > 0,
    );

    return {
        id: team.id,
        naam: team.chef,
        ...(aliassen.length > 0 ? { aliassen } : {}),
    };
}

/**
 * De hele lijst omzetten. Teams zonder chefnaam vallen eruit: zonder naam valt
 * er niets op te zoeken, en een lege naam zou op elk bericht matchen.
 */
export function alsTeams(teams: PlanningTeam[]): Team[] {
    return teams
        .filter((team) => typeof team.chef === 'string' && team.chef.trim().length > 0)
        .map(alsTeam);
}
