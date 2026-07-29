'use client';

import { Mail, Phone } from 'lucide-react';
import { useErp } from '@/lib/erp/store';
import { Badge, Card, PageHeader } from '@/components/erp/ui';

const BESTELWIJZE: Record<string, string> = {
    portal: 'Bestelportaal',
    email: 'E-mail',
    edi: 'EDI-koppeling',
};

export default function Leveranciers() {
    const { scoped } = useErp();

    return (
        <>
            <PageHeader
                titel="Leveranciers"
                sub="Inkoopvoorwaarden en bestelroutes per leverancier."
            />

            <div className="grid gap-4 sm:grid-cols-2">
                {scoped.leveranciers.map((l) => {
                    const aantal = scoped.producten.filter((p) => p.leverancierId === l.id).length;
                    return (
                        <Card key={l.id} className="p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="font-semibold text-ink-900">{l.naam}</h2>
                                    <div className="text-xs text-ink-500 mt-0.5">Klantnr. {l.klantnummer}</div>
                                </div>
                                <Badge tone="blauw">{BESTELWIJZE[l.bestelwijze]}</Badge>
                            </div>

                            <dl className="grid grid-cols-3 gap-3 mt-4 text-sm">
                                <div>
                                    <dt className="text-[11px] uppercase tracking-wider text-ink-400">Korting</dt>
                                    <dd className="tabular font-medium text-ink-900 mt-0.5">{l.korting}%</dd>
                                </div>
                                <div>
                                    <dt className="text-[11px] uppercase tracking-wider text-ink-400">Levertijd</dt>
                                    <dd className="tabular font-medium text-ink-900 mt-0.5">
                                        {l.levertijd} {l.levertijd === 1 ? 'dag' : 'dagen'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-[11px] uppercase tracking-wider text-ink-400">Artikelen</dt>
                                    <dd className="tabular font-medium text-ink-900 mt-0.5">{aantal}</dd>
                                </div>
                            </dl>

                            <div className="mt-4 pt-4 border-t border-ink-100 space-y-1.5 text-sm text-ink-600">
                                <a href={`mailto:${l.email}`} className="flex items-center gap-2 hover:text-brand-600">
                                    <Mail size={15} strokeWidth={1.5} />
                                    {l.email}
                                </a>
                                <a href={`tel:${l.telefoon}`} className="flex items-center gap-2 hover:text-brand-600">
                                    <Phone size={15} strokeWidth={1.5} />
                                    {l.telefoon}
                                </a>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </>
    );
}
