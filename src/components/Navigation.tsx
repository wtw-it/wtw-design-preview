'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const TABS = [
    { href: '/configurator', label: 'Configurator' },
    { href: '/bedankt',      label: 'Bedankt' },
    { href: '/email',        label: 'Email' },
    { href: '/akkoord',      label: 'Akkoord' },
    { href: '/pdf',          label: 'PDF' },
];

export default function Navigation() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-ink-200">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/configurator" className="flex items-center gap-2.5">
                    <img src="/wtw-logo.jpg" alt="WTW.nl" className="h-7 w-auto" />
                    <span className="text-[11px] tracking-wider uppercase text-ink-500 hidden sm:inline">
                        Design Preview
                    </span>
                </Link>

                {/* Desktop tabs */}
                <nav className="hidden md:flex items-center gap-1">
                    {TABS.map((t) => {
                        const active = pathname === t.href;
                        return (
                            <Link
                                key={t.href}
                                href={t.href}
                                className={[
                                    'px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors',
                                    active
                                        ? 'bg-ink-100 text-ink-900'
                                        : 'text-ink-600 hover:text-ink-900 hover:bg-ink-50',
                                ].join(' ')}
                            >
                                {t.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Mobile hamburger */}
                <button
                    type="button"
                    onClick={() => setOpen((s) => !s)}
                    className="md:hidden p-2 -mr-2 text-ink-700 hover:text-ink-900"
                    aria-label="Menu"
                >
                    {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile dropdown */}
            {open && (
                <div className="md:hidden border-t border-ink-200 bg-white">
                    <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
                        {TABS.map((t) => {
                            const active = pathname === t.href;
                            return (
                                <Link
                                    key={t.href}
                                    href={t.href}
                                    onClick={() => setOpen(false)}
                                    className={[
                                        'px-3 py-2.5 rounded-md text-sm font-medium',
                                        active
                                            ? 'bg-wtw-50 text-wtw-700'
                                            : 'text-ink-600',
                                    ].join(' ')}
                                >
                                    {t.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            )}
        </header>
    );
}
