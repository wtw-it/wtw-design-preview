'use client';

import type { LucideIcon } from 'lucide-react';

/** Kleine gedeelde bouwstenen voor de ERP-schermen. */

export function PageHeader({
    titel,
    sub,
    actie,
}: {
    titel: string;
    sub?: string;
    actie?: React.ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-4 mb-5">
            <div>
                <h1 className="text-[22px] font-bold tracking-tight text-ink-900">{titel}</h1>
                {sub && <p className="text-sm text-ink-500 mt-1">{sub}</p>}
            </div>
            {actie}
        </div>
    );
}

/** Sectiekop met groen accentstaafje — zoals AGENDA / OPVOLGEN in het bedrijfssysteem. */
export function Sectie({ children }: { children: React.ReactNode }) {
    return <div className="erp-sectie mb-2.5">{children}</div>;
}

export function Card({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`bg-white border border-ink-200 rounded-2xl shadow-sm ${className}`}>
            {children}
        </div>
    );
}

export function Stat({
    label,
    waarde,
    hint,
    icon: Icon,
    tint,
}: {
    label: string;
    waarde: string;
    hint?: string;
    icon?: LucideIcon;
    /** 'oranje' voor agenda-achtige kaarten, standaard groen */
    tint?: 'oranje';
}) {
    return (
        <div className="erp-stat p-4">
            {Icon && (
                <span className={tint === 'oranje' ? 'erp-tegel erp-tegel-oranje' : 'erp-tegel'}>
                    <Icon size={18} strokeWidth={1.75} />
                </span>
            )}
            <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-brand-800 tabular">{waarde}</span>
                <span className="text-sm text-ink-600">{label}</span>
            </div>
            {hint && <div className="text-xs text-ink-500 mt-1.5">{hint}</div>}
        </div>
    );
}

const TONE: Record<string, string> = {
    groen: 'bg-brand-50 text-brand-700 border-brand-200',
    grijs: 'bg-ink-100 text-ink-600 border-ink-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rood: 'bg-red-50 text-red-700 border-red-200',
    blauw: 'bg-sky-50 text-sky-700 border-sky-200',
};

export function Badge({
    children,
    tone = 'grijs',
}: {
    children: React.ReactNode;
    tone?: keyof typeof TONE | string;
}) {
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                TONE[tone] ?? TONE.grijs
            }`}
        >
            {children}
        </span>
    );
}

export function Table({
    kolommen,
    children,
}: {
    kolommen: string[];
    children: React.ReactNode;
}) {
    return (
        <Card className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-ink-200 bg-ink-50">
                            {kolommen.map((k) => (
                                <th
                                    key={k}
                                    className="text-left font-semibold text-ink-500 text-[11px] uppercase tracking-wider px-4 py-2.5 whitespace-nowrap"
                                >
                                    {k}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100">{children}</tbody>
                </table>
            </div>
        </Card>
    );
}

export function Td({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return <td className={`px-4 py-3 text-ink-700 ${className}`}>{children}</td>;
}

export function Leeg({ tekst }: { tekst: string }) {
    return <div className="text-sm text-ink-500 px-4 py-10 text-center">{tekst}</div>;
}
