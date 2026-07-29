'use client';

import { useState } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { COMPANIES } from '@/lib/erp/seed';
import { useErp } from '@/lib/erp/store';
import { Badge, Card, PageHeader } from '@/components/erp/ui';

interface Check {
    status: string;
    bericht?: string;
    url?: string;
    aantalProducten?: number;
}

export default function Koppelingen() {
    const { data, company } = useErp();
    const [check, setCheck] = useState<Record<string, Check>>({});
    const [bezig, setBezig] = useState<string | null>(null);

    async function test(c: string) {
        setBezig(c);
        try {
            const res = await fetch(`/api/erp/woocommerce?company=${c}&actie=status`);
            const json = (await res.json()) as Check;
            setCheck((s) => ({ ...s, [c]: json }));
        } catch (e) {
            setCheck((s) => ({
                ...s,
                [c]: { status: 'fout', bericht: e instanceof Error ? e.message : 'Netwerkfout' },
            }));
        } finally {
            setBezig(null);
        }
    }

    return (
        <>
            <PageHeader
                titel="Koppelingen"
                sub="WooCommerce-verbinding per webshop. Credentials staan in de omgeving, nooit in de code."
            />

            <div className="space-y-4">
                {data.koppelingen.map((k) => {
                    const bedrijf = COMPANIES.find((c) => c.id === k.company)!;
                    const res = check[k.company];
                    const status = res?.status ?? k.status;
                    return (
                        <Card
                            key={k.company}
                            className={`p-5 ${k.company === company ? 'ring-1 ring-brand-200' : ''}`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="font-semibold text-ink-900">{bedrijf.domein}</h2>
                                    <div className="text-sm text-ink-500 mt-0.5">WooCommerce · REST API v3</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        tone={
                                            status === 'verbonden' ? 'groen' : status === 'fout' ? 'rood' : 'amber'
                                        }
                                    >
                                        {status}
                                    </Badge>
                                    <button
                                        onClick={() => test(k.company)}
                                        disabled={bezig === k.company}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-ink-200 text-sm text-ink-700 hover:border-brand-400 hover:text-brand-600 disabled:opacity-50"
                                    >
                                        <RefreshCw
                                            size={14}
                                            strokeWidth={1.5}
                                            className={bezig === k.company ? 'animate-spin' : ''}
                                        />
                                        Test verbinding
                                    </button>
                                </div>
                            </div>

                            {res?.bericht && (
                                <p className="mt-3 text-sm text-ink-600 bg-ink-50 border border-ink-200 rounded-md px-3 py-2">
                                    {res.bericht}
                                </p>
                            )}
                            {res?.aantalProducten !== undefined && (
                                <p className="mt-3 text-sm text-brand-700">
                                    Verbonden met {res.url} — {res.aantalProducten} producten gevonden.
                                </p>
                            )}

                            <dl className="grid gap-3 sm:grid-cols-3 mt-5 pt-4 border-t border-ink-100 text-sm">
                                <Richting label="Producten" waarde={k.richting.producten} />
                                <Richting label="Voorraad" waarde={k.richting.voorraad} />
                                <Richting label="Orders" waarde={k.richting.orders} />
                            </dl>
                        </Card>
                    );
                })}
            </div>

            <Card className="p-5 mt-6">
                <h2 className="font-medium text-ink-900 mb-2">Wat je nog moet aanleveren</h2>
                <ol className="text-sm text-ink-600 space-y-1.5 list-decimal list-inside">
                    <li>
                        WooCommerce → Instellingen → Geavanceerd → REST API → sleutel aanmaken met
                        lees/schrijf-rechten, per webshop.
                    </li>
                    <li>
                        Sleutel en secret als env-vars zetten:{' '}
                        <code className="text-xs bg-ink-100 px-1.5 py-0.5 rounded">WOO_WTW_WINKEL_KEY</code>,{' '}
                        <code className="text-xs bg-ink-100 px-1.5 py-0.5 rounded">WOO_WTWSTORE_KEY</code> enz.
                        — zie <code className="text-xs bg-ink-100 px-1.5 py-0.5 rounded">.env.example</code>.
                    </li>
                    <li>Op &quot;Test verbinding&quot; klikken; bij groen zet ik de order-webhook aan.</li>
                </ol>
            </Card>
        </>
    );
}

function Richting({ label, waarde }: { label: string; waarde: string }) {
    const [van, naar] =
        waarde === 'erp-naar-shop'
            ? ['ERP', 'webshop']
            : waarde === 'shop-naar-erp'
              ? ['webshop', 'ERP']
              : ['—', '—'];
    return (
        <div>
            <dt className="text-[11px] uppercase tracking-wider text-ink-400">{label}</dt>
            <dd className="flex items-center gap-1.5 text-ink-700 mt-1">
                {waarde === 'uit' ? (
                    <span className="text-ink-400">uit</span>
                ) : (
                    <>
                        {van}
                        <ArrowRight size={13} strokeWidth={1.5} className="text-ink-400" />
                        {naar}
                    </>
                )}
            </dd>
        </div>
    );
}
