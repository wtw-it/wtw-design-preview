'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useErp } from '@/lib/erp/store';
import { euro, totalen } from '@/lib/erp/types';
import { Badge, Card, PageHeader, Stat, Table, Td } from '@/components/erp/ui';

export default function Dashboard() {
    const { scoped } = useErp();

    const openOffertes = scoped.offertes.filter((o) => o.status === 'verstuurd' || o.status === 'concept');
    const openWaarde = openOffertes.reduce((s, o) => s + totalen(o.regels).incl, 0);
    const teDoen = scoped.orders.filter(
        (o) => o.status !== 'gefactureerd' && o.status !== 'geannuleerd',
    );
    const laag = scoped.producten.filter((p) => p.categorie !== 'arbeid' && p.voorraad <= p.minVoorraad);

    return (
        <>
            <PageHeader
                titel="Dashboard"
                sub="Wat vandaag aandacht nodig heeft."
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <Stat label="Open offertes" waarde={String(openOffertes.length)} hint={euro(openWaarde) + ' incl. btw'} />
                <Stat label="Lopende orders" waarde={String(teDoen.length)} hint="niet gefactureerd" />
                <Stat label="Producten" waarde={String(scoped.producten.length)} hint={`${scoped.leveranciers.length} leveranciers`} />
                <Stat label="Onder minimum" waarde={String(laag.length)} hint="voorraad bijbestellen" />
            </div>

            {laag.length > 0 && (
                <Card className="p-4 mb-8 flex items-start gap-3 border-amber-200 bg-amber-50">
                    <AlertTriangle size={18} strokeWidth={1.5} className="text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-sm text-amber-900">
                        <div className="font-medium">Voorraad onder minimum</div>
                        <div className="mt-0.5 text-amber-800">
                            {laag.map((p) => `${p.naam} (${p.voorraad}/${p.minVoorraad})`).join(' · ')}
                        </div>
                        <Link href="/erp/voorraad" className="inline-flex items-center gap-1 mt-2 font-medium hover:underline">
                            Naar voorraad <ArrowRight size={14} strokeWidth={1.5} />
                        </Link>
                    </div>
                </Card>
            )}

            <h2 className="text-sm font-medium text-ink-900 mb-3">Laatste offertes</h2>
            <div className="mb-8">
                <Table kolommen={['Nummer', 'Klant', 'Status', 'Bedrag incl.', '']}>
                    {scoped.offertes.slice(0, 5).map((o) => {
                        const klant = scoped.klanten.find((k) => k.id === o.klantId);
                        return (
                            <tr key={o.id} className="hover:bg-ink-50">
                                <Td className="font-medium text-ink-900">{o.nummer}</Td>
                                <Td>{klant?.naam ?? '—'}</Td>
                                <Td>
                                    <Badge tone={o.status === 'akkoord' ? 'groen' : o.status === 'verstuurd' ? 'blauw' : 'grijs'}>
                                        {o.status}
                                    </Badge>
                                </Td>
                                <Td className="tabular">{euro(totalen(o.regels).incl)}</Td>
                                <Td>
                                    <Link href="/erp/offertes" className="text-wtw-600 hover:underline">
                                        Bekijk
                                    </Link>
                                </Td>
                            </tr>
                        );
                    })}
                </Table>
            </div>

            <h2 className="text-sm font-medium text-ink-900 mb-3">Lopende orders</h2>
            <Table kolommen={['Nummer', 'Klant', 'Status', 'Planning', 'Bezorger']}>
                {teDoen.map((o) => {
                    const klant = scoped.klanten.find((k) => k.id === o.klantId);
                    const bez = scoped.bezorgers.find((b) => b.id === o.bezorgerId);
                    return (
                        <tr key={o.id} className="hover:bg-ink-50">
                            <Td className="font-medium text-ink-900">{o.nummer}</Td>
                            <Td>{klant?.naam ?? '—'}</Td>
                            <Td>
                                <Badge tone={o.status === 'nieuw' ? 'amber' : 'blauw'}>{o.status}</Badge>
                            </Td>
                            <Td>{o.planning ?? '—'}</Td>
                            <Td>{bez?.naam ?? '—'}</Td>
                        </tr>
                    );
                })}
            </Table>
        </>
    );
}
