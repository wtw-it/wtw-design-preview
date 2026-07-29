import type {
    Bezorger,
    Company,
    ErpData,
    Klant,
    Koppeling,
    Leverancier,
    Offerte,
    Order,
    Product,
} from './types';

/**
 * Seed-data. Vervangt de database zolang Supabase nog niet is aangesloten
 * (zie `supabase/schema.sql`). Prijzen zijn realistisch maar indicatief.
 */

export const COMPANIES: Company[] = [
    {
        id: 'wtw-winkel',
        naam: 'WTW-Winkel B.V.',
        domein: 'wtw-winkel.nl',
        kvk: '00000000',
        btw: 'NL000000000B01',
        accent: '#10B981',
    },
    {
        id: 'wtwstore',
        naam: 'WTW Store B.V.',
        domein: 'wtwstore.com',
        kvk: '00000000',
        btw: 'NL000000000B01',
        accent: '#0EA5E9',
    },
];

export const LEVERANCIERS: Leverancier[] = [
    {
        id: 'lev-econox',
        company: ['wtw-winkel', 'wtwstore'],
        naam: 'Econox',
        klantnummer: 'EC-10442',
        email: 'orders@econox.nl',
        telefoon: '+31 (0)88 000 0001',
        levertijd: 3,
        korting: 32,
        bestelwijze: 'portal',
    },
    {
        id: 'lev-wasco',
        company: ['wtw-winkel', 'wtwstore'],
        naam: 'Wasco',
        klantnummer: 'WA-88213',
        email: 'bestellingen@wasco.nl',
        telefoon: '+31 (0)88 000 0002',
        levertijd: 1,
        korting: 24,
        bestelwijze: 'edi',
    },
    {
        id: 'lev-tu',
        company: ['wtw-winkel'],
        naam: 'Technische Unie',
        klantnummer: 'TU-51907',
        email: 'order@technischeunie.nl',
        telefoon: '+31 (0)88 000 0003',
        levertijd: 1,
        korting: 27,
        bestelwijze: 'portal',
    },
];

export const BEZORGERS: Bezorger[] = [
    {
        id: 'bez-freightways',
        naam: 'Freightways Katwijk',
        plaats: 'Katwijk',
        contact: 'Planning',
        telefoon: '+31 (0)71 000 0004',
        ritTarief: 45,
        kmTarief: 0.65,
        rayon: ['Katwijk', 'Leiden', 'Noordwijk', 'Den Haag', 'Alphen a/d Rijn'],
    },
];

const p = (
    id: string,
    company: Product['company'],
    sku: string,
    naam: string,
    categorie: Product['categorie'],
    inkoop: number,
    verkoop: number,
    voorraad: number,
    minVoorraad: number,
    leverancierId: string | null,
    wooId: number | null = null,
): Product => ({
    id,
    company,
    sku,
    naam,
    categorie,
    inkoop,
    verkoop,
    btwTarief: categorie === 'arbeid' ? 21 : 21,
    voorraad,
    minVoorraad,
    leverancierId,
    wooId,
    actief: true,
});

export const PRODUCTEN: Product[] = [
    p('prd-001', 'wtw-winkel', 'WTW-350-A', 'WTW-unit 350 m³/h — comfort', 'wtw-unit', 780, 1295, 6, 3, 'lev-econox', 1201),
    p('prd-002', 'wtw-winkel', 'WTW-450-A', 'WTW-unit 450 m³/h — comfort plus', 'wtw-unit', 940, 1595, 4, 2, 'lev-econox', 1202),
    p('prd-003', 'wtwstore', 'WTW-500-P', 'WTW-unit 500 m³/h — pro', 'wtw-unit', 1180, 1975, 2, 2, 'lev-econox', 3301),
    p('prd-004', 'wtw-winkel', 'KAN-125-50', 'Flexibel kanaal Ø125 — 50 m', 'kanaalwerk', 96, 179, 18, 6, 'lev-wasco', 1210),
    p('prd-005', 'wtw-winkel', 'KAN-160-50', 'Flexibel kanaal Ø160 — 50 m', 'kanaalwerk', 128, 229, 9, 6, 'lev-wasco', 1211),
    p('prd-006', 'wtw-winkel', 'VNT-125-W', 'Ventiel Ø125 wit — afzuig', 'ventiel', 6.4, 14.5, 120, 40, 'lev-tu', 1220),
    p('prd-007', 'wtw-winkel', 'VNT-125-T', 'Ventiel Ø125 wit — toevoer', 'ventiel', 6.4, 14.5, 96, 40, 'lev-tu', 1221),
    p('prd-008', 'wtwstore', 'FIL-G4-SET', 'Filterset G4 (2 st.)', 'filter', 8.9, 24.95, 210, 60, 'lev-wasco', 3310),
    p('prd-009', 'wtwstore', 'FIL-F7-SET', 'Filterset F7 pollen (2 st.)', 'filter', 14.2, 34.95, 145, 60, 'lev-wasco', 3311),
    p('prd-010', 'wtw-winkel', 'DAK-160-PAN', 'Dakdoorvoer Ø160 — pannendak', 'dakdoorvoer', 78, 149, 11, 4, 'lev-econox', 1230),
    p('prd-011', 'wtw-winkel', 'DAK-160-PLT', 'Dakdoorvoer Ø160 — plat dak', 'dakdoorvoer', 84, 159, 5, 4, 'lev-econox', 1231),
    p('prd-012', 'wtw-winkel', 'GEL-DEMP-125', 'Geluiddemper Ø125 — 600 mm', 'toebehoren', 34, 69, 22, 8, 'lev-wasco', 1240),
    p('prd-013', 'wtwstore', 'THERM-RF', 'RF-bediening met display', 'toebehoren', 52, 109, 14, 5, 'lev-econox', 3320),
    p('prd-014', 'wtw-winkel', 'ARB-INST-VERD', 'Installatie per verdieping', 'arbeid', 0, 2200, 0, 0, null),
    p('prd-015', 'wtw-winkel', 'ARB-INBEDR', 'Inbedrijfstelling + inregelen', 'arbeid', 0, 285, 0, 0, null),
];

export const KLANTEN: Klant[] = [
    {
        id: 'kln-001',
        company: 'wtw-winkel',
        naam: 'Fam. De Vries',
        type: 'particulier',
        email: 'devries@voorbeeld.nl',
        telefoon: '+31 (0)6 0000 0001',
        adres: 'Duinweg 12',
        postcode: '2225 AB',
        plaats: 'Katwijk',
        bron: 'offerte',
    },
    {
        id: 'kln-002',
        company: 'wtw-winkel',
        naam: 'Bouwbedrijf Hoogland',
        type: 'zakelijk',
        email: 'inkoop@hoogland-bouw.nl',
        telefoon: '+31 (0)71 000 0010',
        adres: 'Industrieweg 44',
        postcode: '2382 NW',
        plaats: 'Zoeterwoude',
        bron: 'telefoon',
    },
    {
        id: 'kln-003',
        company: 'wtwstore',
        naam: 'J. Bakker',
        type: 'particulier',
        email: 'j.bakker@voorbeeld.nl',
        telefoon: '+31 (0)6 0000 0002',
        adres: 'Kerkstraat 3',
        postcode: '2311 AA',
        plaats: 'Leiden',
        bron: 'webshop',
    },
];

export const OFFERTES: Offerte[] = [
    {
        id: 'off-001',
        company: 'wtw-winkel',
        nummer: 'OFF-2026-0148',
        klantId: 'kln-001',
        status: 'verstuurd',
        datum: '2026-07-21',
        geldigTot: '2026-08-20',
        regels: [
            { productId: 'prd-002', omschrijving: 'WTW-unit 450 m³/h — comfort plus', aantal: 1, stukprijs: 1595, btwTarief: 21 },
            { productId: 'prd-014', omschrijving: 'Installatie per verdieping', aantal: 2, stukprijs: 2200, btwTarief: 21 },
            { productId: 'prd-010', omschrijving: 'Dakdoorvoer Ø160 — pannendak', aantal: 1, stukprijs: 149, btwTarief: 21 },
            { productId: 'prd-015', omschrijving: 'Inbedrijfstelling + inregelen', aantal: 1, stukprijs: 285, btwTarief: 21 },
        ],
    },
    {
        id: 'off-002',
        company: 'wtw-winkel',
        nummer: 'OFF-2026-0149',
        klantId: 'kln-002',
        status: 'concept',
        datum: '2026-07-27',
        geldigTot: '2026-08-26',
        regels: [
            { productId: 'prd-001', omschrijving: 'WTW-unit 350 m³/h — comfort', aantal: 4, stukprijs: 1195, btwTarief: 21 },
            { productId: 'prd-004', omschrijving: 'Flexibel kanaal Ø125 — 50 m', aantal: 4, stukprijs: 165, btwTarief: 21 },
        ],
        notitie: 'Projectkorting toegepast — bevestigen met inkoop voor verzending.',
    },
];

export const ORDERS: Order[] = [
    {
        id: 'ord-001',
        company: 'wtwstore',
        nummer: 'WS-2026-1043',
        klantId: 'kln-003',
        offerteId: null,
        status: 'nieuw',
        datum: '2026-07-28',
        planning: null,
        bezorgerId: null,
        wooId: 8871,
        regels: [
            { productId: 'prd-008', omschrijving: 'Filterset G4 (2 st.)', aantal: 2, stukprijs: 24.95, btwTarief: 21 },
            { productId: 'prd-009', omschrijving: 'Filterset F7 pollen (2 st.)', aantal: 1, stukprijs: 34.95, btwTarief: 21 },
        ],
    },
    {
        id: 'ord-002',
        company: 'wtw-winkel',
        nummer: 'WW-2026-0212',
        klantId: 'kln-001',
        offerteId: 'off-001',
        status: 'ingepland',
        datum: '2026-07-24',
        planning: '2026-08-06',
        bezorgerId: 'bez-freightways',
        wooId: null,
        regels: OFFERTES[0].regels,
    },
];

export const KOPPELINGEN: Koppeling[] = [
    {
        company: 'wtw-winkel',
        platform: 'woocommerce',
        url: 'https://wtw-winkel.nl',
        status: 'niet-geconfigureerd',
        laatsteSync: null,
        richting: { producten: 'erp-naar-shop', voorraad: 'erp-naar-shop', orders: 'shop-naar-erp' },
    },
    {
        company: 'wtwstore',
        platform: 'woocommerce',
        url: 'https://wtwstore.com',
        status: 'niet-geconfigureerd',
        laatsteSync: null,
        richting: { producten: 'erp-naar-shop', voorraad: 'erp-naar-shop', orders: 'shop-naar-erp' },
    },
];

export const SEED: ErpData = {
    producten: PRODUCTEN,
    leveranciers: LEVERANCIERS,
    bezorgers: BEZORGERS,
    klanten: KLANTEN,
    offertes: OFFERTES,
    orders: ORDERS,
    koppelingen: KOPPELINGEN,
};
