'use client';

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
        <div className="flex items-start justify-between gap-4 mb-7">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-ink-900">{titel}</h1>
                {sub && <p className="text-sm text-ink-500 mt-1">{sub}</p>}
            </div>
            {actie}
        </div>
    );
}

export function Card({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`bg-white border border-ink-200 rounded-lg shadow-sm ${className}`}>
            {children}
        </div>
    );
}

export function Stat({
    label,
    waarde,
    hint,
}: {
    label: string;
    waarde: string;
    hint?: string;
}) {
    return (
        <Card className="p-5">
            <div className="text-[11px] uppercase tracking-wider text-ink-400">{label}</div>
            <div className="text-2xl font-semibold text-ink-900 mt-1.5 tabular">{waarde}</div>
            {hint && <div className="text-xs text-ink-500 mt-1">{hint}</div>}
        </Card>
    );
}

const TONE: Record<string, string> = {
    groen: 'bg-wtw-50 text-wtw-700 border-wtw-200',
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
                                    className="text-left font-medium text-ink-500 text-[11px] uppercase tracking-wider px-4 py-2.5 whitespace-nowrap"
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
