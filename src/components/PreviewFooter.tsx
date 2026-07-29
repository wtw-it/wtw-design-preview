'use client';

import { usePathname } from 'next/navigation';

/** Footer van de design-preview. Verbergt zich in de ERP, die zijn eigen schil heeft. */
export default function PreviewFooter() {
    const pathname = usePathname();
    if (pathname.startsWith('/erp')) return null;

    return (
        <footer className="border-t border-ink-200 mt-24 py-12">
            <div className="max-w-6xl mx-auto px-6 text-center text-xs text-ink-500">
                WTW Design Preview · interne visualisatie · niet voor klanten
            </div>
        </footer>
    );
}
