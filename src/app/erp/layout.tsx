import type { Metadata } from 'next';
import Shell from '@/components/erp/Shell';
import { ErpProvider } from '@/lib/erp/store';

export const metadata: Metadata = {
    title: 'WTW ERP — Installatie & Verkoop',
    description: 'ERP voor wtw-winkel.nl en wtwstore.com',
    robots: { index: false, follow: false },
};

export default function ErpLayout({ children }: { children: React.ReactNode }) {
    return (
        <ErpProvider>
            <Shell>{children}</Shell>
        </ErpProvider>
    );
}
