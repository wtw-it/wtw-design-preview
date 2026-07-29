'use client';

import { useState } from 'react';
import { useErp } from '@/lib/erp/store';
import { Badge, Leeg, PageHeader, Table, Td } from '@/components/erp/ui';

export default function Klanten() {
    const { scoped } = useErp();
    const [zoek, setZoek] = useState('');

    const lijst = scoped.klanten.filter((k) => {
        const q = zoek.trim().toLowerCase();
        return !q || k.naam.toLowerCase().includes(q) || k.plaats.toLowerCase().includes(q);
    });

    return (
        <>
            <PageHeader titel="Klanten" sub="Particulier en zakelijk, per bedrijf gescheiden." />

            <input
                value={zoek}
                onChange={(e) => setZoek(e.target.value)}
                placeholder="Zoek op naam of plaats…"
                className="px-3 py-2 text-sm border border-ink-200 rounded-md w-64 mb-4 focus:outline-none focus:border-wtw-400"
            />

            <Table kolommen={['Naam', 'Type', 'Contact', 'Adres', 'Bron', 'Offertes', 'Orders']}>
                {lijst.map((k) => (
                    <tr key={k.id} className="hover:bg-ink-50">
                        <Td className="font-medium text-ink-900">{k.naam}</Td>
                        <Td>
                            <Badge tone={k.type === 'zakelijk' ? 'blauw' : 'grijs'}>{k.type}</Badge>
                        </Td>
                        <Td>
                            <div>{k.email}</div>
                            <div className="text-xs text-ink-500">{k.telefoon}</div>
                        </Td>
                        <Td>
                            <div>{k.adres}</div>
                            <div className="text-xs text-ink-500">
                                {k.postcode} {k.plaats}
                            </div>
                        </Td>
                        <Td>
                            <Badge>{k.bron}</Badge>
                        </Td>
                        <Td className="tabular">{scoped.offertes.filter((o) => o.klantId === k.id).length}</Td>
                        <Td className="tabular">{scoped.orders.filter((o) => o.klantId === k.id).length}</Td>
                    </tr>
                ))}
                {lijst.length === 0 && (
                    <tr>
                        <td colSpan={7}>
                            <Leeg tekst="Geen klanten gevonden." />
                        </td>
                    </tr>
                )}
            </Table>
        </>
    );
}
