import type { CompanyId } from './types';

/**
 * WooCommerce REST-client (v3).
 *
 * Per bedrijf staan er drie env-vars klaar; zonder die vars is de koppeling
 * simpelweg "niet-geconfigureerd" en doet de sync niets.
 */

export interface WooConfig {
    url: string;
    key: string;
    secret: string;
}

const ENV: Record<CompanyId, { url: string; key: string; secret: string }> = {
    'wtw-winkel': {
        url: 'WOO_WTW_WINKEL_URL',
        key: 'WOO_WTW_WINKEL_KEY',
        secret: 'WOO_WTW_WINKEL_SECRET',
    },
    wtwstore: {
        url: 'WOO_WTWSTORE_URL',
        key: 'WOO_WTWSTORE_KEY',
        secret: 'WOO_WTWSTORE_SECRET',
    },
};

export function wooConfig(company: CompanyId): WooConfig | null {
    const names = ENV[company];
    const url = process.env[names.url];
    const key = process.env[names.key];
    const secret = process.env[names.secret];
    if (!url || !key || !secret) return null;
    return { url: url.replace(/\/$/, ''), key, secret };
}

async function wooFetch<T>(
    cfg: WooConfig,
    pad: string,
    init?: RequestInit & { query?: Record<string, string | number> },
): Promise<T> {
    const url = new URL(`${cfg.url}/wp-json/wc/v3${pad}`);
    for (const [k, v] of Object.entries(init?.query ?? {})) {
        url.searchParams.set(k, String(v));
    }

    // Basic auth over https is de aanbevolen methode voor server-to-server.
    const auth = Buffer.from(`${cfg.key}:${cfg.secret}`).toString('base64');

    const res = await fetch(url, {
        ...init,
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
            ...init?.headers,
        },
        cache: 'no-store',
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`WooCommerce ${res.status} op ${pad}: ${body.slice(0, 300)}`);
    }
    return (await res.json()) as T;
}

export interface WooProduct {
    id: number;
    sku: string;
    name: string;
    price: string;
    stock_quantity: number | null;
}

export interface WooOrder {
    id: number;
    number: string;
    status: string;
    date_created: string;
    total: string;
    billing: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        address_1: string;
        postcode: string;
        city: string;
    };
    line_items: { name: string; quantity: number; price: number; sku: string }[];
}

/** Haalt orders op die sinds `sinds` (ISO-datum) zijn aangemaakt. */
export function haalOrders(cfg: WooConfig, sinds?: string) {
    return wooFetch<WooOrder[]>(cfg, '/orders', {
        query: { per_page: 50, ...(sinds ? { after: sinds } : {}) },
    });
}

export function haalProducten(cfg: WooConfig) {
    return wooFetch<WooProduct[]>(cfg, '/products', { query: { per_page: 100 } });
}

/** Duwt prijs en voorraad van één artikel naar de webshop. */
export function pushVoorraad(cfg: WooConfig, wooId: number, voorraad: number, prijs: number) {
    return wooFetch<WooProduct>(cfg, `/products/${wooId}`, {
        method: 'PUT',
        body: JSON.stringify({
            regular_price: prijs.toFixed(2),
            stock_quantity: voorraad,
            manage_stock: true,
        }),
    });
}
