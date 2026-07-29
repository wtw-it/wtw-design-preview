/**
 * Datamodel voor de WTW Installatie- & Verkoop-ERP.
 *
 * Multi-tenant: elke rij hangt aan een `company` (wtw-winkel.nl of wtwstore.com).
 * De ERP van wtw.nl blijft een los systeem — dit is bewust gescheiden.
 */

export type CompanyId = 'wtw-winkel' | 'wtwstore';

export interface Company {
    id: CompanyId;
    naam: string;
    domein: string;
    kvk: string;
    btw: string;
    iban: string;
    /** Basiskleur voor de bedrijfs-switch in de UI */
    accent: string;
}

export type ProductCategorie =
    | 'wtw-unit'
    | 'kanaalwerk'
    | 'ventiel'
    | 'filter'
    | 'dakdoorvoer'
    | 'toebehoren'
    | 'arbeid';

export interface Product {
    id: string;
    company: CompanyId;
    sku: string;
    naam: string;
    categorie: ProductCategorie;
    /** Inkoopprijs excl. btw */
    inkoop: number;
    /** Verkoopprijs excl. btw */
    verkoop: number;
    btwTarief: 0 | 9 | 21;
    voorraad: number;
    minVoorraad: number;
    leverancierId: string | null;
    /** Product-id in de webshop (WooCommerce). null = nog niet gekoppeld. */
    wooId: number | null;
    actief: boolean;
}

export interface Leverancier {
    id: string;
    company: CompanyId[];
    naam: string;
    klantnummer: string;
    email: string;
    telefoon: string;
    /** Standaard levertijd in werkdagen */
    levertijd: number;
    /** Afgesproken korting op bruto-prijslijst, in procenten */
    korting: number;
    /** Bestelmethode — bepaalt hoe een inkooporder eruit gaat */
    bestelwijze: 'portal' | 'email' | 'edi';
}

export interface Bezorger {
    id: string;
    naam: string;
    plaats: string;
    contact: string;
    telefoon: string;
    /** Tarief per rit binnen het standaard rayon */
    ritTarief: number;
    /** Toeslag per km buiten het rayon */
    kmTarief: number;
    rayon: string[];
}

export interface Klant {
    id: string;
    company: CompanyId;
    naam: string;
    type: 'particulier' | 'zakelijk';
    email: string;
    telefoon: string;
    adres: string;
    postcode: string;
    plaats: string;
    /** Bron: waar kwam de klant vandaan */
    bron: 'webshop' | 'offerte' | 'telefoon' | 'import';
}

export type OfferteStatus = 'concept' | 'verstuurd' | 'akkoord' | 'afgewezen' | 'verlopen';

export interface OfferteRegel {
    productId: string | null;
    omschrijving: string;
    aantal: number;
    stukprijs: number;
    btwTarief: 0 | 9 | 21;
}

export interface Offerte {
    id: string;
    company: CompanyId;
    nummer: string;
    klantId: string;
    status: OfferteStatus;
    datum: string;
    geldigTot: string;
    regels: OfferteRegel[];
    /** Vrije notitie — komt niet op de PDF */
    notitie?: string;
}

export type OrderStatus =
    | 'nieuw'
    | 'ingepland'
    | 'besteld'
    | 'onderweg'
    | 'geleverd'
    | 'gemonteerd'
    | 'gefactureerd'
    | 'geannuleerd';

export interface Order {
    id: string;
    company: CompanyId;
    nummer: string;
    klantId: string;
    /** Gekoppelde offerte, als de order daaruit is ontstaan */
    offerteId: string | null;
    status: OrderStatus;
    datum: string;
    /** Geplande montage- of leverdatum */
    planning: string | null;
    bezorgerId: string | null;
    regels: OfferteRegel[];
    /** Order-id in de webshop, als de order daar vandaan komt */
    wooId: number | null;
}

export type FactuurStatus = 'concept' | 'verstuurd' | 'betaald' | 'vervallen';

export interface Factuur {
    id: string;
    company: CompanyId;
    nummer: string;
    klantId: string;
    /** Order waaruit de factuur is ontstaan */
    orderId: string | null;
    status: FactuurStatus;
    datum: string;
    vervaldatum: string;
    regels: OfferteRegel[];
    /** Datum waarop betaling binnenkwam */
    betaaldOp: string | null;
}

export interface Koppeling {
    company: CompanyId;
    platform: 'woocommerce';
    url: string;
    status: 'verbonden' | 'niet-geconfigureerd' | 'fout';
    laatsteSync: string | null;
    /** Wat er in welke richting gesynct wordt */
    richting: {
        producten: 'erp-naar-shop' | 'shop-naar-erp' | 'uit';
        voorraad: 'erp-naar-shop' | 'uit';
        orders: 'shop-naar-erp' | 'uit';
    };
}

/** Alles bij elkaar — de vorm die de client-store vasthoudt. */
export interface ErpData {
    producten: Product[];
    leveranciers: Leverancier[];
    bezorgers: Bezorger[];
    klanten: Klant[];
    offertes: Offerte[];
    orders: Order[];
    facturen: Factuur[];
    koppelingen: Koppeling[];
}

/* ---------------------------------------------------------------- helpers */

export function regelSubtotaal(r: OfferteRegel): number {
    return r.aantal * r.stukprijs;
}

export function totalen(regels: OfferteRegel[]) {
    const excl = regels.reduce((s, r) => s + regelSubtotaal(r), 0);
    const btw = regels.reduce((s, r) => s + (regelSubtotaal(r) * r.btwTarief) / 100, 0);
    return { excl, btw, incl: excl + btw };
}

export function euro(n: number): string {
    return new Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(n);
}

export function marge(p: Product): number {
    if (!p.verkoop) return 0;
    return ((p.verkoop - p.inkoop) / p.verkoop) * 100;
}
