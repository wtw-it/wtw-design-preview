'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    Boxes,
    Building2,
    CalendarClock,
    Check,
    ChevronDown,
    ClipboardList,
    FileText,
    LayoutDashboard,
    Leaf,
    Menu,
    MessageSquare,
    Plug,
    RefreshCw,
    Truck,
    Users,
    Warehouse,
    X,
    type LucideIcon,
} from 'lucide-react';
import { COMPANIES } from '@/lib/erp/seed';
import { useErp } from '@/lib/erp/store';

interface Item {
    href: string;
    label: string;
    sub: string;
    icon: LucideIcon;
}

/** Zelfde groepering als het bedrijfssysteem van wtw.nl. */
const GROEPEN: { titel: string; items: Item[] }[] = [
    {
        titel: 'Dagelijks',
        items: [
            { href: '/erp', label: 'Dashboard', sub: 'Overzicht van vandaag', icon: LayoutDashboard },
            { href: '/erp/chat', label: 'Master', sub: 'Offerte intypen in gewone taal', icon: MessageSquare },
            { href: '/erp/orders', label: 'Orders', sub: 'Webshop en installatie', icon: ClipboardList },
            { href: '/erp/planning', label: 'Planning', sub: 'Montage en bezorging inplannen', icon: CalendarClock },
        ],
    },
    {
        titel: 'Administratie',
        items: [
            { href: '/erp/offertes', label: 'Offertes', sub: 'Concept tot akkoord', icon: FileText },
            { href: '/erp/klanten', label: 'Klanten', sub: 'Particulier en zakelijk', icon: Users },
        ],
    },
    {
        titel: 'Magazijn',
        items: [
            { href: '/erp/producten', label: 'Producten', sub: 'Catalogus en prijzen', icon: Boxes },
            { href: '/erp/voorraad', label: 'Voorraad', sub: 'Wat er ligt en wat op is', icon: Warehouse },
            { href: '/erp/leveranciers', label: 'Leveranciers', sub: 'Econox, Wasco, Technische Unie', icon: Building2 },
            { href: '/erp/bezorgers', label: 'Bezorgers', sub: 'Freightways Katwijk', icon: Truck },
        ],
    },
    {
        titel: 'Instellingen',
        items: [
            { href: '/erp/koppelingen', label: 'Koppelingen', sub: 'WooCommerce per webshop', icon: Plug },
        ],
    },
];

/** De vijf tabs onderaan; de rest zit achter "Meer". */
const TABS: Item[] = [
    GROEPEN[0].items[0],
    GROEPEN[0].items[1],
    GROEPEN[1].items[0],
    GROEPEN[0].items[2],
    GROEPEN[2].items[1],
];

export default function Shell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { company, setCompany } = useErp();
    const [menu, setMenu] = useState(false);
    const [switcher, setSwitcher] = useState(false);
    const actief = COMPANIES.find((c) => c.id === company)!;

    return (
        <div className="min-h-screen bg-ink-50">
            {/* Kopbalk — bedrijfskiezer links, zoals in het bestaande systeem */}
            <header className="sticky top-0 z-30 bg-white border-b border-ink-200">
                <div className="h-14 px-3 flex items-center justify-between gap-2 max-w-3xl mx-auto lg:max-w-6xl">
                    <div className="relative">
                        <button
                            onClick={() => setSwitcher((v) => !v)}
                            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg border border-ink-200 bg-white hover:border-brand-300 transition-colors"
                        >
                            <span className="erp-tegel !h-7 !w-7 !rounded-lg">
                                <Building2 size={15} strokeWidth={1.75} />
                            </span>
                            <span className="text-sm font-medium text-ink-900 max-w-[9rem] truncate">
                                {actief.naam}
                            </span>
                            <ChevronDown size={15} strokeWidth={1.75} className="text-ink-400" />
                        </button>

                        {switcher && (
                            <>
                                <button
                                    className="fixed inset-0 z-10 cursor-default"
                                    onClick={() => setSwitcher(false)}
                                    aria-label="Sluiten"
                                />
                                <div className="absolute left-0 top-full mt-1.5 z-20 w-64 bg-white border border-ink-200 rounded-xl shadow-lg p-1.5">
                                    {COMPANIES.map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={() => {
                                                setCompany(c.id);
                                                setSwitcher(false);
                                            }}
                                            className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg hover:bg-ink-50 text-left"
                                        >
                                            <span className="erp-tegel !h-8 !w-8">
                                                <Building2 size={16} strokeWidth={1.75} />
                                            </span>
                                            <span className="flex-1 min-w-0">
                                                <span className="block text-sm font-medium text-ink-900 truncate">
                                                    {c.naam}
                                                </span>
                                                <span className="block text-xs text-ink-500">{c.domein}</span>
                                            </span>
                                            {c.id === company && (
                                                <Check size={16} strokeWidth={2} className="text-brand-600" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => location.reload()}
                            className="p-2 text-ink-500 hover:text-brand-600"
                            aria-label="Vernieuwen"
                        >
                            <RefreshCw size={18} strokeWidth={1.75} />
                        </button>
                        <span className="h-9 w-9 rounded-full bg-brand-700 text-white text-xs font-semibold flex items-center justify-center">
                            IN
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl lg:max-w-6xl mx-auto px-4 py-5 erp-safe-bottom">{children}</main>

            {/* Bottom-bar */}
            <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-ink-200 pb-[env(safe-area-inset-bottom)]">
                <div className="max-w-3xl lg:max-w-6xl mx-auto grid grid-cols-6">
                    {TABS.map((t) => {
                        const on = pathname === t.href;
                        const Icon = t.icon;
                        return (
                            <Link
                                key={t.href}
                                href={t.href}
                                className="flex flex-col items-center gap-1 py-2.5 text-[11px]"
                            >
                                <span
                                    className={[
                                        'h-7 w-11 rounded-lg flex items-center justify-center transition-colors',
                                        on ? 'bg-brand-700 text-white' : 'text-ink-500',
                                    ].join(' ')}
                                >
                                    <Icon size={18} strokeWidth={1.75} />
                                </span>
                                <span className={on ? 'text-brand-700 font-medium' : 'text-ink-500'}>
                                    {t.label}
                                </span>
                            </Link>
                        );
                    })}
                    <button
                        onClick={() => setMenu(true)}
                        className="flex flex-col items-center gap-1 py-2.5 text-[11px] text-ink-500"
                    >
                        <span className="h-7 w-11 flex items-center justify-center">
                            <Menu size={18} strokeWidth={1.75} />
                        </span>
                        Meer
                    </button>
                </div>
            </nav>

            {/* Drawer */}
            {menu && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="w-[85%] max-w-sm bg-white flex flex-col shadow-2xl">
                        <div className="erp-hero px-5 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-5 flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <span className="h-11 w-11 rounded-xl bg-white/15 text-white flex items-center justify-center">
                                    <Leaf size={20} strokeWidth={1.75} />
                                </span>
                                <div>
                                    <div className="text-lg font-bold text-white leading-tight">WTW</div>
                                    <div className="text-xs text-white/70">Installatie &amp; Verkoop</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setMenu(false)}
                                className="h-9 w-9 rounded-lg border border-white/30 text-white flex items-center justify-center"
                                aria-label="Menu sluiten"
                            >
                                <X size={18} strokeWidth={1.75} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-4">
                            {GROEPEN.map((g) => (
                                <div key={g.titel} className="mb-5">
                                    <div className="erp-sectie px-5 mb-2">{g.titel}</div>
                                    {g.items.map((item) => {
                                        const on = pathname === item.href;
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setMenu(false)}
                                                className={[
                                                    'flex items-center gap-3 mx-2.5 px-2.5 py-2.5 rounded-xl transition-colors',
                                                    on ? 'bg-brand-700 text-white' : 'hover:bg-ink-50',
                                                ].join(' ')}
                                            >
                                                <span
                                                    className={
                                                        on
                                                            ? 'erp-tegel !bg-white/15 !text-white'
                                                            : 'erp-tegel'
                                                    }
                                                >
                                                    <Icon size={18} strokeWidth={1.75} />
                                                </span>
                                                <span className="min-w-0">
                                                    <span
                                                        className={`block text-[15px] font-semibold ${
                                                            on ? 'text-white' : 'text-ink-900'
                                                        }`}
                                                    >
                                                        {item.label}
                                                    </span>
                                                    <span
                                                        className={`block text-xs truncate ${
                                                            on ? 'text-white/70' : 'text-ink-500'
                                                        }`}
                                                    >
                                                        {item.sub}
                                                    </span>
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        className="flex-1 bg-ink-900/40"
                        onClick={() => setMenu(false)}
                        aria-label="Menu sluiten"
                    />
                </div>
            )}
        </div>
    );
}
