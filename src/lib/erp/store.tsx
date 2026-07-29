'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SEED } from './seed';
import type { CompanyId, ErpData, Offerte, Order, Product } from './types';

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
            if (raw) setData(JSON.parse(raw) as ErpData);
            const c = localStorage.getItem(COMPANY_KEY) as CompanyId | null;
            if (c === 'wtw-winkel' || c === 'wtwstore') setCompanyState(c);
        } catch {
            // Corrupte opslag negeren; we vallen terug op de seed.
        }
    }, []);

    const persist = useCallback((next: ErpData) => {
        setData(next);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
            // Quota vol of privé-modus — de sessie blijft gewoon werken.
        }
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
            addOfferte: (o) => persist({ ...data, offertes: [o, ...data.offertes] }),
            updateOfferte: (id, patch) =>
                persist({
                    ...data,
                    offertes: data.offertes.map((x) => (x.id === id ? { ...x, ...patch } : x)),
                }),
            addOrder: (o) => persist({ ...data, orders: [o, ...data.orders] }),
            updateOrder: (id, patch) =>
                persist({
                    ...data,
                    orders: data.orders.map((x) => (x.id === id ? { ...x, ...patch } : x)),
                }),
            updateProduct: (id, patch) =>
                persist({
                    ...data,
                    producten: data.producten.map((x) => (x.id === id ? { ...x, ...patch } : x)),
                }),
            reset: () => persist(SEED),
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
