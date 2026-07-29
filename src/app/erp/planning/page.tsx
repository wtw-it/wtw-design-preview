'use client';

import { CalendarClock, MapPin, Truck } from 'lucide-react';
import { useErp } from '@/lib/erp/store';
import { euro, totalen } from '@/lib/erp/types';
import { Badge, Card, Leeg, PageHeader, Sectie } from '@/components/erp/ui';

/** Toont de eerstvolgende 14 dagen; orders zonder datum staan apart. */
function komendeDagen(n: number): string[] {
    const start = new Date();
    return Array.from({ length: n }, (_, i) => {
        const d = new Date(start.getTime() + i * 864e5);
        return d.toISOString().slice(0, 10);
    });
}

function dagLabel(iso: string): string {
    const d = new Date(iso + 'T00:00:00');
    const vandaag = new Date().toISOString().slice(0, 10);
    const morgen = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
    if (iso === vandaag) return 'Vandaag';
    if (iso === morgen) return 'Morgen';
    return d.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function Planning() {
    const { scoped, updateOrder } = useErp();

    const dagen = komendeDagen(14).filter((d) => scoped.orders.some((o) => o.planning === d));
    const ongepland = scoped.orders.filter(
        (o) => !o.planning && o.status !== 'gefactureerd' && o.status !== 'geannuleerd',
    );

    return (
        <>
            <PageHeader titel="Planning" sub="Montage en bezorging voor de komende twee weken." />

            {ongepland.length > 0 && (
                <>
                    <Sectie>Nog in te plannen</Sectie>
                    <div className="space-y-2.5 mb-6">
                        {ongepland.map((o) => {
                            const klant = scoped.klanten.find((k) => k.id === o.klantId);
                            return (
                                <Card key={o.id} className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="font-semibold text-ink-900">{o.nummer}</div>
                                            <div className="text-sm text-ink-500 truncate">{klant?.naam}</div>
                                            {klant && (
                                                <div className="flex items-center gap-1.5 text-xs text-ink-500 mt-1">
                                                    <MapPin size={13} strokeWidth={1.75} />
                                                    {klant.postcode} {klant.plaats}
                                                </div>
                                            )}
                                        </div>
                                        <Badge tone="amber">{o.status}</Badge>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-ink-100">
                                        <input
                                            type="date"
                                            value=""
                                            onChange={(e) =>
                                                updateOrder(o.id, {
                                                    planning: e.target.value || null,
                                                    status: e.target.value ? 'ingepland' : o.status,
                                                })
                                            }
                                            className="text-sm border border-ink-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-400"
                                        />
                                        <select
                                            value={o.bezorgerId ?? ''}
                                            onChange={(e) => updateOrder(o.id, { bezorgerId: e.target.value || null })}
                                            className="text-sm border border-ink-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-brand-400"
                                        >
                                            <option value="">Bezorger…</option>
                                            {scoped.bezorgers.map((b) => (
                                                <option key={b.id} value={b.id}>
                                                    {b.naam}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}

            <Sectie>Agenda</Sectie>
            {dagen.length === 0 ? (
                <Card>
                    <Leeg tekst="Niets ingepland in de komende twee weken." />
                </Card>
            ) : (
                <div className="space-y-5">
                    {dagen.map((dag) => {
                        const opDag = scoped.orders.filter((o) => o.planning === dag);
                        return (
                            <div key={dag}>
                                <div className="flex items-center gap-2 mb-2">
                                    <CalendarClock size={15} strokeWidth={1.75} className="text-brand-600" />
                                    <span className="text-sm font-semibold text-ink-900 first-letter:uppercase">
                                        {dagLabel(dag)}
                                    </span>
                                    <span className="text-xs text-ink-400">
                                        {opDag.length} {opDag.length === 1 ? 'rit' : 'ritten'}
                                    </span>
                                </div>

                                <div className="space-y-2.5">
                                    {opDag.map((o) => {
                                        const klant = scoped.klanten.find((k) => k.id === o.klantId);
                                        const bez = scoped.bezorgers.find((b) => b.id === o.bezorgerId);
                                        return (
                                            <Card key={o.id} className="p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div className="font-semibold text-ink-900">{o.nummer}</div>
                                                        <div className="text-sm text-ink-500">{klant?.naam}</div>
                                                        {klant && (
                                                            <div className="flex items-center gap-1.5 text-xs text-ink-500 mt-1">
                                                                <MapPin size={13} strokeWidth={1.75} />
                                                                {klant.adres}, {klant.plaats}
                                                            </div>
                                                        )}
                                                        {bez && (
                                                            <div className="flex items-center gap-1.5 text-xs text-ink-500 mt-1">
                                                                <Truck size={13} strokeWidth={1.75} />
                                                                {bez.naam}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <Badge tone="blauw">{o.status}</Badge>
                                                        <div className="text-sm tabular text-ink-700 mt-1.5">
                                                            {euro(totalen(o.regels).incl)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
