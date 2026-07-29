import { NextResponse } from 'next/server';
import { haalOrders, haalProducten, pushVoorraad, wooConfig } from '@/lib/erp/woocommerce';
import type { CompanyId } from '@/lib/erp/types';

export const runtime = 'nodejs';

function parseCompany(v: string | null): CompanyId | null {
    return v === 'wtw-winkel' || v === 'wtwstore' ? v : null;
}

/** GET /api/erp/woocommerce?company=…&actie=status|orders|producten */
export async function GET(req: Request) {
    const url = new URL(req.url);
    const company = parseCompany(url.searchParams.get('company'));
    if (!company) {
        return NextResponse.json({ fout: 'Onbekend bedrijf' }, { status: 400 });
    }

    const cfg = wooConfig(company);
    if (!cfg) {
        return NextResponse.json({
            status: 'niet-geconfigureerd',
            bericht: `Zet de WOO_*-env-vars voor ${company} om de koppeling te activeren.`,
        });
    }

    const actie = url.searchParams.get('actie') ?? 'status';

    try {
        if (actie === 'orders') {
            const sinds = url.searchParams.get('sinds') ?? undefined;
            return NextResponse.json({ status: 'verbonden', orders: await haalOrders(cfg, sinds) });
        }
        if (actie === 'producten') {
            return NextResponse.json({ status: 'verbonden', producten: await haalProducten(cfg) });
        }
        // status: één goedkope call om te bewijzen dat de credentials kloppen
        const producten = await haalProducten(cfg);
        return NextResponse.json({
            status: 'verbonden',
            url: cfg.url,
            aantalProducten: producten.length,
        });
    } catch (e) {
        return NextResponse.json(
            { status: 'fout', bericht: e instanceof Error ? e.message : 'Onbekende fout' },
            { status: 502 },
        );
    }
}

/**
 * POST /api/erp/woocommerce — voorraad + prijs naar de webshop duwen.
 * Body: { company, regels: [{ wooId, voorraad, prijs }] }
 */
export async function POST(req: Request) {
    const body = (await req.json()) as {
        company?: string;
        regels?: { wooId: number; voorraad: number; prijs: number }[];
    };

    const company = parseCompany(body.company ?? null);
    if (!company) return NextResponse.json({ fout: 'Onbekend bedrijf' }, { status: 400 });

    const cfg = wooConfig(company);
    if (!cfg) {
        return NextResponse.json({ fout: 'Koppeling niet geconfigureerd' }, { status: 409 });
    }

    const regels = body.regels ?? [];
    const resultaat: { wooId: number; ok: boolean; fout?: string }[] = [];

    for (const r of regels) {
        try {
            await pushVoorraad(cfg, r.wooId, r.voorraad, r.prijs);
            resultaat.push({ wooId: r.wooId, ok: true });
        } catch (e) {
            resultaat.push({
                wooId: r.wooId,
                ok: false,
                fout: e instanceof Error ? e.message : 'Onbekende fout',
            });
        }
    }

    return NextResponse.json({ gesynct: resultaat.filter((r) => r.ok).length, resultaat });
}
