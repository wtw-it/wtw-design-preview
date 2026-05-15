'use client';

import { Phone, Home, MessageCircle, Clock, FileText, Wind, ArrowDownRight, ArrowUpRight, Sparkles } from 'lucide-react';

export default function BedanktPreview() {
    return (
        <div className="relative max-w-2xl mx-auto px-6 py-16 sm:py-24 overflow-hidden">

            {/* Verse-lucht deeltjes — drijven traag omhoog op de achtergrond */}
            <div className="air-particles" aria-hidden>
                <span className="particle particle-1" />
                <span className="particle particle-2" />
                <span className="particle particle-3" />
                <span className="particle particle-4" />
                <span className="particle particle-5" />
                <span className="particle particle-6" />
                <span className="particle particle-7" />
                <span className="particle particle-8" />
            </div>

            {/* Ademende orb — 4,5s breath-cycle, 3 staggered aura-pulses */}
            <div className="relative flex justify-center mb-8">
                <div className="orb-wrapper">
                    <div className="orb-aura orb-aura-3" aria-hidden />
                    <div className="orb-aura orb-aura-2" aria-hidden />
                    <div className="orb-aura orb-aura-1" aria-hidden />
                    <div className="orb-core">
                        <Wind className="w-11 h-11 text-wtw-600" strokeWidth={1.5} />
                    </div>
                </div>
            </div>

            {/* Eyebrow + hero */}
            <div className="relative text-center mb-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-wtw-700 font-semibold">
                    <Sparkles className="w-3 h-3" strokeWidth={2} />
                    Welkom in 2026
                </span>
            </div>
            <div className="relative text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 tracking-tight leading-[1.05]">
                    Verse lucht <br className="sm:hidden" /> onderweg
                </h1>
                <p className="mt-5 text-base sm:text-lg text-ink-600 max-w-md mx-auto leading-relaxed">
                    Je offerte staat klaar in <span className="text-ink-900 font-medium">moncif@wtw.nl</span>. Na installatie: schone binnenlucht, dieper slapen, meer energie — automatisch, 24/7.
                </p>
            </div>

            {/* 3 micro-belofte chips met zachte gloed */}
            <div className="relative flex flex-wrap justify-center gap-2 mb-12">
                <Chip icon={ArrowDownRight} label="CO₂ omlaag" />
                <Chip icon={ArrowUpRight} label="Slaapkwaliteit omhoog" />
                <Chip icon={ArrowDownRight} label="Vocht & schimmel weg" />
            </div>

            {/* PDF-cue card met sterkere gloed */}
            <div
                className="relative rounded-3xl border border-wtw-200 bg-wtw-50/50 p-8 sm:p-10 mb-10 flex items-start gap-4"
                style={{ boxShadow: 'var(--shadow-glow-strong)' }}
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

            {/* CTA-stack */}
            <div className="relative max-w-md mx-auto space-y-2.5 mb-10">
                <CTAButton primary icon={Phone} label="Graag gebeld worden" />
                <CTAButton icon={Home} label="Adviseur op locatie (€ 75)" />
                <CTAButton icon={MessageCircle} label="WhatsApp ons" />
                <CTAButton icon={Clock} label="Ik bekijk de offerte nog even" muted />
            </div>

            <p className="relative text-center text-sm text-ink-500">
                Direct bellen: <a href="tel:+31850602297" className="text-wtw-700 font-medium hover:underline">085-0602297</a>
            </p>
        </div>
    );
}

function Chip({ icon: Icon, label }: { icon: typeof ArrowUpRight; label: string }) {
    return (
        <span
            className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12px] font-medium text-wtw-800 bg-white border border-wtw-200"
            style={{ boxShadow: '0 0 0 3px var(--color-wtw-glow-soft)' }}
        >
            <Icon className="w-3.5 h-3.5 text-wtw-600" strokeWidth={2} />
            {label}
        </span>
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
