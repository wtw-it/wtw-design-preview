'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SEED } from './seed';
import type { CompanyId, ErpData, Factuur, Offerte, Order, Product } from './types';

/**
 * Client-side store. Houdt de ERP-data vast en bewaart wijzigingen in
 * localStorage, zodat de app volledig werkt zonder database.
 *
 * Zodra Supabase is aangesloten vervangt `src/lib/erp/db.ts` deze bron:
 * de vorm van `ErpData` blijft gelijk, alleen het laden/schrijven verandert.
 */

const STORAGE_KEY = 'wtw-erp-v1';
const COMPANY_KEY = 'wtw-erp-company';

interface ErpContext {
    data: ErpData;
    company: CompanyId;
    setCompany: (c: CompanyId) => void;
    /** Data gefilterd op het actieve bedrijf */
    scoped: ErpData;
    addOfferte: (o: Offerte) => void;
    updateOfferte: (id: string, patch: Partial<Offerte>) => void;
    addOrder: (o: Order) => void;
    updateOrder: (id: string, patch: Partial<Order>) => void;
    addFactuur: (f: Factuur) => void;
    updateFactuur: (id: string, patch: Partial<Factuur>) => void;
    updateProduct: (id: string, patch: Partial<Product>) => void;
    reset: () => void;
}

const Ctx = createContext<ErpContext | null>(null);

function scope(data: ErpData, company: CompanyId): ErpData {
    return {
        producten: data.producten.filter((x) => x.company === company),
        leveranciers: data.leveranciers.filter((x) => x.company.includes(company)),
        bezorgers: data.bezorgers,
        klanten: data.klanten.filter((x) => x.company === company),
        offertes: data.offertes.filter((x) => x.company === company),
        orders: data.orders.filter((x) => x.company === company),
        facturen: data.facturen.filter((x) => x.company === company),
        koppelingen: data.koppelingen.filter((x) => x.company === company),
    };
}

export function ErpProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<ErpData>(SEED);
    const [company, setCompanyState] = useState<CompanyId>('wtw-winkel');

    // Hydrateren na mount — localStorage bestaat niet tijdens SSR.
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            // Ontbrekende sleutels aanvullen vanuit de seed, zodat opslag van
            // een oudere versie (zonder bijv. facturen) blijft werken.
            if (raw) setData({ ...SEED, ...(JSON.parse(raw) as Partial<ErpData>) });
            const c = localStorage.getItem(COMPANY_KEY) as CompanyId | null;
            if (c === 'wtw-winkel' || c === 'wtwstore') setCompanyState(c);
        } catch {
            // Corrupte opslag negeren; we vallen terug op de seed.
        }
    }, []);

    // Functionele update: meerdere mutaties in dezelfde klik (bijv. factuur
    // toevoegen én de order op 'gefactureerd' zetten) stapelen netjes in
    // plaats van elkaar te overschrijven via een stale closure.
    const persist = useCallback((wijzig: (prev: ErpData) => ErpData) => {
        setData((prev) => {
            const next = wijzig(prev);
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {
                // Quota vol of privé-modus — de sessie blijft gewoon werken.
            }
            return next;
        });
    }, []);

    const setCompany = useCallback((c: CompanyId) => {
        setCompanyState(c);
        try {
            localStorage.setItem(COMPANY_KEY, c);
        } catch {
            /* zie boven */
        }
    }, []);

    const value = useMemo<ErpContext>(
        () => ({
            data,
            company,
            setCompany,
            scoped: scope(data, company),
            addOfferte: (o) => persist((d) => ({ ...d, offertes: [o, ...d.offertes] })),
            updateOfferte: (id, patch) =>
                persist((d) => ({
                    ...d,
                    offertes: d.offertes.map((x) => (x.id === id ? { ...x, ...patch } : x)),
                })),
            addOrder: (o) => persist((d) => ({ ...d, orders: [o, ...d.orders] })),
            updateOrder: (id, patch) =>
                persist((d) => ({
                    ...d,
                    orders: d.orders.map((x) => (x.id === id ? { ...x, ...patch } : x)),
                })),
            addFactuur: (f) => persist((d) => ({ ...d, facturen: [f, ...d.facturen] })),
            updateFactuur: (id, patch) =>
                persist((d) => ({
                    ...d,
                    facturen: d.facturen.map((x) => (x.id === id ? { ...x, ...patch } : x)),
                })),
            updateProduct: (id, patch) =>
                persist((d) => ({
                    ...d,
                    producten: d.producten.map((x) => (x.id === id ? { ...x, ...patch } : x)),
                })),
            reset: () => persist(() => SEED),
        }),
        [data, company, persist, setCompany],
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useErp(): ErpContext {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error('useErp moet binnen <ErpProvider> gebruikt worden');
    return ctx;
}
