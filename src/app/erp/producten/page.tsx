'use client';

import { useState } from 'react';
import { useErp } from '@/lib/erp/store';
import { euro, marge } from '@/lib/erp/types';
import { Badge, Leeg, PageHeader, Table, Td } from '@/components/erp/ui';

export default function Producten() {
    const { scoped, updateProduct } = useErp();
    const [zoek, setZoek] = useState('');
    const [cat, setCat] = useState('alles');

    const categorieen = ['alles', ...Array.from(new Set(scoped.producten.map((p) => p.categorie)))];

    const lijst = scoped.producten.filter((p) => {
        const q = zoek.trim().toLowerCase();
        const match = !q || p.naam.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
        return match && (cat === 'alles' || p.categorie === cat);
    });

    return (
        <>
            <PageHeader
                titel="Producten"
                sub="Alleen de artikelen van dit bedrijf — units, kanaalwerk, filters en arbeid."
            />

            <div className="flex flex-wrap gap-2 mb-4">
                <input
                    value={zoek}
                    onChange={(e) => setZoek(e.target.value)}
                    placeholder="Zoek op naam of SKU…"
                    className="px-3 py-2 text-sm border border-ink-200 rounded-md w-64 focus:outline-none focus:border-brand-400"
                />
                <select
                    value={cat}
                    onChange={(e) => setCat(e.target.value)}
                    className="px-3 py-2 text-sm border border-ink-200 rounded-md bg-white focus:outline-none focus:border-brand-400"
                >
                    {categorieen.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
            </div>

            <Table kolommen={['SKU', 'Naam', 'Categorie', 'Inkoop', 'Verkoop', 'Marge', 'Voorraad', 'Webshop']}>
                {lijst.map((p) => {
                    const lev = scoped.leveranciers.find((l) => l.id === p.leverancierId);
                    return (
                        <tr key={p.id} className="hover:bg-ink-50">
                            <Td className="font-mono text-xs text-ink-500">{p.sku}</Td>
                            <Td className="font-medium text-ink-900">
                                {p.naam}
                                {lev && <div className="text-xs text-ink-500 font-normal">{lev.naam}</div>}
                            </Td>
                            <Td>
                                <Badge>{p.categorie}</Badge>
                            </Td>
                            <Td className="tabular">{p.inkoop ? euro(p.inkoop) : '—'}</Td>
                            <Td className="tabular">
                                <input
                                    type="number"
                                    value={p.verkoop}
                                    onChange={(e) => updateProduct(p.id, { verkoop: Number(e.target.value) })}
                                    className="w-24 px-2 py-1 border border-transparent hover:border-ink-200 focus:border-brand-400 rounded text-right tabular focus:outline-none"
                                />
                            </Td>
                            <Td className="tabular">{p.inkoop ? `${marge(p).toFixed(0)}%` : '—'}</Td>
                            <Td className="tabular">
                                {p.categorie === 'arbeid' ? (
                                    '—'
                                ) : (
                                    <span className={p.voorraad <= p.minVoorraad ? 'text-amber-700 font-medium' : ''}>
                                        {p.voorraad}
                                    </span>
                                )}
                            </Td>
                            <Td>
                                {p.wooId ? (
                                    <Badge tone="groen">#{p.wooId}</Badge>
                                ) : (
                                    <span className="text-ink-400 text-xs">niet gekoppeld</span>
                                )}
                            </Td>
                        </tr>
                    );
                })}
                {lijst.length === 0 && (
                    <tr>
                        <td colSpan={8}>
                            <Leeg tekst="Geen producten gevonden." />
                        </td>
                    </tr>
                )}
            </Table>
        </>
    );
}
