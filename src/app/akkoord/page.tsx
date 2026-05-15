'use client';

import { useState } from 'react';
import { Phone, Sun, Sunset, Moon, CalendarClock, Loader2, Check, Pencil } from 'lucide-react';

const TIJDSBLOKKEN = [
    { id: 'vandaag_morgen',    icon: CalendarClock, label: 'Vandaag of morgen', sub: '09:00 – 18:00' },
    { id: 'deze_week_ochtend', icon: Sun,           label: 'Deze week, ochtend', sub: '09:00 – 12:00' },
    { id: 'deze_week_middag',  icon: Sunset,        label: 'Deze week, middag',  sub: '13:00 – 18:00' },
    { id: 'deze_week_avond',   icon: Moon,          label: 'Deze week, avond',   sub: '18:00 – 20:00' },
];

export default function AkkoordPreview() {
    const [tijd, setTijd] = useState<string | null>('deze_week_middag');
    const [voorkeurDag, setVoorkeurDag] = useState('');
    const [telefoon, setTelefoon] = useState('06 12 34 56 78');
    const [loading, setLoading] = useState(false);

    return (
        <div className="max-w-2xl mx-auto px-6 py-16 sm:py-20">

            {/* Hero met Phone-gloed */}
            <div className="flex justify-center mb-8">
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-wtw-400 blur-2xl opacity-30" aria-hidden />
                    <div className="relative w-20 h-20 rounded-full bg-wtw-50 border border-wtw-200 flex items-center justify-center">
                        <Phone className="w-9 h-9 text-wtw-600" strokeWidth={1.5} />
                    </div>
                </div>
            </div>

            <div className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight leading-tight">
                    Top, we bellen je terug
                </h1>
                <p className="mt-3 text-ink-600">
                    Wanneer schikt het jou het beste?
                </p>
            </div>

            {/* 4 tijdsblok-cards — large tap-targets, icon-left */}
            <div className="space-y-2.5 mb-8">
                {TIJDSBLOKKEN.map((b) => {
                    const Icon = b.icon;
                    const sel = tijd === b.id;
                    return (
                        <button
                            key={b.id}
                            type="button"
                            onClick={() => setTijd(b.id)}
                            className={[
                                'w-full text-left p-4 rounded-2xl border bg-white flex items-center gap-4 transition-all',
                                sel ? 'card-glow-selected' : 'border-ink-200 hover-lift',
                            ].join(' ')}
                        >
                            <div className={[
                                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                                sel ? 'bg-wtw-50 text-wtw-700' : 'bg-ink-100 text-ink-600',
                            ].join(' ')}>
                                <Icon className="w-5 h-5" strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-ink-900 leading-tight">{b.label}</p>
                                <p className="text-xs text-ink-500 mt-0.5 tabular">{b.sub}</p>
                            </div>
                            {sel && (
                                <div className="w-6 h-6 rounded-full bg-wtw-600 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Voorkeur-veld */}
            <div className="mb-4">
                <label className="block text-[11px] uppercase tracking-wider text-ink-500 font-semibold mb-2">
                    Voorkeursdag <span className="lowercase text-ink-400 font-normal normal-case tracking-normal">(optioneel)</span>
                </label>
                <input
                    type="text"
                    value={voorkeurDag}
                    onChange={(e) => setVoorkeurDag(e.target.value)}
                    placeholder="bv. liever donderdag, niet op vrijdag"
                    className="w-full px-4 h-12 rounded-xl border border-ink-200 bg-white text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-4 focus:ring-wtw-glow focus:border-wtw-500 transition-all"
                />
            </div>

            {/* Telefoon-veld met edit-icon */}
            <div className="mb-8">
                <label className="block text-[11px] uppercase tracking-wider text-ink-500 font-semibold mb-2">
                    Telefoonnummer
                </label>
                <div className="relative">
                    <input
                        type="tel"
                        value={telefoon}
                        onChange={(e) => setTelefoon(e.target.value)}
                        className="w-full pl-4 pr-11 h-12 rounded-xl border border-ink-200 bg-white text-sm text-ink-900 tabular focus:outline-none focus:ring-4 focus:ring-wtw-glow focus:border-wtw-500 transition-all"
                    />
                    <Pencil className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" strokeWidth={1.5} />
                </div>
            </div>

            {/* Submit */}
            <button
                type="button"
                onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1400); }}
                disabled={!tijd}
                className="w-full h-12 rounded-xl bg-wtw-600 text-white font-semibold text-[15px] hover:bg-wtw-700 disabled:bg-ink-200 disabled:text-ink-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
                {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> Inplannen</>
                ) : (
                    'Plan terugbel-moment'
                )}
            </button>
        </div>
    );
}
