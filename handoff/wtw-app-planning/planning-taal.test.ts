import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ontleedPlanningOpdracht, zoekDagen, zoekTijd } from './planning-taal';
import type { Team } from './routeer';

const TEAMS: Team[] = [
    { id: 't1', naam: 'Clinton' },
    { id: 't2', naam: 'Moncif' },
    { id: 't3', naam: 'Rami' },
];

// Maandag 10 augustus 2026 als vast "vandaag", zodat de tests niet met de klok meelopen.
const VANDAAG = '2026-08-10';

describe('codetaal ontleden', () => {
    test('zet Clinton donderdag 13 augustus 08:30 bij Cees', () => {
        const o = ontleedPlanningOpdracht(
            'zet Clinton donderdag 13 augustus 08:30 bij Cees',
            TEAMS,
            VANDAAG,
        )!;

        assert.equal(o.actie, 'PLANNEN');
        assert.equal(o.team?.naam, 'Clinton');
        assert.equal(o.dag, '2026-08-13');
        assert.equal(o.tijd, '08:30');
        assert.equal(o.klant, 'Cees');
        assert.deepEqual(o.ontbreekt, []);
    });

    test('verzet Clinton van donderdag naar vrijdag', () => {
        const o = ontleedPlanningOpdracht('verzet Clinton van donderdag naar vrijdag', TEAMS, VANDAAG)!;

        assert.equal(o.actie, 'VERZETTEN');
        assert.equal(o.team?.naam, 'Clinton');
        assert.equal(o.dag, '2026-08-13', 'de dag waar hij vandaan komt');
        assert.equal(o.naarDag, '2026-08-14', 'de dag waar hij naartoe gaat');
    });

    test('haal Rami er donderdag af', () => {
        const o = ontleedPlanningOpdracht('haal Rami er donderdag af', TEAMS, VANDAAG)!;

        assert.equal(o.actie, 'TEAM_ERAF');
        assert.equal(o.team?.naam, 'Rami');
        assert.equal(o.dag, '2026-08-13');
    });

    test('Cees gaat niet door, haal hem uit de planning', () => {
        const o = ontleedPlanningOpdracht(
            'Cees gaat niet door, haal hem uit de planning',
            TEAMS,
            VANDAAG,
        )!;

        assert.equal(o.actie, 'ANNULEREN');
    });

    test('wie staat er donderdag ingepland', () => {
        const o = ontleedPlanningOpdracht('wie staat er donderdag ingepland', TEAMS, VANDAAG)!;

        assert.equal(o.actie, 'OPVRAGEN');
        assert.equal(o.dag, '2026-08-13');
        assert.deepEqual(o.ontbreekt, []);
    });

    test('wat niet gegeven is wordt gevraagd, niet ingevuld', () => {
        const o = ontleedPlanningOpdracht('zet Clinton in bij Cees', TEAMS, VANDAAG)!;

        assert.equal(o.dag, undefined, 'er wordt geen dag uitgerekend');
        assert.deepEqual(o.ontbreekt, ['welke dag']);
    });

    test('zonder team wordt er geen team gekozen', () => {
        const o = ontleedPlanningOpdracht('zet donderdag iemand bij Cees', TEAMS, VANDAAG)!;

        assert.equal(o.team, undefined);
        assert.ok(o.ontbreekt.includes('welk team'));
    });

    test('een weekdag die niet bij de datum past wordt gemeld, niet opgelost', () => {
        // 13 augustus 2026 is een donderdag, geen vrijdag.
        const o = ontleedPlanningOpdracht('zet Clinton vrijdag 13 augustus bij Cees', TEAMS, VANDAAG)!;

        assert.ok(o.tegenspraak, 'de tegenspraak wordt gemeld');
        assert.match(o.tegenspraak!, /donderdag/);
    });

    test('geen planningsopdracht levert null op', () => {
        assert.equal(ontleedPlanningOpdracht('hoe gaat het', TEAMS, VANDAAG), null);
        assert.equal(ontleedPlanningOpdracht('stuur de factuur', TEAMS, VANDAAG), null);
    });
});

describe('dagen en tijden', () => {
    test('een weekdag wordt de eerstvolgende', () => {
        assert.equal(zoekDagen('donderdag', VANDAAG)[0].iso, '2026-08-13');
        assert.equal(zoekDagen('maandag', VANDAAG)[0].iso, '2026-08-10', 'vandaag telt mee');
    });

    /**
     * Afgesproken regel: "donderdag" is altijd de eerstvolgende donderdag, en
     * is het vandaag donderdag, dan is het vandaag. Niet volgende week.
     */
    test('op donderdag betekent donderdag vandaag', () => {
        const eenDonderdag = '2026-08-13';
        assert.equal(zoekDagen('donderdag', eenDonderdag)[0].iso, eenDonderdag);
        assert.equal(
            zoekDagen('volgende week donderdag', eenDonderdag)[0].iso,
            '2026-08-20',
            'alleen met "volgende week" schuift het een week op',
        );
    });

    test('volgende week telt er zeven bij', () => {
        assert.equal(zoekDagen('volgende week donderdag', VANDAAG)[0].iso, '2026-08-20');
    });

    test('vandaag, morgen en overmorgen', () => {
        assert.equal(zoekDagen('vandaag', VANDAAG)[0].iso, '2026-08-10');
        assert.equal(zoekDagen('morgen', VANDAAG)[0].iso, '2026-08-11');
        assert.equal(zoekDagen('overmorgen', VANDAAG)[0].iso, '2026-08-12');
    });

    test('een datum met maandnaam', () => {
        assert.equal(zoekDagen('3 september', VANDAAG)[0].iso, '2026-09-03');
        assert.equal(zoekDagen('13 augustus 2027', VANDAAG)[0].iso, '2027-08-13');
    });

    test('twee dagen komen in de volgorde van het bericht', () => {
        const dagen = zoekDagen('van donderdag naar vrijdag', VANDAAG);
        assert.equal(dagen.length, 2);
        assert.equal(dagen[0].iso, '2026-08-13');
        assert.equal(dagen[1].iso, '2026-08-14');
    });

    test('tijden in verschillende schrijfwijzen', () => {
        assert.equal(zoekTijd('08:30'), '08:30');
        assert.equal(zoekTijd('8.30'), '08:30');
        assert.equal(zoekTijd('8u30'), '08:30');
        assert.equal(zoekTijd('geen tijd hier'), undefined);
        assert.equal(zoekTijd('25:00'), undefined, 'onmogelijke tijd telt niet');
    });
});
