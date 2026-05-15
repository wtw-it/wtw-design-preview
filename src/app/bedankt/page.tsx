'use client';

import { CheckCircle2, Phone, Home, MessageCircle, Clock, FileText } from 'lucide-react';

export default function BedanktPreview() {
    return (
        <div className="max-w-2xl mx-auto px-6 py-16 sm:py-24">

            {/* Check-icoon met sterke groene gloed */}
            <div className="flex justify-center mb-8">
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-wtw-400 blur-3xl opacity-50" aria-hidden />
                    <div className="relative w-20 h-20 rounded-full bg-wtw-50 border border-wtw-200 flex items-center justify-center"
                         style={{ boxShadow: 'var(--shadow-glow)' }}>
                        <CheckCircle2 className="w-9 h-9 text-wtw-600" strokeWidth={1.5} />
                    </div>
                </div>
            </div>

            <div className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 tracking-tight leading-tight">
                    Je offerte staat klaar
                </h1>
                <p className="mt-4 text-base sm:text-lg text-ink-600">
                    We sturen 'm naar <span className="text-ink-900 font-medium">moncif@wtw.nl</span> — check ook je spam-folder.
                </p>
            </div>

            {/* PDF-cue card met groene gloed */}
            <div
                className="rounded-3xl border border-wtw-200 bg-wtw-50/50 p-8 sm:p-10 mb-10 flex items-start gap-4"
                style={{ boxShadow: 'var(--shadow-glow)' }}
            >
                <div className="w-14 h-14 rounded-2xl bg-white border border-wtw-200 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-7 h-7 text-wtw-700" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-wtw-700 font-semibold mb-1">
                        Bekijk je volledige offerte
                    </p>
                    <h2 className="text-xl font-bold text-ink-900 tracking-tight">
                        Alle opties, installatie en totaalbedrag staan in de PDF
                    </h2>
                    <p className="mt-2 text-sm text-ink-600 leading-relaxed">
                        De PDF is bij de mail toegevoegd. Bewaar 'm voor je administratie.
                    </p>
                    <p className="mt-3 text-[11px] text-ink-500 tabular">
                        Offerte #T3362LDL · 15 mei 2026 · 30 dagen geldig
                    </p>
                </div>
            </div>

            <div className="max-w-md mx-auto space-y-2.5 mb-10">
                <CTAButton primary icon={Phone} label="Graag gebeld worden" />
                <CTAButton icon={Home} label="Adviseur op locatie (€ 75)" />
                <CTAButton icon={MessageCircle} label="WhatsApp ons" />
                <CTAButton icon={Clock} label="Ik bekijk de offerte nog even" muted />
            </div>

            <p className="text-center text-sm text-ink-500">
                Direct bellen: <a href="tel:+31850602297" className="text-wtw-700 font-medium hover:underline">085-0602297</a>
            </p>
        </div>
    );
}

function CTAButton({
    primary, muted, icon: Icon, label,
}: { primary?: boolean; muted?: boolean; icon: typeof Phone; label: string }) {
    return (
        <button
            type="button"
            className={[
                'w-full h-12 px-5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-all hover-lift',
                primary
                    ? 'bg-wtw-500 text-white hover:bg-wtw-600 shadow-[0_6px_18px_-4px_rgba(16,185,129,0.40)]'
                    : muted
                    ? 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                    : 'bg-white border border-ink-200 text-ink-800 hover:border-wtw-300 hover:bg-wtw-50/40',
            ].join(' ')}
        >
            <Icon className="w-4 h-4" strokeWidth={1.5} />
            {label}
        </button>
    );
}
