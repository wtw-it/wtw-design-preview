'use client';

import { useEffect, useState } from 'react';

/**
 * Tijd hoort niet in de eerste render: de ERP-pagina's worden statisch
 * geprerenderd, dus alles wat van "nu" afhangt zou een hydration-mismatch
 * geven (React #418). Deze hooks geven null tot na de mount; server en
 * eerste client-render zijn daardoor identiek.
 */

export function useNu(): Date | null {
    const [nu, setNu] = useState<Date | null>(null);
    useEffect(() => {
        setNu(new Date());
    }, []);
    return nu;
}

/** ISO-datum (YYYY-MM-DD) van vandaag, of null vóór de mount. */
export function useVandaag(): string | null {
    const nu = useNu();
    return nu ? nu.toISOString().slice(0, 10) : null;
}

/** Voor event-handlers: die draaien altijd client-side, dus direct rekenen. */
export function vandaagIso(): string {
    return new Date().toISOString().slice(0, 10);
}
