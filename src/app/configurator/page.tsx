'use client';

import { useState } from 'react';
import {
    Wind, Gauge, Sparkles, Thermometer, Wifi, Radio, Activity,
    Check, Info, Minus, Plus,
} from 'lucide-react';

type UnitId = 'q350' | 'q450' | 'q600';

const UNITS: { id: UnitId; name: string; flow: string; spec: string; price: number; icon: typeof Wind }[] = [
    { id: 'q350', name: 'ComfoAir Q350', flow: '350 m³/h', spec: 'Max 7 toevoer · 5 afvoer', price: 1895, icon: Wind },
    { id: 'q450', name: 'ComfoAir Q450', flow: '450 m³/h', spec: 'Max 9 toevoer · 7 afvoer', price: 2185, icon: Gauge },
    { id: 'q600', name: 'ComfoAir Q600', flow: '600 m³/h', spec: 'Max 12 toevoer · 9 afvoer', price: 2300, icon: Activity },
];

const EXTRAS = [
    { id: 'voorverwarmer', name: 'Voorverwarmer', sub: 'Alleen bij verwacht < −2 °C', price: 185, icon: Thermometer },
    { id: 'comfoconnect', name: 'ComfoConnect PRO', sub: 'App-bediening + monitoring', price: 280, icon: Wifi },
    { id: 'rf_module',    name: 'RF-module',         sub: 'Draadloze afstandsbediening', price: 170, icon: Radio },
    { id: 'enthalpie',    name: 'Enthalpie-wisselaar', sub: 'Vochtigheidsregeling', price: 500, icon: Sparkles },
];

function eur(n: number): string {
    return `€ ${n.toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })},-`;
}

export default function ConfiguratorPreview() {
    const [unit, setUnit] = useState<UnitId>('q450');
    const [extras, setExtras] = useState<string[]>([]);
    const [floor, setFloor] = useState<'wood' | 'concrete'>('wood');
    const [roof, setRoof] = useState<0 | 1 | 2>(1);

    const toggle = (id: string) =>
        setExtras((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

    const unitPrice = UNITS.find((u) => u.id === unit)?.price ?? 0;
    const extrasPrice = extras.reduce((s, id) => s + (EXTRAS.find((e) => e.id === id)?.price ?? 0), 0);
    const roofPrice = roof === 1 ? 475 : roof === 2 ? 775 : 0;
    const total = unitPrice + extrasPrice + roofPrice;

    return (
        <div className="max-w-3xl mx-auto px-6 py-12 sm:py-20">

            <PreviewHeader
                step="Stap 2 van 3"
                title="Welke unit past bij je woning?"
                lead="Kies de basis. De prijzen zijn voor de unit zelf — installatie wordt apart berekend."
            />

            {/* Unit-cards */}
            <section className="mt-10 mb-10">
                <SubLabel>Unit</SubLabel>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {UNITS.map((u) => {
                        const Icon = u.icon;
                        const sel = unit === u.id;
                        return (
                            <button
                                key={u.id}
                                type="button"
                                onClick={() => setUnit(u.id)}
                                className={[
                                    'group relative text-left p-5 rounded-2xl border bg-white transition-all',
                                    sel
                                        ? 'card-glow-selected'
                                        : 'border-ink-200 hover-lift',
                                ].join(' ')}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={[
                                        'w-11 h-11 rounded-xl flex items-center justify-center',
                                        sel ? 'bg-wtw-50 text-wtw-700' : 'bg-ink-100 text-ink-600',
                                    ].join(' ')}>
                                        <Icon className="w-5 h-5" strokeWidth={1.5} />
                                    </div>
                                    {sel && <Check className="w-4 h-4 text-wtw-600" strokeWidth={2.5} />}
                                </div>

                                <h3 className="font-semibold text-ink-900 leading-tight">{u.name}</h3>
                                <p className="text-xs text-ink-500 mt-0.5">{u.flow}</p>

                                <div className="mt-4 pt-4 border-t border-ink-100">
                                    <p className="text-[10px] text-ink-400 uppercase tracking-wider">Vanaf</p>
                                    <p className="text-xl font-bold text-ink-900 tabular">{eur(u.price)}</p>
                                    <p className="text-[11px] text-ink-500 mt-0.5">excl. installatie</p>
                                </div>

                                <p className="text-[11px] text-ink-500 mt-3">{u.spec}</p>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Extras */}
            <section className="mb-10">
                <SubLabel>Extra opties</SubLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {EXTRAS.map((e) => {
                        const Icon = e.icon;
                        const sel = extras.includes(e.id);
                        return (
                            <label
                                key={e.id}
                                className={[
                                    'group flex items-center gap-3 p-4 rounded-xl border bg-white cursor-pointer transition-all',
                                    sel ? 'border-wtw-500 bg-wtw-50/40' : 'border-ink-200 hover:border-ink-300',
                                ].join(' ')}
                            >
                                <input
                                    type="checkbox"
                                    checked={sel}
                                    onChange={() => toggle(e.id)}
                                    className="sr-only"
                                />
                                <div className={[
                                    'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                                    sel ? 'bg-wtw-600 border-wtw-600' : 'border-ink-300 bg-white',
                                ].join(' ')}>
                                    {sel && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                </div>
                                <Icon className="w-4 h-4 text-ink-500" strokeWidth={1.5} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-ink-900 leading-tight">{e.name}</p>
                                    <p className="text-xs text-ink-500 mt-0.5">{e.sub}</p>
                                </div>
                                <p className="text-sm font-semibold text-ink-900 tabular flex-shrink-0">{eur(e.price)}</p>
                            </label>
                        );
                    })}
                </div>
            </section>

            {/* Vloer-keuze — pill toggle iOS-stijl */}
            <section className="mb-10">
                <SubLabel>Vloertype</SubLabel>
                <div className="inline-flex p-1 rounded-full bg-ink-100">
                    {[
                        { id: 'wood',     label: 'Hout' },
                        { id: 'concrete', label: 'Beton' },
                    ].map((opt) => {
                        const sel = floor === opt.id;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setFloor(opt.id as 'wood' | 'concrete')}
                                className={[
                                    'px-6 py-2 rounded-full text-sm font-medium transition-all',
                                    sel ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500',
                                ].join(' ')}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Dakdoorvoeren-stepper */}
            <section className="mb-10">
                <SubLabel>Dakdoorvoeren</SubLabel>
                <div className="flex items-center justify-between p-4 rounded-xl border border-ink-200 bg-white">
                    <div>
                        <p className="text-sm font-medium text-ink-900">Aantal nieuwe doorvoeren</p>
                        <p className="text-xs text-ink-500 mt-0.5">
                            {roof === 0 ? 'Gebruik bestaande doorvoeren' : roof === 1 ? '+ € 475 meerprijs' : '+ € 775 meerprijs (voordelig)'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setRoof((r) => Math.max(0, r - 1) as 0 | 1 | 2)}
                            disabled={roof === 0}
                            className="w-9 h-9 rounded-full border border-ink-200 bg-white flex items-center justify-center text-ink-700 hover:border-ink-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            aria-label="Minder"
                        >
                            <Minus className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <span className="w-6 text-center font-semibold text-ink-900 tabular">{roof}</span>
                        <button
                            type="button"
                            onClick={() => setRoof((r) => Math.min(2, r + 1) as 0 | 1 | 2)}
                            disabled={roof === 2}
                            className="w-9 h-9 rounded-full border border-ink-200 bg-white flex items-center justify-center text-ink-700 hover:border-ink-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            aria-label="Meer"
                        >
                            <Plus className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Live totaal */}
            <section className="rounded-2xl bg-ink-50 p-6 sm:p-8 flex items-end justify-between">
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold">Indicatie totaal</p>
                    <p className="text-4xl font-bold text-ink-900 tabular mt-1">{eur(total)}</p>
                    <p className="text-xs text-ink-500 mt-1">Excl. btw · vaste prijs all-in na intake</p>
                </div>
                <button
                    type="button"
                    className="px-5 h-11 rounded-xl bg-wtw-600 text-white text-sm font-semibold hover:bg-wtw-700 transition-colors shadow-sm"
                >
                    Volgende →
                </button>
            </section>
        </div>
    );
}

function PreviewHeader({ step, title, lead }: { step: string; title: string; lead: string }) {
    return (
        <header className="text-center sm:text-left">
            <p className="text-[11px] uppercase tracking-wider text-wtw-700 font-semibold">{step}</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight leading-tight">{title}</h1>
            <p className="mt-3 text-ink-600 max-w-xl mx-auto sm:mx-0">{lead}</p>
        </header>
    );
}

function SubLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold mb-3">{children}</p>
    );
}
