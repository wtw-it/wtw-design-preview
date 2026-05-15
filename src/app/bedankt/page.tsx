'use client';

import { CheckCircle2, Phone, Home, MessageCircle, Clock } from 'lucide-react';

export default function BedanktPreview() {
    return (
        <div className="max-w-2xl mx-auto px-6 py-16 sm:py-24">

            {/* Check-icoon met groene gloed */}
            <div className="flex justify-center mb-8">
                <div className="relative">
                    <div
                        className="absolute inset-0 rounded-full bg-wtw-400 blur-2xl opacity-30"
                        aria-hidden
                    />
                    <div className="relative w-20 h-20 rounded-full bg-wtw-50 border border-wtw-200 flex items-center justify-center">
                        <CheckCircle2 className="w-9 h-9 text-wtw-600" strokeWidth={1.5} />
                    </div>
                </div>
            </div>

            {/* Hero */}
            <div className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 tracking-tight leading-tight">
                    Je offerte staat klaar
                </h1>
                <p className="mt-4 text-base sm:text-lg text-ink-600">
                    We sturen 'm naar <span className="text-ink-900 font-medium">moncif@wtw.nl</span> — check ook je spam-folder.
                </p>
            </div>

            {/* Bedrag-card (hero-size) */}
            <div className="rounded-3xl border border-ink-200 bg-ink-50 p-8 sm:p-10 mb-10 text-center">
                <p className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold mb-2">
                    Nieuwe installatie
                </p>
                <p className="text-5xl sm:text-6xl font-bold text-ink-900 tracking-tight tabular leading-none">
                    € 7.500,-
                </p>
                <p className="text-sm text-ink-500 mt-3">excl. btw · 27 dagen geldig</p>
                <div className="mt-6 pt-6 border-t border-ink-200">
                    <p className="text-xs text-ink-500 tabular">Offerte #T3362LDL · 15 mei 2026</p>
                </div>
            </div>

            {/* 4 CTAs gecentreerd, max 400px */}
            <div className="max-w-md mx-auto space-y-2.5 mb-10">
                <CTAButton primary icon={Phone} label="Graag gebeld worden" />
                <CTAButton icon={Home} label="Adviseur op locatie (€ 75)" />
                <CTAButton icon={MessageCircle} label="WhatsApp ons" />
                <CTAButton icon={Clock} label="Ik bekijk de offerte nog even" muted />
            </div>

            {/* Direct bellen */}
            <p className="text-center text-sm text-ink-500">
                Direct bellen: <a href="tel:+31850602297" className="text-wtw-700 font-medium hover:underline">085-0602297</a>
            </p>
        </div>
    );
}

function CTAButton({
    primary,
    muted,
    icon: Icon,
    label,
}: {
    primary?: boolean;
    muted?: boolean;
    icon: typeof Phone;
    label: string;
}) {
    return (
        <button
            type="button"
            className={[
                'w-full h-12 px-5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-all hover-lift',
                primary
                    ? 'bg-wtw-600 text-white hover:bg-wtw-700'
                    : muted
                    ? 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                    : 'bg-white border border-ink-200 text-ink-800 hover:border-ink-300',
            ].join(' ')}
        >
            <Icon className="w-4 h-4" strokeWidth={1.5} />
            {label}
        </button>
    );
}
