import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { alsTeam, alsTeams, type PlanningTeam } from './teams';
import { kiesRoute } from './routeer';

const UIT_FIRESTORE: PlanningTeam[] = [
    { id: 'a', chef: 'Clinton', hulpje: 'Youssef', kleur: '#2E8B63', token: 'abc' },
    { id: 'b', chef: 'Moncif', hulpje: null, kleur: '#0A6B4F', token: 'def' },
    { id: 'c', chef: 'Rami' },
];

describe('de teamlijst uit planning_teams', () => {
    test('de chef is de naam waarop gezocht wordt', () => {
        assert.equal(alsTeam(UIT_FIRESTORE[0]).naam, 'Clinton');
        assert.equal(alsTeam(UIT_FIRESTORE[0]).id, 'a');
    });

    test('het hulpje komt erbij als alias', () => {
        assert.deepEqual(alsTeam(UIT_FIRESTORE[0]).aliassen, ['Youssef']);
    });

    test('een team zonder hulpje krijgt geen lege alias', () => {
        assert.equal(alsTeam(UIT_FIRESTORE[1]).aliassen, undefined);
        assert.equal(alsTeam(UIT_FIRESTORE[2]).aliassen, undefined);
    });

    test('kleur en token blijven buiten de routering', () => {
        assert.deepEqual(Object.keys(alsTeam(UIT_FIRESTORE[1])).sort(), ['id', 'naam']);
    });

    test('een team zonder chefnaam valt eruit', () => {
        // Een lege naam zou anders op élk bericht matchen.
        const teams = alsTeams([...UIT_FIRESTORE, { id: 'leeg', chef: '  ' }]);
        assert.equal(teams.length, 3);
        assert.ok(!teams.some((t) => t.id === 'leeg'));
    });

    test('de omgezette lijst werkt in de routering', () => {
        const teams = alsTeams(UIT_FIRESTORE);

        assert.equal(kiesRoute('zet Clinton donderdag bij Cees', teams).route, 'PLANNING');
        assert.equal(
            kiesRoute('zet Youssef donderdag bij Cees', teams).team?.id,
            'a',
            'het hulpje wijst naar het team van zijn chef',
        );
        assert.equal(kiesRoute('bel Cees donderdag terug', teams).route, 'AFSPRAAK');
    });
});
