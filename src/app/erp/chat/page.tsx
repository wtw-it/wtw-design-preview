'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp, Check, Sparkles, Wrench } from 'lucide-react';
import { COMPANIES } from '@/lib/erp/seed';
import { useErp } from '@/lib/erp/store';
import { euro, totalen, type OfferteRegel } from '@/lib/erp/types';
import { Badge, Card, PageHeader } from '@/components/erp/ui';

interface Bericht {
    role: 'user' | 'assistant';
    content: string;
}

interface Voorstel {
    klantId?: string;
    klantNaam: string;
    regels: OfferteRegel[];
    notitie?: string;
}

const VOORBEELDEN = [
    'Offerte voor fam. De Vries: WTW 450 unit, 2 verdiepingen installatie, dakdoorvoer pannendak',
    'Wat kost een 350-unit inclusief inregelen?',
    'Welke filters liggen onder het minimum?',
];

export default function MasterChat() {
    const { scoped, company, addOfferte } = useErp();
    const router = useRouter();
    const [berichten, setBerichten] = useState<Bericht[]>([]);
    const [invoer, setInvoer] = useState('');
    const [bezig, setBezig] = useState(false);
    const [voorstel, setVoorstel] = useState<Voorstel | null>(null);
    const [fout, setFout] = useState<string | null>(null);
    const [tools, setTools] = useState<string[]>([]);
    const bodem = useRef<HTMLDivElement>(null);

    const bedrijf = COMPANIES.find((c) => c.id === company)!;

    async function verstuur(tekst: string) {
        if (!tekst.trim() || bezig) return;
        setFout(null);
        setVoorstel(null);
        setTools([]);

        const nieuw: Bericht[] = [...berichten, { role: 'user', content: tekst }];
        setBerichten([...nieuw, { role: 'assistant', content: '' }]);
        setInvoer('');
        setBezig(true);

        try {
            const res = await fetch('/api/erp/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: nieuw, data: scoped, bedrijf: bedrijf.naam }),
            });

            if (!res.ok || !res.body) {
                const j = (await res.json().catch(() => null)) as { fout?: string } | null;
                throw new Error(j?.fout ?? `Server gaf ${res.status}`);
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                const delen = buffer.split('\n\n');
                buffer = delen.pop() ?? '';

                for (const deel of delen) {
                    if (!deel.startsWith('data: ')) continue;
                    const ev = JSON.parse(deel.slice(6)) as {
                        type: string;
                        tekst?: string;
                        naam?: string;
                        offerte?: Voorstel;
                        bericht?: string;
                    };

                    if (ev.type === 'tekst' && ev.tekst) {
                        setBerichten((b) => {
                            const kopie = [...b];
                            kopie[kopie.length - 1] = {
                                role: 'assistant',
                                content: kopie[kopie.length - 1].content + ev.tekst,
                            };
                            return kopie;
                        });
                    } else if (ev.type === 'tool' && ev.naam) {
                        setTools((t) => (t.includes(ev.naam!) ? t : [...t, ev.naam!]));
                    } else if (ev.type === 'offerte' && ev.offerte) {
                        setVoorstel(ev.offerte);
                    } else if (ev.type === 'fout') {
                        setFout(ev.bericht ?? 'Onbekende fout');
                    }
                }
                bodem.current?.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (e) {
            setFout(e instanceof Error ? e.message : 'Onbekende fout');
        } finally {
            setBezig(false);
        }
    }

    function bevestig() {
        if (!voorstel) return;
        const nr = `OFF-2026-${String(scoped.offertes.length + 150).padStart(4, '0')}`;
        const vandaag = new Date();
        const geldig = new Date(vandaag.getTime() + 30 * 864e5);

        addOfferte({
            id: `off-${Date.now()}`,
            company,
            nummer: nr,
            klantId: voorstel.klantId ?? scoped.klanten[0]?.id ?? '',
            status: 'concept',
            datum: vandaag.toISOString().slice(0, 10),
            geldigTot: geldig.toISOString().slice(0, 10),
            regels: voorstel.regels,
            notitie: voorstel.notitie,
        });
        setVoorstel(null);
        router.push('/erp/offertes');
    }

    return (
        <>
            <PageHeader
                titel="Master chat"
                sub="Typ een offerte uit zoals je hem aan een collega zou uitleggen."
            />

            {berichten.length === 0 && (
                <div className="mb-6 space-y-2">
                    {VOORBEELDEN.map((v) => (
                        <button
                            key={v}
                            onClick={() => verstuur(v)}
                            className="block w-full text-left px-4 py-3 rounded-lg border border-ink-200 bg-white text-sm text-ink-600 hover:border-wtw-400 hover:text-ink-900 transition-colors"
                        >
                            <Sparkles size={14} strokeWidth={1.5} className="inline mr-2 text-wtw-500" />
                            {v}
                        </button>
                    ))}
                </div>
            )}

            <div className="space-y-4 mb-6">
                {berichten.map((b, i) => (
                    <div key={i} className={b.role === 'user' ? 'flex justify-end' : ''}>
                        <div
                            className={
                                b.role === 'user'
                                    ? 'max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-wtw-500 text-white text-sm'
                                    : 'max-w-[85%] text-sm text-ink-800 whitespace-pre-wrap leading-relaxed'
                            }
                        >
                            {b.content || (bezig && i === berichten.length - 1 ? '…' : '')}
                        </div>
                    </div>
                ))}
                <div ref={bodem} />
            </div>

            {tools.length > 0 && (
                <div className="flex items-center gap-2 mb-4 text-xs text-ink-500">
                    <Wrench size={13} strokeWidth={1.5} />
                    {tools.join(' · ')}
                </div>
            )}

            {fout && (
                <Card className="p-4 mb-4 border-red-200 bg-red-50 text-sm text-red-700">{fout}</Card>
            )}

            {voorstel && (
                <Card className="p-5 mb-5 ring-1 ring-wtw-200">
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <div>
                            <Badge tone="groen">Voorstel</Badge>
                            <h2 className="font-semibold text-ink-900 mt-2">{voorstel.klantNaam}</h2>
                        </div>
                        <button
                            onClick={bevestig}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-wtw-500 text-white text-sm font-medium hover:bg-wtw-600"
                            style={{ boxShadow: 'var(--shadow-cta-glow)' }}
                        >
                            <Check size={16} strokeWidth={1.5} />
                            Vastleggen als concept
                        </button>
                    </div>

                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-ink-100">
                            {voorstel.regels.map((r, i) => (
                                <tr key={i}>
                                    <td className="py-2 text-ink-700">{r.omschrijving}</td>
                                    <td className="py-2 text-right tabular w-16">{r.aantal}×</td>
                                    <td className="py-2 text-right tabular w-28">{euro(r.stukprijs)}</td>
                                    <td className="py-2 text-right tabular w-28 font-medium text-ink-900">
                                        {euro(r.aantal * r.stukprijs)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex justify-between mt-3 pt-3 border-t border-ink-200 font-semibold text-ink-900">
                        <span>Totaal incl. btw</span>
                        <span className="tabular">{euro(totalen(voorstel.regels).incl)}</span>
                    </div>
                </Card>
            )}

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    verstuur(invoer);
                }}
                className="sticky bottom-6 flex items-end gap-2 bg-white border border-ink-200 rounded-xl p-2 shadow-lg"
            >
                <textarea
                    value={invoer}
                    onChange={(e) => setInvoer(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            verstuur(invoer);
                        }
                    }}
                    rows={2}
                    placeholder={`Offerte, klant of prijsvraag voor ${bedrijf.domein}…`}
                    className="flex-1 resize-none px-3 py-2 text-sm focus:outline-none bg-transparent"
                />
                <button
                    type="submit"
                    disabled={bezig || !invoer.trim()}
                    className="h-9 w-9 rounded-lg bg-wtw-500 text-white flex items-center justify-center disabled:opacity-40 hover:bg-wtw-600"
                    aria-label="Versturen"
                >
                    <ArrowUp size={17} strokeWidth={2} />
                </button>
            </form>
        </>
    );
}
