import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

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
                {children}
            </body>
        </html>
    );
}
