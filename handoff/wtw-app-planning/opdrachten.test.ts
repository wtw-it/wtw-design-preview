import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { voerAlleOpdrachtenUit, stelAntwoordSamen, telResultaten } from './opdrachten';

describe('één bericht met meerdere opdrachten', () => {
    /**
     * Dit is wat er misging: twee opdrachten, de tweede liep vast, en alleen
     * die tweede kwam in beeld. Wat er met de eerste gebeurd was, was weg.
     */
    test('een deel dat vastloopt neemt de rest niet mee', async () => {
        const resultaten = await voerAlleOpdrachtenUit(
            ['zet Clinton donderdag bij Cees', 'zeg de afspraak bij Cees af'],
            async (deel) => {
                if (deel.includes('af')) throw new Error('Geen afspraak gevonden bij Cees');
                return { antwoord: 'Clinton — do 13 aug' };
            },
        );

        assert.equal(resultaten.length, 2, 'elk deel krijgt een antwoord');
        assert.equal(resultaten[0].status, 'gelukt');
        assert.equal(resultaten[0].antwoord, 'Clinton — do 13 aug');
        assert.equal(resultaten[1].status, 'mislukt');
        assert.equal(resultaten[1].fout, 'Geen afspraak gevonden bij Cees');
    });

    test('het eerste deel blijft zichtbaar in het samengestelde antwoord', async () => {
        const resultaten = await voerAlleOpdrachtenUit(['a', 'b'], async (deel) => {
            if (deel === 'b') throw new Error('mislukt');
            return { antwoord: 'Clinton ingepland' };
        });

        const antwoord = stelAntwoordSamen(resultaten);
        assert.match(antwoord, /Clinton ingepland/, 'het geslaagde deel staat er nog');
        assert.match(antwoord, /mislukt/);
    });

    test('de volgorde blijft de volgorde van het bericht', async () => {
        const volgorde: string[] = [];
        const resultaten = await voerAlleOpdrachtenUit(
            ['klant', 'offerte', 'mail'],
            async (deel) => {
                volgorde.push(deel);
                return { antwoord: deel };
            },
        );

        assert.deepEqual(volgorde, ['klant', 'offerte', 'mail'], 'serieel, in zijn volgorde');
        assert.deepEqual(
            resultaten.map((r) => r.invoer),
            ['klant', 'offerte', 'mail'],
        );
        assert.deepEqual(
            resultaten.map((r) => r.index),
            [0, 1, 2],
        );
    });

    test('drie opdrachten waarvan er één struikelt', async () => {
        const resultaten = await voerAlleOpdrachtenUit(
            ['nieuwe klant Jan', 'offerte Renson', 'mail eruit'],
            async (deel) => {
                if (deel.startsWith('offerte')) throw new Error('Geen prijslijst voor Renson');
                return { antwoord: `${deel} klaar` };
            },
        );

        const telling = telResultaten(resultaten);
        assert.deepEqual(telling, { totaal: 3, gelukt: 2, navraag: 0, mislukt: 1 });
        assert.equal(resultaten[2].status, 'gelukt', 'het derde deel is gewoon doorgegaan');
    });

    test('navraag is geen mislukking', async () => {
        const resultaten = await voerAlleOpdrachtenUit(['zet Clinton in'], async () => ({
            antwoord: 'Zeg even welke dag?',
            navraag: true,
        }));

        assert.equal(resultaten[0].status, 'navraag');
        assert.equal(telResultaten(resultaten).mislukt, 0);
    });

    test('een enkele opdracht krijgt geen opsommingstekens', async () => {
        const resultaten = await voerAlleOpdrachtenUit(['zet Clinton in'], async () => ({
            antwoord: 'Clinton — do 13 aug',
        }));

        assert.equal(stelAntwoordSamen(resultaten), 'Clinton — do 13 aug');
    });

    test('een fout die geen Error is levert nog steeds één zin op', async () => {
        const resultaten = await voerAlleOpdrachtenUit(['x'], async () => {
            throw 'iets ging mis';
        });

        assert.equal(resultaten[0].antwoord, 'iets ging mis');
    });
});
