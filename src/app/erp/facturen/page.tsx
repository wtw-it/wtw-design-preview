'use client';

import { useState } from 'react';
import { Receipt } from 'lucide-react';
import { COMPANIES } from '@/lib/erp/seed';
import { useErp } from '@/lib/erp/store';
import { euro, totalen, type FactuurStatus, type Order } from '@/lib/erp/types';
import { Badge, Card, Leeg, PageHeader, Sectie, Table, Td } from '@/components/erp/ui';

const TONE: Record<FactuurStatus, string> = {
    concept: 'grijs',
    verstuurd: 'blauw',
    betaald: 'groen',
    vervallen: 'rood',
};

const VOLGENDE: Record<FactuurStatus, { label: string; naar: FactuurStatus } | null> = {
    concept: { label: 'Versturen', naar: 'verstuurd' },
    verstuurd: { label: 'Betaald melden', naar: 'betaald' },
    betaald: null,
    vervallen: null,
};

const BETALINGSTERMIJN_DAGEN = 14;

export default function Facturen() {
    const { scoped, company, addFactuur, updateFactuur, updateOrder } = useErp();
    const [open, setOpen] = useState<string | null>(null);

    const bedrijf = COMPANIES.find((c) => c.id === company)!;
    const vandaag = new Date().toISOString().slice(0, 10);

    // Orders die klaar zijn voor facturatie: geleverd of gemonteerd, nog niet gefactureerd.
    const teFactureren = scoped.orders.filter(
        (o) =>
            (o.status === 'geleverd' || o.status === 'gemonteerd') &&
            !scoped.facturen.some((f) => f.orderId === o.id),
    );

    const openstaand = scoped.facturen
        .filter((f) => f.status === 'verstuurd')
        .reduce((s, f) => s + totalen(f.regels).incl, 0);
    const overTijd = scoped.facturen.filter(
        (f) => f.status === 'verstuurd' && f.vervaldatum < vandaag,
    );

    function maakFactuur(order: Order) {
        const prefix = company === 'wtw-winkel' ? 'WW-F' : 'WS-F';
        const nummer = `${prefix}-2026-${String(scoped.facturen.length + 88).padStart(4, '0')}`;
        const verval = new Date(Date.now() + BETALINGSTERMIJN_DAGEN * 864e5);

        addFactuur({
            id: `fac-${Date.now()}`,
            company,
            nummer,
            klantId: order.klantId,
            orderId: order.id,
            status: 'concept',
            datum: vandaag,
            vervaldatum: verval.toISOString().slice(0, 10),
            regels: order.regels,
            betaaldOp: null,
        });
        updateOrder(order.id, { status: 'gefactureerd' });
    }

    function statusDoor(id: string, naar: FactuurStatus) {
        updateFactuur(id, {
            status: naar,
            ...(naar === 'betaald' ? { betaaldOp: vandaag } : {}),
        });
    }

    const detail = scoped.facturen.find((f) => f.id === open);

    return (
        <>
            <PageHeader
                titel="Facturen"
                sub={`Facturatie van ${bedrijf.naam}, betalingstermijn ${BETALINGSTERMIJN_DAGEN} dagen.`}
            />

            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="erp-stat p-4">
                    <span className="erp-tegel">
                        <Receipt size={18} strokeWidth={1.75} />
                    </span>
                    <div className="mt-3 flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-brand-800 tabular">{euro(openstaand)}</span>
                    </div>
                    <div className="text-xs text-ink-500 mt-1.5">openstaand (verstuurd)</div>
                </div>
                <div className="erp-stat p-4">
                    <span className="erp-tegel erp-tegel-oranje">
                        <Receipt size={18} strokeWidth={1.75} />
                    </span>
                    <div className="mt-3 flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-brand-800 tabular">{overTijd.length}</span>
                        <span className="text-sm text-ink-600">over termijn</span>
                    </div>
                    <div className="text-xs text-ink-500 mt-1.5">herinnering sturen</div>
                </div>
            </div>

            {teFactureren.length > 0 && (
                <>
                    <Sectie>Klaar om te factureren</Sectie>
                    <div className="space-y-2.5 mb-6">
                        {teFactureren.map((o) => {
                            const klant = scoped.klanten.find((k) => k.id === o.klantId);
                            return (
                                <Card key={o.id} className="p-4 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="font-semibold text-ink-900">{o.nummer}</div>
                                        <div className="text-sm text-ink-500 truncate">
                                            {klant?.naam} · {euro(totalen(o.regels).incl)} incl. · {o.status}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => maakFactuur(o)}
                                        className="shrink-0 px-3.5 py-2 rounded-lg bg-brand-700 text-white text-sm font-semibold hover:bg-brand-800"
                                    >
                                        Maak factuur
                                    </button>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}

            <Sectie>Alle facturen</Sectie>
            <div className="mb-6">
                <Table kolommen={['Nummer', 'Klant', 'Datum', 'Vervalt', 'Status', 'Incl. btw', '']}>
                    {scoped.facturen.map((f) => {
                        const klant = scoped.klanten.find((k) => k.id === f.klantId);
                        const laat = f.status === 'verstuurd' && f.vervaldatum < vandaag;
                        const actie = VOLGENDE[f.status];
                        return (
                            <tr
                                key={f.id}
                                className={`cursor-pointer hover:bg-ink-50 ${open === f.id ? 'bg-ink-50' : ''}`}
                                onClick={() => setOpen(f.id)}
                            >
                                <Td className="font-semibold text-ink-900">{f.nummer}</Td>
                                <Td>{klant?.naam ?? '—'}</Td>
                                <Td>{f.datum}</Td>
                                <Td className={laat ? 'text-red-600 font-semibold' : ''}>{f.vervaldatum}</Td>
                                <Td>
                                    <Badge tone={laat ? 'rood' : TONE[f.status]}>
                                        {laat ? 'over termijn' : f.status}
                                    </Badge>
                                </Td>
                                <Td className="tabular">{euro(totalen(f.regels).incl)}</Td>
                                <Td>
                                    {actie && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                statusDoor(f.id, actie.naar);
                                            }}
                                            className="text-brand-600 font-medium hover:underline text-sm whitespace-nowrap"
                                        >
                                            {actie.label}
                                        </button>
                                    )}
                                </Td>
                            </tr>
                        );
                    })}
                    {scoped.facturen.length === 0 && (
                        <tr>
                            <td colSpan={7}>
                                <Leeg tekst="Nog geen facturen voor dit bedrijf." />
                            </td>
                        </tr>
                    )}
                </Table>
            </div>

            {detail && (
                <Card className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <h2 className="font-semibold text-ink-900">{detail.nummer}</h2>
                            <div className="text-sm text-ink-500 mt-0.5">
                                {scoped.klanten.find((k) => k.id === detail.klantId)?.naam}
                                {detail.orderId && (
                                    <>
                                        {' '}· uit order{' '}
                                        {scoped.orders.find((o) => o.id === detail.orderId)?.nummer ?? '—'}
                                    </>
                                )}
                            </div>
                        </div>
                        <Badge tone={TONE[detail.status]}>{detail.status}</Badge>
                    </div>

                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-ink-100">
                            {detail.regels.map((r, i) => (
                                <tr key={i}>
                                    <td className="py-2 text-ink-700">{r.omschrijving}</td>
                                    <td className="py-2 text-right tabular w-14">{r.aantal}×</td>
                                    <td className="py-2 text-right tabular w-24">{euro(r.stukprijs)}</td>
                                    <td className="py-2 text-right tabular w-24 font-medium text-ink-900">
                                        {euro(r.aantal * r.stukprijs)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-3 pt-3 border-t border-ink-200 ml-auto max-w-xs space-y-1.5 text-sm">
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

                    {detail.betaaldOp && (
                        <div className="mt-4 pt-3 border-t border-ink-100 text-sm text-brand-700">
                            Betaald op {detail.betaaldOp}
                        </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-ink-100 text-xs text-ink-500 leading-relaxed">
                        {bedrijf.naam} · {bedrijf.domein} · KvK {bedrijf.kvk} · Btw {bedrijf.btw} · {bedrijf.iban}
                        <div className="mt-1 text-ink-400">
                            Bedrijfsgegevens zijn placeholders tot de definitieve KvK-, btw- en IBAN-gegevens
                            zijn aangeleverd.
                        </div>
                    </div>
                </Card>
            )}
        </>
    );
}
