'use client';

export default function PdfPreview() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12">

            <div className="text-center mb-10">
                <p className="text-[11px] uppercase tracking-wider text-wtw-700 font-semibold">PDF mockup</p>
                <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight">
                    Offerte-PDF
                </h1>
                <p className="mt-3 text-ink-600 max-w-xl mx-auto">
                    Stripe-stijl items-tabel met unit + extras + installatie als aparte regels. Subtiele dunne borders.
                </p>
            </div>

            <div className="a4 mx-auto bg-white rounded-md shadow-lg relative overflow-hidden border border-ink-200">

                <div className="absolute inset-0 watermark">VOORBEELD</div>

                <div className="relative h-full flex flex-col px-10 py-10 text-[11px] text-ink-700">

                    {/* Header */}
                    <header className="flex items-start justify-between pb-6 border-b border-ink-200">
                        <img src="/wtw-logo.jpg" alt="WTW.nl" className="h-8" />
                        <div className="text-right">
                            <p className="text-[9px] uppercase tracking-wider text-ink-500">Offerte</p>
                            <p className="font-bold text-ink-900 text-sm">#T3362LDL</p>
                            <p className="text-[9px] text-ink-500 mt-0.5">15 mei 2026</p>
                        </div>
                    </header>

                    {/* Klant info */}
                    <div className="grid grid-cols-2 gap-8 mt-6">
                        <div>
                            <p className="text-[9px] uppercase tracking-wider text-ink-500 mb-1">Voor</p>
                            <p className="font-semibold text-ink-900">Moncif Hakmaoui</p>
                            <p className="text-ink-600 leading-tight">Dynamoweg 1, 2627 CG Delft</p>
                            <p className="text-ink-500">moncif@wtw.nl</p>
                            <p className="text-ink-500">085-0602297</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] uppercase tracking-wider text-ink-500 mb-1">Geldig tot</p>
                            <p className="font-semibold text-ink-900">14 juni 2026</p>
                            <p className="text-[9px] text-ink-500 mt-3 uppercase tracking-wider">Status</p>
                            <p className="text-ink-700">In afwachting van akkoord</p>
                        </div>
                    </div>

                    {/* Items-tabel — Unit + Extras + Installatie netjes uitgesplitst */}
                    <table className="mt-6 w-full border-collapse text-[10.5px]">
                        <thead>
                            <tr className="border-b border-ink-200">
                                <th className="text-left py-2 font-semibold text-[9px] uppercase tracking-wider text-ink-500">Omschrijving</th>
                                <th className="text-right py-2 w-10 font-semibold text-[9px] uppercase tracking-wider text-ink-500">#</th>
                                <th className="text-right py-2 w-20 font-semibold text-[9px] uppercase tracking-wider text-ink-500">Prijs</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Unit */}
                            <tr className="border-b border-ink-100">
                                <td className="py-2.5">
                                    <p className="text-ink-900 font-medium">Zehnder ComfoAir Q450</p>
                                    <p className="text-[9px] text-ink-500 mt-0.5">Basisunit · 450 m³/h · kaal</p>
                                </td>
                                <td className="text-right text-ink-500">1</td>
                                <td className="text-right text-ink-900 tabular">€ 2.185,-</td>
                            </tr>

                            {/* Extras — naam + prijs per stuk */}
                            <tr className="border-b border-ink-100">
                                <td className="py-2.5">
                                    <p className="text-ink-900">ComfoConnect PRO</p>
                                    <p className="text-[9px] text-ink-500 mt-0.5">App-bediening + monitoring</p>
                                </td>
                                <td className="text-right text-ink-500">1</td>
                                <td className="text-right text-ink-900 tabular">€ 280,-</td>
                            </tr>
                            <tr className="border-b border-ink-100">
                                <td className="py-2.5">
                                    <p className="text-ink-900">Enthalpie-wisselaar</p>
                                    <p className="text-[9px] text-ink-500 mt-0.5">Vochtigheidsregeling</p>
                                </td>
                                <td className="text-right text-ink-500">1</td>
                                <td className="text-right text-ink-900 tabular">€ 500,-</td>
                            </tr>

                            {/* Installatie-component — materiaal + arbeid apart */}
                            <tr className="border-b border-ink-100">
                                <td className="py-2.5">
                                    <p className="text-ink-900 font-medium">Installatie — materiaal (2 verdiepingen)</p>
                                    <p className="text-[9px] text-ink-500 mt-0.5">Kanalen, ophang, montagemateriaal · excl. ventielen</p>
                                </td>
                                <td className="text-right text-ink-500">1</td>
                                <td className="text-right text-ink-900 tabular">€ 1.750,-</td>
                            </tr>
                            <tr className="border-b border-ink-100">
                                <td className="py-2.5">
                                    <p className="text-ink-900 font-medium">Installatie — arbeid (2 verdiepingen)</p>
                                    <p className="text-[9px] text-ink-500 mt-0.5">Plaatsing, aansluitingen, inregelen</p>
                                </td>
                                <td className="text-right text-ink-500">1</td>
                                <td className="text-right text-ink-900 tabular">€ 2.270,-</td>
                            </tr>
                            <tr className="border-b border-ink-100">
                                <td className="py-2.5">
                                    <p className="text-ink-900">2 dakdoorvoeren</p>
                                    <p className="text-[9px] text-ink-500 mt-0.5">Voordelig pakket-tarief</p>
                                </td>
                                <td className="text-right text-ink-500">1</td>
                                <td className="text-right text-ink-900 tabular">€ 775,-</td>
                            </tr>
                            <tr className="border-b border-ink-100">
                                <td className="py-2.5">
                                    <p className="text-ink-900">Inregelen + meting</p>
                                    <p className="text-[9px] text-ink-500 mt-0.5">Per ventiel gebalanceerd + rapport</p>
                                </td>
                                <td className="text-right text-ink-500">1</td>
                                <td className="text-right text-ink-900 tabular">incl.</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Totalen rechts — subtotaal = unit 2.185 + extras 280+500 + installatie-materiaal 1.750 + installatie-arbeid 2.270 + 2 dakdoorvoeren 775 = 7.760 */}
                    <div className="mt-4 ml-auto w-64 text-[10.5px]">
                        <div className="flex justify-between py-1">
                            <span className="text-ink-500">Subtotaal</span>
                            <span className="text-ink-700 tabular">€ 7.760,-</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-ink-500">BTW 21%</span>
                            <span className="text-ink-700 tabular">€ 1.630,-</span>
                        </div>
                        <div className="flex justify-between py-2 border-t-2 border-ink-900 mt-1 font-bold text-ink-900">
                            <span>Totaal incl. btw</span>
                            <span className="tabular">€ 9.390,-</span>
                        </div>
                    </div>

                    {/* Voorwaarden */}
                    <div className="mt-8 pt-4 border-t border-ink-200 text-[9px] text-ink-500 space-y-0.5">
                        <p>2 jaar garantie op installatie & montage · 2 jaar fabrieksgarantie unit · 2 jaar garantie op onderhoudswerk.</p>
                        <p>Offerte 30 dagen geldig vanaf factuurdatum.</p>
                        <p>Burenkorting: 5% per buur, 9% bij 10+ buren.</p>
                        <p>Mogelijk € 400 ISDE-subsidie per WTW-unit — geregeld via simpelsubsidie.nl.</p>
                    </div>

                    <div className="mt-auto pt-6 text-center text-[8.5px] text-ink-500 leading-relaxed">
                        <p className="font-semibold text-ink-700">WTW B.V. · Innovation in Ventilation</p>
                        <p>Dynamoweg 1, 2627 CG Delft · 085-0602297 · info@wtw.nl</p>
                        <p>KvK 99600099 · BTW NL869055811B01 · Officieel dealer Zehnder · Renson · Duco</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
