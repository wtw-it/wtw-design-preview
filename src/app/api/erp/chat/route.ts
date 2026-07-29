import Anthropic from '@anthropic-ai/sdk';
import type { ErpData, OfferteRegel } from '@/lib/erp/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Master chat — de snelste manier om een offerte te typen.
 *
 * De client stuurt een snapshot van de ERP-data van het actieve bedrijf mee.
 * Claude zoekt daarin en stelt een offerte samen; het resultaat komt terug als
 * een `offerte`-event dat de client in de store zet. Er wordt hier niets
 * weggeschreven — de gebruiker bevestigt in de UI.
 */

const MODEL = 'claude-opus-5';

const TOOLS: Anthropic.Tool[] = [
    {
        name: 'zoek_producten',
        description:
            'Zoek artikelen in de productcatalogus van het actieve bedrijf. Roep dit aan zodra de gebruiker een product, unit, filter of arbeidspost noemt, zodat je met echte SKU\'s en prijzen werkt in plaats van te gokken.',
        input_schema: {
            type: 'object',
            properties: {
                term: {
                    type: 'string',
                    description: 'Zoekterm — deel van de naam, de SKU of de categorie.',
                },
            },
            required: ['term'],
        },
    },
    {
        name: 'zoek_klant',
        description:
            'Zoek een bestaande klant op naam, e-mail of plaats. Roep dit aan voordat je een offerte opstelt, zodat een bestaande klant niet dubbel wordt aangemaakt.',
        input_schema: {
            type: 'object',
            properties: { term: { type: 'string', description: 'Naam, e-mailadres of plaats.' } },
            required: ['term'],
        },
    },
    {
        name: 'stel_offerte_voor',
        description:
            'Zet de besproken regels om in een concept-offerte. Roep dit pas aan als klant en regels duidelijk zijn. De offerte verschijnt als voorstel in de UI; de gebruiker bevestigt zelf.',
        input_schema: {
            type: 'object',
            properties: {
                klantId: {
                    type: 'string',
                    description: 'Id van een bestaande klant, of leeg als het een nieuwe klant is.',
                },
                klantNaam: { type: 'string', description: 'Naam van de klant.' },
                regels: {
                    type: 'array',
                    description: 'De offerteregels, in de volgorde waarin ze op de offerte komen.',
                    items: {
                        type: 'object',
                        properties: {
                            productId: { type: 'string', description: 'Id uit de catalogus, of leeg bij maatwerk.' },
                            omschrijving: { type: 'string' },
                            aantal: { type: 'number' },
                            stukprijs: { type: 'number', description: 'Excl. btw.' },
                            btwTarief: { type: 'number', enum: [0, 9, 21] },
                        },
                        required: ['omschrijving', 'aantal', 'stukprijs', 'btwTarief'],
                    },
                },
                notitie: { type: 'string', description: 'Interne notitie; komt niet op de PDF.' },
            },
            required: ['klantNaam', 'regels'],
        },
    },
];

function systeem(bedrijf: string, data: ErpData): string {
    return [
        `Je bent de assistent binnen de WTW Installatie- & Verkoop-ERP. Het actieve bedrijf is ${bedrijf}.`,
        'Je helpt met offertes intypen, klanten opzoeken, prijzen en voorraad nakijken, en orders plannen.',
        '',
        'Werkwijze:',
        '- Gebruik altijd de tools om echte artikelen en klanten op te halen; verzin geen SKU\'s of prijzen.',
        '- Prijzen die je noemt zijn excl. btw, tenzij je expliciet incl. zegt. Btw is standaard 21%.',
        '- Installatie reken je per verdieping (artikel ARB-INST-VERD), plus inbedrijfstelling.',
        '- Vraag alleen door als het antwoord de offerte echt verandert; maak routinekeuzes zelf en benoem ze.',
        '- Antwoord kort en in het Nederlands. Geen opsomming van wat je gaat doen — doe het.',
        '',
        `Catalogus: ${data.producten.length} artikelen. Klanten: ${data.klanten.length}. Leveranciers: ${data.leveranciers
            .map((l) => l.naam)
            .join(', ')}.`,
    ].join('\n');
}

function voerToolUit(naam: string, input: Record<string, unknown>, data: ErpData): unknown {
    const term = String(input.term ?? '').toLowerCase();

    if (naam === 'zoek_producten') {
        return data.producten
            .filter(
                (p) =>
                    p.naam.toLowerCase().includes(term) ||
                    p.sku.toLowerCase().includes(term) ||
                    p.categorie.includes(term),
            )
            .slice(0, 12)
            .map((p) => ({
                id: p.id,
                sku: p.sku,
                naam: p.naam,
                categorie: p.categorie,
                verkoop: p.verkoop,
                btwTarief: p.btwTarief,
                voorraad: p.voorraad,
            }));
    }

    if (naam === 'zoek_klant') {
        return data.klanten
            .filter(
                (k) =>
                    k.naam.toLowerCase().includes(term) ||
                    k.email.toLowerCase().includes(term) ||
                    k.plaats.toLowerCase().includes(term),
            )
            .slice(0, 10);
    }

    return { fout: `Onbekende tool: ${naam}` };
}

export async function POST(req: Request) {
    if (!process.env.ANTHROPIC_API_KEY) {
        return Response.json(
            { fout: 'ANTHROPIC_API_KEY ontbreekt. Zet die in de omgeving om de master chat te gebruiken.' },
            { status: 503 },
        );
    }

    const body = (await req.json()) as {
        messages: Anthropic.MessageParam[];
        data: ErpData;
        bedrijf: string;
    };

    const client = new Anthropic();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const stuur = (payload: unknown) =>
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));

            const messages: Anthropic.MessageParam[] = [...body.messages];

            try {
                // Agentische lus: praten → tools uitvoeren → doorpraten.
                for (let ronde = 0; ronde < 6; ronde++) {
                    const modelStream = client.messages.stream({
                        model: MODEL,
                        max_tokens: 8000,
                        output_config: { effort: 'medium' },
                        system: systeem(body.bedrijf, body.data),
                        tools: TOOLS,
                        messages,
                    });

                    modelStream.on('text', (delta) => stuur({ type: 'tekst', tekst: delta }));

                    const bericht = await modelStream.finalMessage();
                    messages.push({ role: 'assistant', content: bericht.content });

                    if (bericht.stop_reason !== 'tool_use') break;

                    const resultaten: Anthropic.ToolResultBlockParam[] = [];
                    for (const blok of bericht.content) {
                        if (blok.type !== 'tool_use') continue;

                        if (blok.name === 'stel_offerte_voor') {
                            const inv = blok.input as {
                                klantId?: string;
                                klantNaam: string;
                                regels: OfferteRegel[];
                                notitie?: string;
                            };
                            stuur({ type: 'offerte', offerte: inv });
                            resultaten.push({
                                type: 'tool_result',
                                tool_use_id: blok.id,
                                content:
                                    'Voorstel staat in beeld bij de gebruiker. Vat in één zin samen wat erin zit en wat het totaal is.',
                            });
                            continue;
                        }

                        const uitkomst = voerToolUit(
                            blok.name,
                            blok.input as Record<string, unknown>,
                            body.data,
                        );
                        stuur({ type: 'tool', naam: blok.name });
                        resultaten.push({
                            type: 'tool_result',
                            tool_use_id: blok.id,
                            content: JSON.stringify(uitkomst),
                        });
                    }

                    messages.push({ role: 'user', content: resultaten });
                }

                stuur({ type: 'klaar' });
            } catch (e) {
                stuur({ type: 'fout', bericht: e instanceof Error ? e.message : 'Onbekende fout' });
            } finally {
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
        },
    });
}
