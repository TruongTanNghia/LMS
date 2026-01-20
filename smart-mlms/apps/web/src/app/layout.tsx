import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import { TopLoader } from '@/components/ui/loading';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
    title: 'Smart MLMS - Hệ thống Đào tạo Quân sự Thông minh',
    description: 'Military Learning Management System với AI Proctoring, Learning Analytics, Trust Score',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi" className="dark">
            <body className={inter.className}>
                <Suspense fallback={null}>
                    <TopLoader />
                </Suspense>
                {children}
            </body>
        </html>
    );
}
