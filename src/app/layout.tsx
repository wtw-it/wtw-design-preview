import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import PreviewFooter from '@/components/PreviewFooter';

const inter = Inter({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-inter',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'WTW Design Preview',
    description: 'Visuele richting voor de WTW offerte-flow. Apple × Stripe in WTW-groen.',
    robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="nl" className={inter.variable}>
            <body className="min-h-screen bg-white text-ink-800">
                <Navigation />
                <main>{children}</main>
                <PreviewFooter />
            </body>
        </html>
    );
}
