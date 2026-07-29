import type { Metadata, Viewport } from 'next';
import Shell from '@/components/erp/Shell';
import { ErpProvider } from '@/lib/erp/store';

export const metadata: Metadata = {
    title: 'WTW ERP — Installatie & Verkoop',
    description: 'ERP voor wtw-winkel.nl en wtwstore.com',
    robots: { index: false, follow: false },
};

/** Groene statusbalk op iOS, net als het bestaande bedrijfssysteem. */
export const viewport: Viewport = {
    themeColor: '#146C43',
    viewportFit: 'cover',
};

export default function ErpLayout({ children }: { children: React.ReactNode }) {
    return (
        <ErpProvider>
            <Shell>{children}</Shell>
        </ErpProvider>
    );
}
