'use client';

import { Minus, Plus } from 'lucide-react';
import { useErp } from '@/lib/erp/store';
import { euro } from '@/lib/erp/types';
import { Badge, PageHeader, Stat, Table, Td } from '@/components/erp/ui';

export default function Voorraad() {
    const { scoped, updateProduct } = useErp();

    const fysiek = scoped.producten.filter((p) => p.categorie !== 'arbeid');
    const waarde = fysiek.reduce((s, p) => s + p.voorraad * p.inkoop, 0);
    const laag = fysiek.filter((p) => p.voorraad <= p.minVoorraad);

    return (
        <>
            <PageHeader
                titel="Voorraad"
                sub="Wat er ligt, wat bijbesteld moet worden en bij wie."
            />

            <div className="grid gap-4 sm:grid-cols-3 mb-8">
                <Stat label="Voorraadwaarde" waarde={euro(waarde)} hint="tegen inkoopprijs" />
                <Stat label="Artikelen" waarde={String(fysiek.length)} hint="exclusief arbeid" />
                <Stat label="Onder minimum" waarde={String(laag.length)} hint="actie nodig" />
            </div>

            <Table kolommen={['SKU', 'Product', 'Voorraad', 'Minimum', 'Bijbestellen bij', 'Waarde', '']}>
                {fysiek.map((p) => {
                    const lev = scoped.leveranciers.find((l) => l.id === p.leverancierId);
                    const tekort = p.voorraad <= p.minVoorraad;
                    return (
                        <tr key={p.id} className={tekort ? 'bg-amber-50/60' : 'hover:bg-ink-50'}>
                            <Td className="font-mono text-xs text-ink-500">{p.sku}</Td>
                            <Td className="font-medium text-ink-900">{p.naam}</Td>
                            <Td>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() =>
                                            updateProduct(p.id, { voorraad: Math.max(0, p.voorraad - 1) })
                                        }
                                        className="h-6 w-6 rounded border border-ink-200 flex items-center justify-center text-ink-600 hover:border-brand-400 hover:text-brand-600"
                                        aria-label="Eén af"
                                    >
                                        <Minus size={13} strokeWidth={1.5} />
                                    </button>
                                    <span className={`tabular w-8 text-center ${tekort ? 'text-amber-700 font-medium' : ''}`}>
                                        {p.voorraad}
                                    </span>
                                    <button
                                        onClick={() => updateProduct(p.id, { voorraad: p.voorraad + 1 })}
                                        className="h-6 w-6 rounded border border-ink-200 flex items-center justify-center text-ink-600 hover:border-brand-400 hover:text-brand-600"
                                        aria-label="Eén bij"
                                    >
                                        <Plus size={13} strokeWidth={1.5} />
                                    </button>
                                </div>
                            </Td>
                            <Td className="tabular text-ink-500">{p.minVoorraad}</Td>
                            <Td>{lev?.naam ?? '—'}</Td>
                            <Td className="tabular">{euro(p.voorraad * p.inkoop)}</Td>
                            <Td>{tekort && <Badge tone="amber">bijbestellen</Badge>}</Td>
                        </tr>
                    );
                })}
            </Table>
        </>
    );
}
