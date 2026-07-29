'use client';

import Link from 'next/link';
import {
    AlertTriangle,
    ArrowRight,
    Boxes,
    CalendarClock,
    ClipboardList,
    FileText,
    MessageSquare,
    Receipt,
    Warehouse,
} from 'lucide-react';
import { useErp } from '@/lib/erp/store';
import { euro, totalen } from '@/lib/erp/types';
import { Badge, Card, Sectie, Stat, Table, Td } from '@/components/erp/ui';

function groet(): string {
    const u = new Date().getHours();
    if (u < 6) return 'Goedenacht';
    if (u < 12) return 'Goedemorgen';
    if (u < 18) return 'Goedemiddag';
    return 'Goedenavond';
}

const SNEL = [
    { href: '/erp/chat', label: 'Offerte intypen', sub: 'via de master chat', icon: MessageSquare },
    { href: '/erp/orders', label: 'Order aanmaken', sub: 'webshop of installatie', icon: ClipboardList },
    { href: '/erp/producten', label: 'Prijs aanpassen', sub: 'catalogus bijwerken', icon: Boxes },
    { href: '/erp/voorraad', label: 'Voorraad tellen', sub: 'bijbestellen', icon: Warehouse },
];

export default function Dashboard() {
    const { scoped } = useErp();

    const openOffertes = scoped.offertes.filter((o) => o.status === 'verstuurd' || o.status === 'concept');
    const openWaarde = openOffertes.reduce((s, o) => s + totalen(o.regels).incl, 0);
    const teDoen = scoped.orders.filter((o) => o.status !== 'gefactureerd' && o.status !== 'geannuleerd');
    const laag = scoped.producten.filter((p) => p.categorie !== 'arbeid' && p.voorraad <= p.minVoorraad);
    const vandaag = new Date().toISOString().slice(0, 10);
    const ritten = scoped.orders.filter((o) => o.planning === vandaag);
    const openFacturen = scoped.facturen.filter((f) => f.status === 'verstuurd');
    const openFactuurBedrag = openFacturen.reduce((s, f) => s + totalen(f.regels).incl, 0);

    const datum = new Date().toLocaleDateString('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });

    return (
        <>
            {/* Hero */}
            <div className="erp-hero rounded-2xl p-5 mb-6">
                <div className="relative">
                    <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white/60">
                        {datum}
                    </div>
                    <h1 className="text-[26px] font-bold text-white mt-1.5">{groet()} WTW</h1>
                    <p className="text-white/80 text-sm mt-1.5 max-w-md">
                        Op je lijst: {openOffertes.length}{' '}
                        {openOffertes.length === 1 ? 'open offerte' : 'open offertes'} en {teDoen.length}{' '}
                        {teDoen.length === 1 ? 'lopende order' : 'lopende orders'}.
                    </p>
                    <Link
                        href="/erp/chat"
                        className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-white text-brand-800 text-sm font-semibold"
                    >
                        Offerte intypen
                        <ArrowRight size={16} strokeWidth={2} />
                    </Link>
                </div>
            </div>

            <Sectie>Vandaag</Sectie>
            <div className="grid grid-cols-2 gap-3 mb-6">
                <Stat
                    label="open"
                    waarde={String(openOffertes.length)}
                    hint={`${euro(openWaarde)} incl. btw`}
                    icon={FileText}
                />
                <Stat
                    label="ingepland"
                    waarde={String(ritten.length)}
                    hint={`${teDoen.length} lopend totaal`}
                    icon={CalendarClock}
                    tint="oranje"
                />
            </div>

            <Sectie>Opvolgen</Sectie>
            <div className="grid grid-cols-2 gap-3 mb-6">
                <Stat
                    label="onder minimum"
                    waarde={String(laag.length)}
                    hint="voorraad bijbestellen"
                    icon={Warehouse}
                />
                <Stat
                    label="openstaand"
                    waarde={String(openFacturen.length)}
                    hint={`${euro(openFactuurBedrag)} te ontvangen`}
                    icon={Receipt}
                />
            </div>

            {laag.length > 0 && (
                <Card className="p-4 mb-6 flex items-start gap-3 border-amber-200 bg-amber-50">
                    <AlertTriangle size={18} strokeWidth={1.75} className="text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-sm text-amber-900">
                        <div className="font-semibold">Voorraad onder minimum</div>
                        <div className="mt-0.5 text-amber-800">
                            {laag.map((p) => `${p.naam} (${p.voorraad}/${p.minVoorraad})`).join(' · ')}
                        </div>
                        <Link
                            href="/erp/voorraad"
                            className="inline-flex items-center gap-1 mt-2 font-semibold hover:underline"
                        >
                            Naar voorraad <ArrowRight size={14} strokeWidth={2} />
                        </Link>
                    </div>
                </Card>
            )}

            <Sectie>Snel aan de slag</Sectie>
            <div className="grid grid-cols-2 gap-3 mb-6">
                {SNEL.map((s) => {
                    const Icon = s.icon;
                    return (
                        <Link key={s.href} href={s.href}>
                            <Card className="p-4 h-full hover-lift">
                                <span className="erp-tegel">
                                    <Icon size={18} strokeWidth={1.75} />
                                </span>
                                <div className="text-[15px] font-semibold text-ink-900 mt-3">{s.label}</div>
                                <div className="text-xs text-ink-500 mt-0.5">{s.sub}</div>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            <Sectie>Laatste offertes</Sectie>
            <div className="mb-6">
                <Table kolommen={['Nummer', 'Klant', 'Status', 'Incl. btw', '']}>
                    {scoped.offertes.slice(0, 5).map((o) => {
                        const klant = scoped.klanten.find((k) => k.id === o.klantId);
                        return (
                            <tr key={o.id} className="hover:bg-ink-50">
                                <Td className="font-semibold text-ink-900">{o.nummer}</Td>
                                <Td>{klant?.naam ?? '—'}</Td>
                                <Td>
                                    <Badge
                                        tone={
                                            o.status === 'akkoord'
                                                ? 'groen'
                                                : o.status === 'verstuurd'
                                                  ? 'blauw'
                                                  : 'grijs'
                                        }
                                    >
                                        {o.status}
                                    </Badge>
                                </Td>
                                <Td className="tabular">{euro(totalen(o.regels).incl)}</Td>
                                <Td>
                                    <Link href="/erp/offertes" className="text-brand-600 font-medium hover:underline">
                                        Bekijk
                                    </Link>
                                </Td>
                            </tr>
                        );
                    })}
                </Table>
            </div>

            <Sectie>Lopende orders</Sectie>
            <Table kolommen={['Nummer', 'Klant', 'Status', 'Planning', 'Bezorger']}>
                {teDoen.map((o) => {
                    const klant = scoped.klanten.find((k) => k.id === o.klantId);
                    const bez = scoped.bezorgers.find((b) => b.id === o.bezorgerId);
                    return (
                        <tr key={o.id} className="hover:bg-ink-50">
                            <Td className="font-semibold text-ink-900">{o.nummer}</Td>
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
