import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { kiesRoute, magKlantagendaRaadplegen, zoekTeam, type Team } from './routeer';

const TEAMS: Team[] = [
    { id: 't1', naam: 'Clinton', aliassen: ['clint'] },
    { id: 't2', naam: 'Moncif' },
    { id: 't3', naam: 'Rami' },
];

describe('de keuze tussen werkplanning en klantafspraak', () => {
    /**
     * Dit is het bericht dat de fout blootlegde. Het ging naar de agenda-agent,
     * die in de klantagenda ging zoeken naar een afspraak die daar nooit stond.
     * Faalt deze test, dan is de routering verschoven en is de bug terug.
     */
    test('het bericht dat de fout blootlegde gaat naar de planning', () => {
        const besluit = kiesRoute('zet Clinton donderdag 13 augustus 08:30 bij Cees', TEAMS);

        assert.equal(besluit.route, 'PLANNING');
        assert.equal(besluit.team?.naam, 'Clinton');
        assert.equal(
            magKlantagendaRaadplegen(besluit),
            false,
            'de klantagenda mag hier niet worden geraadpleegd',
        );
    });

    test('elk team in de lijst stuurt naar de planning', () => {
        for (const team of TEAMS) {
            const besluit = kiesRoute(`zet ${team.naam} vrijdag bij Cees`, TEAMS);
            assert.equal(besluit.route, 'PLANNING', `${team.naam} hoort bij de planning`);
            assert.equal(besluit.team?.id, team.id);
        }
    });

    test('een team wint van afspraaktaal in hetzelfde bericht', () => {
        // "Ik zeg nooit Clinton als ik een adviesgesprek bedoel."
        const besluit = kiesRoute('adviesgesprek, zet Clinton er donderdag op', TEAMS);
        assert.equal(besluit.route, 'PLANNING');
        assert.equal(besluit.botsing, true, 'de botsing wordt wel gemeld');
    });

    test('een alias telt net zo goed als de teamnaam', () => {
        assert.equal(kiesRoute('clint donderdag bij Cees', TEAMS).route, 'PLANNING');
    });

    test('hoofdletters en accenten maken niet uit', () => {
        assert.equal(kiesRoute('ZET CLINTON DONDERDAG', TEAMS).route, 'PLANNING');
        assert.equal(kiesRoute('moncif donderdag', TEAMS).route, 'PLANNING');
    });

    test('een naam die alleen lijkt op een team telt niet', () => {
        // "Clintonstraat" is een adres, geen team.
        const besluit = kiesRoute('afspraak op de Clintonstraat', TEAMS);
        assert.notEqual(besluit.route, 'PLANNING');
        assert.equal(besluit.team, undefined);
    });

    test('planningtaal zonder team gaat ook naar de planning', () => {
        assert.equal(
            kiesRoute('Cees gaat niet door, haal hem uit de planning', TEAMS).route,
            'PLANNING',
        );
        assert.equal(kiesRoute('wie staat er donderdag ingepland', TEAMS).route, 'PLANNING');
    });

    test('een echte klantafspraak blijft bij de agenda', () => {
        for (const zin of [
            'bel Cees donderdag terug',
            'adviesgesprek bij Jan op dinsdag',
            'inmeten bij de familie Bakker vrijdag',
        ]) {
            const besluit = kiesRoute(zin, TEAMS);
            assert.equal(besluit.route, 'AFSPRAAK', zin);
            assert.equal(magKlantagendaRaadplegen(besluit), true);
        }
    });

    test('bij twijfel wordt er niet geraden', () => {
        const besluit = kiesRoute('stuur de offerte naar Cees', TEAMS);
        assert.equal(besluit.route, 'ONBEKEND', 'de bestaande router beslist dan');
    });

    test('een lege teamlijst laat de routering met rust', () => {
        assert.equal(kiesRoute('zet Clinton donderdag bij Cees', []).route, 'ONBEKEND');
    });

    test('de langste naam wint bij overlap', () => {
        const teams: Team[] = [
            { id: 'a', naam: 'Jan' },
            { id: 'b', naam: 'Jan Willem' },
        ];
        assert.equal(zoekTeam('zet Jan Willem donderdag in', teams)?.id, 'b');
    });
});
