'use client';

import { useState, useMemo } from 'react';
import { Phone, Sun, Sunset, Moon, CalendarClock, Loader2, Check, Pencil, Home, ChevronLeft, ChevronRight } from 'lucide-react';

type Variant = 'callback' | 'agenda';

export default function AkkoordPreview() {
    const [variant, setVariant] = useState<Variant>('callback');

    return (
        <div className="max-w-2xl mx-auto px-6 py-12 sm:py-16">

            {/* Variant-switch — voor design-review */}
            <div className="flex justify-center mb-12">
                <div className="inline-flex p-1 rounded-full bg-ink-100">
                    <button
                        type="button"
                        onClick={() => setVariant('callback')}
                        className={[
                            'px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                            variant === 'callback' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500',
                        ].join(' ')}
                    >
                        <Phone className="w-3.5 h-3.5" strokeWidth={1.5} /> Terugbellen
                    </button>
                    <button
                        type="button"
                        onClick={() => setVariant('agenda')}
                        className={[
                            'px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                            variant === 'agenda' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500',
                        ].join(' ')}
                    >
                        <Home className="w-3.5 h-3.5" strokeWidth={1.5} /> Zelf inplannen
                    </button>
                </div>
            </div>

            {variant === 'callback' ? <CallbackVariant /> : <AgendaVariant />}
        </div>
    );
}

/* ────────────────────────────── CALLBACK ────────────────────────────── */

const TIJDSBLOKKEN = [
    { id: 'vandaag_morgen',    icon: CalendarClock, label: 'Vandaag of morgen', sub: '09:00 – 18:00' },
    { id: 'deze_week_ochtend', icon: Sun,           label: 'Deze week, ochtend', sub: '09:00 – 12:00' },
    { id: 'deze_week_middag',  icon: Sunset,        label: 'Deze week, middag',  sub: '13:00 – 18:00' },
    { id: 'deze_week_avond',   icon: Moon,          label: 'Deze week, avond',   sub: '18:00 – 20:00' },
];

function CallbackVariant() {
    const [tijd, setTijd] = useState<string | null>('deze_week_middag');
    const [voorkeurDag, setVoorkeurDag] = useState('');
    const [telefoon, setTelefoon] = useState('06 12 34 56 78');
    const [loading, setLoading] = useState(false);

    return (
        <>
            {/* Hero met Phone-gloed */}
            <div className="flex justify-center mb-8">
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-wtw-400 blur-2xl opacity-40" aria-hidden />
                    <div className="relative w-20 h-20 rounded-full bg-wtw-50 border border-wtw-200 flex items-center justify-center">
                        <Phone className="w-9 h-9 text-wtw-600" strokeWidth={1.5} />
                    </div>
                </div>
            </div>

            <div className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight leading-tight">
                    Top, we bellen je terug
                </h1>
                <p className="mt-3 text-ink-600">Wanneer schikt het jou het beste?</p>
            </div>

            {/* 4 tijdsblok-cards */}
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
                                <div className="w-6 h-6 rounded-full bg-wtw-500 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

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

            <SubmitButton
                disabled={!tijd}
                loading={loading}
                onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1400); }}
                label="Plan terugbel-moment"
            />
        </>
    );
}

/* ────────────────────────────── AGENDA ────────────────────────────── */

const TIME_SLOTS = ['08:00', '10:30', '13:00', '15:30'];
const DAY_NAMES = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
const MONTH_NAMES = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

function AgendaVariant() {
    const today = useMemo(() => new Date(), []);
    const [monthOffset, setMonthOffset] = useState(0);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Bouw maand-grid (Maandag = column 0)
    const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // ma=0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: ({ day: number; key: string; past: boolean; weekend: boolean } | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
        const dt = new Date(year, month, d);
        const past = dt < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const wd = dt.getDay();
        const weekend = wd === 0 || wd === 6;
        cells.push({
            day: d,
            key: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
            past,
            weekend,
        });
    }
    while (cells.length < 42) cells.push(null);

    return (
        <>
            {/* Hero met Home-gloed */}
            <div className="flex justify-center mb-8">
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-wtw-400 blur-2xl opacity-40" aria-hidden />
                    <div className="relative w-20 h-20 rounded-full bg-wtw-50 border border-wtw-200 flex items-center justify-center">
                        <Home className="w-9 h-9 text-wtw-600" strokeWidth={1.5} />
                    </div>
                </div>
            </div>

            <div className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight leading-tight">
                    Plan je afspraak in
                </h1>
                <p className="mt-3 text-ink-600">
                    Kies een datum en tijd — wij komen langs.
                </p>
            </div>

            {/* Maand-header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <button
                    type="button"
                    onClick={() => setMonthOffset((o) => Math.max(0, o - 1))}
                    disabled={monthOffset === 0}
                    className="w-9 h-9 rounded-full border border-ink-200 bg-white flex items-center justify-center text-ink-700 hover:border-wtw-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Vorige maand"
                >
                    <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <p className="font-semibold text-ink-900 capitalize">
                    {MONTH_NAMES[month]} {year}
                </p>
                <button
                    type="button"
                    onClick={() => setMonthOffset((o) => Math.min(2, o + 1))}
                    disabled={monthOffset === 2}
                    className="w-9 h-9 rounded-full border border-ink-200 bg-white flex items-center justify-center text-ink-700 hover:border-wtw-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Volgende maand"
                >
                    <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
            </div>

            {/* Dagen-header */}
            <div className="grid grid-cols-7 gap-1.5 mb-2 px-1">
                {DAY_NAMES.map((d) => (
                    <div key={d} className="text-center text-[10px] uppercase tracking-wider text-ink-400 font-semibold py-1">
                        {d}
                    </div>
                ))}
            </div>

            {/* Kalender-grid */}
            <div className="grid grid-cols-7 gap-1.5 mb-8 px-1">
                {cells.map((cell, i) => {
                    if (!cell) return <div key={`empty-${i}`} />;
                    const disabled = cell.past || cell.weekend;
                    const sel = selectedDate === cell.key;
                    return (
                        <button
                            key={cell.key}
                            type="button"
                            onClick={() => {
                                if (!disabled) {
                                    setSelectedDate(cell.key);
                                    setSelectedTime(null);
                                }
                            }}
                            disabled={disabled}
                            className={[
                                'aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all tabular',
                                sel
                                    ? 'bg-wtw-500 text-white shadow-[0_0_0_4px_var(--color-wtw-glow)]'
                                    : disabled
                                    ? 'text-ink-300 cursor-not-allowed'
                                    : 'text-ink-700 hover:bg-wtw-50 hover:text-wtw-700',
                            ].join(' ')}
                        >
                            {cell.day}
                        </button>
                    );
                })}
            </div>

            {/* Tijdsloten — zichtbaar zodra een datum is gekozen */}
            <div
                className={[
                    'mb-8 transition-opacity duration-200',
                    selectedDate ? 'opacity-100' : 'opacity-30 pointer-events-none',
                ].join(' ')}
            >
                <p className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold mb-3">
                    Tijdslot
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TIME_SLOTS.map((slot) => {
                        const sel = selectedTime === slot;
                        return (
                            <button
                                key={slot}
                                type="button"
                                onClick={() => setSelectedTime(slot)}
                                className={[
                                    'h-12 rounded-xl text-sm font-semibold tabular transition-all',
                                    sel
                                        ? 'bg-wtw-500 text-white shadow-[0_0_0_4px_var(--color-wtw-glow)]'
                                        : 'bg-white border border-ink-200 text-ink-800 hover:border-wtw-300 hover:bg-wtw-50/40',
                                ].join(' ')}
                            >
                                {slot}
                            </button>
                        );
                    })}
                </div>
            </div>

            <SubmitButton
                disabled={!selectedDate || !selectedTime}
                loading={loading}
                onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1400); }}
                label="Bevestig afspraak"
            />
        </>
    );
}

/* ────────────────────────────── SUBMIT-KNOP ────────────────────────────── */

function SubmitButton({
    disabled, loading, onClick, label,
}: { disabled: boolean; loading: boolean; onClick: () => void; label: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="w-full h-12 rounded-xl bg-wtw-500 text-white font-semibold text-[15px] hover:bg-wtw-600 disabled:bg-ink-200 disabled:text-ink-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-[0_6px_18px_-4px_rgba(16,185,129,0.40)]"
        >
            {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> Inplannen</>
            ) : (
                label
            )}
        </button>
    );
}
