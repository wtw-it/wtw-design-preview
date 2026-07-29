'use client';

import { useErp } from '@/lib/erp/store';
import { euro, totalen, type OrderStatus } from '@/lib/erp/types';
import { Badge, Leeg, PageHeader, Table, Td } from '@/components/erp/ui';

const STATUSSEN: OrderStatus[] = [
    'nieuw',
    'ingepland',
    'besteld',
    'onderweg',
    'geleverd',
    'gemonteerd',
    'gefactureerd',
    'geannuleerd',
];

const TONE: Record<OrderStatus, string> = {
    nieuw: 'amber',
    ingepland: 'blauw',
    besteld: 'blauw',
    onderweg: 'blauw',
    geleverd: 'blauw',
    gemonteerd: 'groen',
    gefactureerd: 'groen',
    geannuleerd: 'rood',
};

export default function Orders() {
    const { scoped, updateOrder } = useErp();

    return (
        <>
            <PageHeader
                titel="Orders"
                sub="Webshop-orders en installatie-orders in één lijst."
            />

            <Table
                kolommen={['Nummer', 'Klant', 'Herkomst', 'Status', 'Planning', 'Bezorger', 'Incl. btw']}
            >
                {scoped.orders.map((o) => {
                    const klant = scoped.klanten.find((k) => k.id === o.klantId);
                    return (
                        <tr key={o.id} className="hover:bg-ink-50">
                            <Td className="font-medium text-ink-900">{o.nummer}</Td>
                            <Td>{klant?.naam ?? '—'}</Td>
                            <Td>
                                {o.wooId ? (
                                    <Badge tone="groen">webshop #{o.wooId}</Badge>
                                ) : o.offerteId ? (
                                    <Badge tone="blauw">offerte</Badge>
                                ) : (
                                    <Badge>handmatig</Badge>
                                )}
                            </Td>
                            <Td>
                                <select
                                    value={o.status}
                                    onChange={(e) => updateOrder(o.id, { status: e.target.value as OrderStatus })}
                                    className="text-xs border border-ink-200 rounded px-2 py-1 bg-white focus:outline-none focus:border-wtw-400"
                                >
                                    {STATUSSEN.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </Td>
                            <Td>
                                <input
                                    type="date"
                                    value={o.planning ?? ''}
                                    onChange={(e) => updateOrder(o.id, { planning: e.target.value || null })}
                                    className="text-xs border border-ink-200 rounded px-2 py-1 focus:outline-none focus:border-wtw-400"
                                />
                            </Td>
                            <Td>
                                <select
                                    value={o.bezorgerId ?? ''}
                                    onChange={(e) => updateOrder(o.id, { bezorgerId: e.target.value || null })}
                                    className="text-xs border border-ink-200 rounded px-2 py-1 bg-white focus:outline-none focus:border-wtw-400"
                                >
                                    <option value="">—</option>
                                    {scoped.bezorgers.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.naam}
                                        </option>
                                    ))}
                                </select>
                            </Td>
                            <Td className="tabular">{euro(totalen(o.regels).incl)}</Td>
                        </tr>
                    );
                })}
                {scoped.orders.length === 0 && (
                    <tr>
                        <td colSpan={7}>
                            <Leeg tekst="Nog geen orders voor dit bedrijf." />
                        </td>
                    </tr>
                )}
            </Table>

            <div className="mt-3">
                <Badge tone="grijs">
                    Status en planning worden lokaal bewaard tot Supabase is aangesloten
                </Badge>
            </div>
        </>
    );
}
