'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    Boxes,
    Building2,
    ClipboardList,
    FileText,
    LayoutDashboard,
    Menu,
    MessageSquare,
    Plug,
    Truck,
    Users,
    Warehouse,
    X,
} from 'lucide-react';
import { COMPANIES } from '@/lib/erp/seed';
import { useErp } from '@/lib/erp/store';

const NAV = [
    { href: '/erp', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/erp/chat', label: 'Master chat', icon: MessageSquare },
    { href: '/erp/offertes', label: 'Offertes', icon: FileText },
    { href: '/erp/orders', label: 'Orders', icon: ClipboardList },
    { href: '/erp/producten', label: 'Producten', icon: Boxes },
    { href: '/erp/voorraad', label: 'Voorraad', icon: Warehouse },
    { href: '/erp/klanten', label: 'Klanten', icon: Users },
    { href: '/erp/leveranciers', label: 'Leveranciers', icon: Building2 },
    { href: '/erp/bezorgers', label: 'Bezorgers', icon: Truck },
    { href: '/erp/koppelingen', label: 'Koppelingen', icon: Plug },
];

export default function Shell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { company, setCompany } = useErp();
    const [open, setOpen] = useState(false);
    const actief = COMPANIES.find((c) => c.id === company)!;

    return (
        <div className="min-h-screen flex bg-ink-50">
            {/* Sidebar */}
            <aside
                className={[
                    'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-ink-200 flex flex-col',
                    'transition-transform lg:translate-x-0',
                    open ? 'translate-x-0' : '-translate-x-full',
                ].join(' ')}
            >
                <div className="h-16 px-5 flex items-center justify-between border-b border-ink-200">
                    <Link href="/erp" className="flex items-center gap-2.5">
                        <img src="/wtw-logo.jpg" alt="WTW" className="h-6 w-auto" />
                        <span className="text-[11px] tracking-wider uppercase text-ink-500">ERP</span>
                    </Link>
                    <button
                        onClick={() => setOpen(false)}
                        className="lg:hidden p-1.5 text-ink-500"
                        aria-label="Menu sluiten"
                    >
                        <X size={18} strokeWidth={1.5} />
                    </button>
                </div>

                {/* Bedrijfs-switch */}
                <div className="p-3 border-b border-ink-200">
                    <div className="text-[10px] uppercase tracking-wider text-ink-400 px-2 pb-1.5">
                        Bedrijf
                    </div>
                    {COMPANIES.map((c) => {
                        const on = c.id === company;
                        return (
                            <button
                                key={c.id}
                                onClick={() => setCompany(c.id)}
                                className={[
                                    'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors',
                                    on ? 'bg-ink-100 text-ink-900 font-medium' : 'text-ink-600 hover:bg-ink-50',
                                ].join(' ')}
                            >
                                <span
                                    className="h-2 w-2 rounded-full shrink-0"
                                    style={{ background: on ? c.accent : 'var(--color-ink-300)' }}
                                />
                                {c.domein}
                            </button>
                        );
                    })}
                </div>

                <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
                    {NAV.map((item) => {
                        const on = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={[
                                    'flex items-center gap-3 px-2.5 py-2 rounded-md text-sm transition-colors',
                                    on
                                        ? 'bg-wtw-50 text-wtw-700 font-medium'
                                        : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
                                ].join(' ')}
                            >
                                <Icon size={17} strokeWidth={1.5} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-ink-200 text-[11px] text-ink-400 leading-relaxed">
                    Installatie &amp; Verkoop
                    <br />
                    Los van de wtw.nl-ERP
                </div>
            </aside>

            {open && (
                <button
                    className="fixed inset-0 z-40 bg-ink-900/20 lg:hidden"
                    onClick={() => setOpen(false)}
                    aria-label="Menu sluiten"
                />
            )}

            {/* Content */}
            <div className="flex-1 lg:pl-64 min-w-0">
                <header className="h-16 bg-white/85 backdrop-blur border-b border-ink-200 sticky top-0 z-30 flex items-center gap-3 px-5">
                    <button
                        onClick={() => setOpen(true)}
                        className="lg:hidden p-1.5 text-ink-600"
                        aria-label="Menu openen"
                    >
                        <Menu size={20} strokeWidth={1.5} />
                    </button>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="h-2 w-2 rounded-full" style={{ background: actief.accent }} />
                        <span className="font-medium text-ink-900">{actief.naam}</span>
                        <span className="text-ink-400">·</span>
                        <span className="text-ink-500">{actief.domein}</span>
                    </div>
                </header>
                <main className="p-5 sm:p-8 max-w-6xl">{children}</main>
            </div>
        </div>
    );
}
