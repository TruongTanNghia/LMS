'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';

export default function HomePage() {
    const router = useRouter();
    const { token } = useAuthStore();

    useEffect(() => {
        if (token) {
            router.push('/dashboard');
        } else {
            router.push('/login');
        }
    }, [token, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
    );
}
