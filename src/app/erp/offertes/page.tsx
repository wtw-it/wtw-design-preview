'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { useErp } from '@/lib/erp/store';
import { euro, totalen, type OfferteStatus } from '@/lib/erp/types';
import { Badge, Card, Leeg, PageHeader, Table, Td } from '@/components/erp/ui';

const TONE: Record<OfferteStatus, string> = {
    concept: 'grijs',
    verstuurd: 'blauw',
    akkoord: 'groen',
    afgewezen: 'rood',
    verlopen: 'amber',
};

const VOLGENDE: Record<OfferteStatus, OfferteStatus | null> = {
    concept: 'verstuurd',
    verstuurd: 'akkoord',
    akkoord: null,
    afgewezen: null,
    verlopen: null,
};

export default function Offertes() {
    const { scoped, updateOfferte, addOrder, company } = useErp();
    const [open, setOpen] = useState<string | null>(scoped.offertes[0]?.id ?? null);

    const detail = scoped.offertes.find((o) => o.id === open);

    function naarOrder(offerteId: string) {
        const off = scoped.offertes.find((o) => o.id === offerteId);
        if (!off) return;
        const nr = `${company === 'wtw-winkel' ? 'WW' : 'WS'}-2026-${String(
            scoped.orders.length + 300,
        ).padStart(4, '0')}`;
        addOrder({
            id: `ord-${Date.now()}`,
            company,
            nummer: nr,
            klantId: off.klantId,
            offerteId: off.id,
            status: 'nieuw',
            datum: new Date().toISOString().slice(0, 10),
            planning: null,
            bezorgerId: null,
            regels: off.regels,
            wooId: null,
        });
        updateOfferte(off.id, { status: 'akkoord' });
    }

    return (
        <>
            <PageHeader
                titel="Offertes"
                sub="Opstellen doe je het snelst via de master chat."
                actie={
                    <Link
                        href="/erp/chat"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-brand-700 text-white text-sm font-semibold hover:bg-brand-800 transition-colors"
                       
                    >
                        <MessageSquare size={16} strokeWidth={1.5} />
                        Nieuwe offerte via chat
                    </Link>
                }
            />

            <div className="mb-8">
                <Table kolommen={['Nummer', 'Klant', 'Datum', 'Geldig tot', 'Status', 'Incl. btw', '']}>
                    {scoped.offertes.map((o) => {
                        const klant = scoped.klanten.find((k) => k.id === o.klantId);
                        const volgende = VOLGENDE[o.status];
                        return (
                            <tr
                                key={o.id}
                                className={`hover:bg-ink-50 cursor-pointer ${open === o.id ? 'bg-ink-50' : ''}`}
                                onClick={() => setOpen(o.id)}
                            >
                                <Td className="font-medium text-ink-900">{o.nummer}</Td>
                                <Td>{klant?.naam ?? '—'}</Td>
                                <Td>{o.datum}</Td>
                                <Td>{o.geldigTot}</Td>
                                <Td>
                                    <Badge tone={TONE[o.status]}>{o.status}</Badge>
                                </Td>
                                <Td className="tabular">{euro(totalen(o.regels).incl)}</Td>
                                <Td>
                                    {volgende && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (volgende === 'akkoord') naarOrder(o.id);
                                                else updateOfferte(o.id, { status: volgende });
                                            }}
                                            className="text-brand-600 hover:underline text-sm"
                                        >
                                            {volgende === 'akkoord' ? 'Akkoord → order' : 'Versturen'}
                                        </button>
                                    )}
                                </Td>
                            </tr>
                        );
                    })}
                    {scoped.offertes.length === 0 && (
                        <tr>
                            <td colSpan={7}>
                                <Leeg tekst="Nog geen offertes voor dit bedrijf." />
                            </td>
                        </tr>
                    )}
                </Table>
            </div>

            {detail && (
                <Card className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-5">
                        <div>
                            <h2 className="font-semibold text-ink-900">{detail.nummer}</h2>
                            <div className="text-sm text-ink-500 mt-0.5">
                                {scoped.klanten.find((k) => k.id === detail.klantId)?.naam}
                            </div>
                        </div>
                        <Badge tone={TONE[detail.status]}>{detail.status}</Badge>
                    </div>

                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-ink-200">
                                <th className="text-left font-medium text-ink-500 text-[11px] uppercase tracking-wider py-2">
                                    Omschrijving
                                </th>
                                <th className="text-right font-medium text-ink-500 text-[11px] uppercase tracking-wider py-2 w-20">
                                    Aantal
                                </th>
                                <th className="text-right font-medium text-ink-500 text-[11px] uppercase tracking-wider py-2 w-28">
                                    Stukprijs
                                </th>
                                <th className="text-right font-medium text-ink-500 text-[11px] uppercase tracking-wider py-2 w-28">
                                    Totaal
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink-100">
                            {detail.regels.map((r, i) => (
                                <tr key={i}>
                                    <td className="py-2.5 text-ink-700">{r.omschrijving}</td>
                                    <td className="py-2.5 text-right tabular">{r.aantal}</td>
                                    <td className="py-2.5 text-right tabular">{euro(r.stukprijs)}</td>
                                    <td className="py-2.5 text-right tabular font-medium text-ink-900">
                                        {euro(r.aantal * r.stukprijs)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-4 pt-4 border-t border-ink-200 ml-auto max-w-xs space-y-1.5 text-sm">
                        <div className="flex justify-between text-ink-600">
                            <span>Subtotaal</span>
                            <span className="tabular">{euro(totalen(detail.regels).excl)}</span>
                        </div>
                        <div className="flex justify-between text-ink-600">
                            <span>Btw</span>
                            <span className="tabular">{euro(totalen(detail.regels).btw)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-ink-900 pt-1.5 border-t border-ink-200">
                            <span>Totaal</span>
                            <span className="tabular">{euro(totalen(detail.regels).incl)}</span>
                        </div>
                    </div>

                    {detail.notitie && (
                        <div className="mt-5 pt-4 border-t border-ink-100 text-sm text-ink-500">
                            <span className="font-medium text-ink-700">Interne notitie: </span>
                            {detail.notitie}
                        </div>
                    )}
                </Card>
            )}
        </>
    );
}
