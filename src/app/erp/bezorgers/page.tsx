'use client';

import { MapPin, Phone } from 'lucide-react';
import { useErp } from '@/lib/erp/store';
import { euro } from '@/lib/erp/types';
import { Badge, Card, PageHeader, Table, Td } from '@/components/erp/ui';

export default function Bezorgers() {
    const { scoped } = useErp();

    return (
        <>
            <PageHeader
                titel="Bezorgers"
                sub="Transporteurs en hun rayon. Bezorgers zijn gedeeld tussen beide bedrijven."
            />

            <div className="grid gap-4 sm:grid-cols-2 mb-8">
                {scoped.bezorgers.map((b) => (
                    <Card key={b.id} className="p-5">
                        <h2 className="font-semibold text-ink-900">{b.naam}</h2>
                        <div className="flex items-center gap-2 text-sm text-ink-500 mt-1">
                            <MapPin size={14} strokeWidth={1.5} />
                            {b.plaats}
                        </div>

                        <dl className="grid grid-cols-2 gap-3 mt-4 text-sm">
                            <div>
                                <dt className="text-[11px] uppercase tracking-wider text-ink-400">Per rit</dt>
                                <dd className="tabular font-medium text-ink-900 mt-0.5">{euro(b.ritTarief)}</dd>
                            </div>
                            <div>
                                <dt className="text-[11px] uppercase tracking-wider text-ink-400">Buiten rayon</dt>
                                <dd className="tabular font-medium text-ink-900 mt-0.5">{euro(b.kmTarief)} / km</dd>
                            </div>
                        </dl>

                        <div className="flex flex-wrap gap-1.5 mt-4">
                            {b.rayon.map((r) => (
                                <Badge key={r}>{r}</Badge>
                            ))}
                        </div>

                        <a
                            href={`tel:${b.telefoon}`}
                            className="flex items-center gap-2 mt-4 pt-4 border-t border-ink-100 text-sm text-ink-600 hover:text-brand-600"
                        >
                            <Phone size={15} strokeWidth={1.5} />
                            {b.telefoon} · {b.contact}
                        </a>
                    </Card>
                ))}
            </div>

            <h2 className="text-sm font-medium text-ink-900 mb-3">Ingeplande ritten</h2>
            <Table kolommen={['Order', 'Datum', 'Bezorger', 'Status']}>
                {scoped.orders
                    .filter((o) => o.bezorgerId)
                    .map((o) => (
                        <tr key={o.id} className="hover:bg-ink-50">
                            <Td className="font-medium text-ink-900">{o.nummer}</Td>
                            <Td>{o.planning ?? '—'}</Td>
                            <Td>{scoped.bezorgers.find((b) => b.id === o.bezorgerId)?.naam ?? '—'}</Td>
                            <Td>
                                <Badge tone="blauw">{o.status}</Badge>
                            </Td>
                        </tr>
                    ))}
            </Table>
        </>
    );
}
