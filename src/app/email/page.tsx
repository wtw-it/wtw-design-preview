'use client';

import { ShieldCheck, Wallet, MapPin, Award, Phone, Home, MessageCircle, Clock, Leaf } from 'lucide-react';

export default function EmailPreview() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12">

            {/* Page intro */}
            <div className="text-center mb-10">
                <p className="text-[11px] uppercase tracking-wider text-wtw-700 font-semibold">Email-preview</p>
                <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight">
                    Premium order-confirmation
                </h1>
                <p className="mt-3 text-ink-600 max-w-xl mx-auto">
                    Centered layout (max 500px), Lucide trust-iconen, ISDE-callout met groene gloed-border.
                </p>
            </div>

            {/* Device frame (mobile preview) */}
            <div className="device-frame max-w-[420px] mx-auto">
                <div className="device-screen">
                    <EmailBody />
                </div>
            </div>
        </div>
    );
}

function EmailBody() {
    return (
        <div className="bg-white" style={{ fontFamily: 'var(--font-sans)' }}>
            <div className="px-6 py-10 max-w-[500px] mx-auto text-center">

                {/* Logo */}
                <img src="/wtw-logo.jpg" alt="WTW.nl" className="h-10 mx-auto mb-8" />

                {/* Hero */}
                <h1 className="text-2xl font-bold text-ink-900 tracking-tight">Bedankt, Moncif.</h1>
                <p className="mt-2 text-sm text-ink-600">
                    Je offerte voor nieuwe installatie ligt klaar.
                </p>
                <p className="text-xs text-ink-500">Binnen 1 week ingepland.</p>

                {/* Bedrag-blok */}
                <div className="mt-10 mb-8 rounded-2xl bg-ink-50 px-6 py-8">
                    <p className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold mb-2">
                        Nieuwe installatie
                    </p>
                    <p className="text-4xl font-bold text-ink-900 tracking-tight tabular leading-none">
                        € 7.500,-
                        <span className="ml-1.5 text-xs font-normal text-ink-500 align-middle">excl. btw</span>
                    </p>
                    <p className="mt-3 text-[11px] text-ink-500 tabular">
                        Offerte #T3362LDL · 15 mei 2026
                    </p>
                </div>

                {/* ISDE-callout met groene gloed */}
                <div
                    className="mb-8 rounded-xl px-4 py-3 text-left"
                    style={{
                        background: 'var(--color-wtw-50)',
                        border: '1px solid var(--color-wtw-200)',
                        boxShadow: 'var(--shadow-glow)',
                    }}
                >
                    <div className="flex items-start gap-2.5">
                        <Leaf className="w-4 h-4 text-wtw-700 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <div>
                            <p className="text-sm font-semibold text-wtw-800 leading-tight">
                                Mogelijk € 400 ISDE-subsidie per WTW-unit
                            </p>
                            <p className="text-xs text-ink-600 mt-1 leading-snug">
                                Wij regelen de aanvraag via simpelsubsidie.nl.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Trust-strip met Lucide icoontjes */}
                <div className="mb-8 flex items-center justify-between gap-2 text-[11px] text-ink-500">
                    <TrustItem icon={ShieldCheck} label="2 jaar garantie" />
                    <TrustItem icon={Wallet} label="Vaste prijs" />
                    <TrustItem icon={MapPin} label="Geen voorrij" />
                    <TrustItem icon={Award} label="Off. dealer" />
                </div>

                {/* PDF-notice */}
                <p className="mb-10 text-xs text-ink-500">
                    In de bijgevoegde PDF vind je alle details.
                </p>

                {/* Kies vervolgstap */}
                <p className="mb-5 text-base font-semibold text-ink-900">Kies je vervolgstap</p>

                <div className="space-y-2 max-w-[320px] mx-auto">
                    <EmailCTA primary icon={Phone} label="Graag gebeld worden" />
                    <EmailCTA icon={Home} label="Adviseur op locatie (€ 75)" />
                    <EmailCTA icon={MessageCircle} label="WhatsApp ons" />
                    <EmailCTA icon={Clock} label="Ik bekijk de offerte nog even" />
                </div>

                <p className="mt-6 mb-12 text-xs text-ink-500">
                    Direct bellen: <span className="text-wtw-700 font-medium">085-0602297</span>
                </p>

                {/* Footer */}
                <div className="pt-6 border-t border-ink-200 text-xs text-ink-500 space-y-2">
                    <p className="font-semibold text-ink-900">Vragen onderweg?</p>
                    <p>
                        <span className="text-wtw-700">085-0602297</span>
                        <span className="text-ink-300 mx-1.5">·</span>
                        <span className="text-wtw-700">WhatsApp</span>
                        <span className="text-ink-300 mx-1.5">·</span>
                        <span className="text-wtw-700">info@wtw.nl</span>
                    </p>
                    <p className="mt-4 text-[10px] text-ink-400">
                        WTW B.V. · Dynamoweg 1, 2627 CG Delft · KvK 99600099
                    </p>
                    <p className="text-[10px] text-ink-400">
                        Officieel dealer Zehnder · Renson · Duco · Trustpilot 4,5/5
                    </p>
                </div>
            </div>
        </div>
    );
}

function TrustItem({ icon: Icon, label }: { icon: typeof ShieldCheck; label: string }) {
    return (
        <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <Icon className="w-4 h-4 text-wtw-600" strokeWidth={1.5} />
            <span className="truncate">{label}</span>
        </div>
    );
}

function EmailCTA({ primary, icon: Icon, label }: { primary?: boolean; icon: typeof Phone; label: string }) {
    return (
        <button
            type="button"
            className={[
                'w-full h-11 px-4 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 transition-colors',
                primary
                    ? 'bg-wtw-600 text-white hover:bg-wtw-700'
                    : 'bg-white border border-ink-200 text-ink-800 hover:border-ink-300',
            ].join(' ')}
        >
            <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
            {label}
        </button>
    );
}
