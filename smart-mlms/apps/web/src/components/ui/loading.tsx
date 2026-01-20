'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function TopLoader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Reset on route change
        setLoading(true);
        setProgress(0);

        // Animate progress
        const timer1 = setTimeout(() => setProgress(30), 50);
        const timer2 = setTimeout(() => setProgress(60), 150);
        const timer3 = setTimeout(() => setProgress(80), 300);
        const timer4 = setTimeout(() => {
            setProgress(100);
            setTimeout(() => setLoading(false), 200);
        }, 400);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
        };
    }, [pathname, searchParams]);

    if (!loading && progress === 0) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1">
            <div
                className="h-full bg-gradient-to-r from-primary-500 via-blue-500 to-primary-400 transition-all duration-300 ease-out"
                style={{
                    width: `${progress}%`,
                    opacity: progress === 100 ? 0 : 1,
                    boxShadow: '0 0 10px rgba(59, 130, 246, 0.7), 0 0 5px rgba(59, 130, 246, 0.5)',
                }}
            />
        </div>
    );
}

// Spinner component với nhiều styles
export function Spinner({
    size = 'md',
    className = ''
}: {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}) {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-2',
        lg: 'w-12 h-12 border-3',
        xl: 'w-16 h-16 border-4',
    };

    return (
        <div className={`${sizeClasses[size]} border-primary-500/30 border-t-primary-500 rounded-full animate-spin ${className}`} />
    );
}

// Pulsing Dots loader
export function DotsLoader({ className = '' }: { className?: string }) {
    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                />
            ))}
        </div>
    );
}

// Skeleton loader for cards
export function Skeleton({
    className = '',
    variant = 'rectangular'
}: {
    className?: string;
    variant?: 'rectangular' | 'circular' | 'text';
}) {
    const baseClass = 'animate-pulse bg-slate-700/50';
    const variantClass = {
        rectangular: 'rounded-lg',
        circular: 'rounded-full',
        text: 'rounded h-4',
    };

    return <div className={`${baseClass} ${variantClass[variant]} ${className}`} />;
}

// Card Skeleton
export function CardSkeleton({ className = '' }: { className?: string }) {
    return (
        <div className={`card p-6 space-y-4 ${className}`}>
            <div className="flex items-center gap-4">
                <Skeleton variant="circular" className="w-12 h-12" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <Skeleton className="h-20" />
            <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
            </div>
        </div>
    );
}

// Table Skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="card overflow-hidden">
            <div className="p-4 border-b border-slate-700">
                <Skeleton className="h-8 w-48" />
            </div>
            <div className="divide-y divide-slate-700/50">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="p-4 flex items-center gap-4">
                        <Skeleton variant="circular" className="w-10 h-10" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-1/4" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-8 w-8" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Full page loading
export function PageLoader({ message = 'Đang tải...' }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-primary-500/20 rounded-full" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary-500 rounded-full animate-spin" />
            </div>
            <p className="text-slate-400 animate-pulse">{message}</p>
        </div>
    );
}

// Overlay loading (for forms, modals)
export function LoadingOverlay({ message = 'Đang xử lý...' }: { message?: string }) {
    return (
        <div className="absolute inset-0 bg-dark-100/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-lg">
            <Spinner size="lg" />
            <p className="text-white mt-4">{message}</p>
        </div>
    );
}
