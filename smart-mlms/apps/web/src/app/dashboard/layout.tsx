'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, Building2, BookOpen, FileQuestion,
    BarChart3, Settings, LogOut, Shield, Menu, X, ChevronDown
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Người dùng', href: '/dashboard/users', icon: Users, roles: ['ADMIN'] },
    { name: 'Đơn vị', href: '/dashboard/units', icon: Building2, roles: ['ADMIN'] },
    { name: 'Khóa học', href: '/dashboard/courses', icon: BookOpen },
    { name: 'Bài thi', href: '/dashboard/exams', icon: FileQuestion },
    { name: 'Báo cáo', href: '/dashboard/reports', icon: BarChart3, roles: ['ADMIN', 'TEACHER'] },
    { name: 'Cài đặt', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, token, logout, _hasHydrated } = useAuthStore();

    useEffect(() => {
        // Wait for hydration before checking auth
        if (_hasHydrated && !token) {
            router.push('/login');
        }
    }, [token, router, _hasHydrated]);

    // Show loading while hydrating or no auth
    if (!_hasHydrated || !token || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const filteredNav = navigation.filter(
        (item) => !item.roles || item.roles.includes(user.role)
    );

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-64 bg-dark-200/80 backdrop-blur-xl border-r border-slate-700/50 flex flex-col z-50">
                {/* Logo */}
                <div className="p-6 border-b border-slate-700/50">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-military-500 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-white">Smart MLMS</h1>
                            <p className="text-xs text-slate-500">v1.0</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {filteredNav.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`sidebar-link ${isActive ? 'active' : ''}`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info */}
                <div className="p-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-military-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.fullName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-3">
                        <span className="text-slate-400">Trust Score</span>
                        <span className={`font-semibold ${user.trustScore >= 80 ? 'text-green-400' : user.trustScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {user.trustScore}/100
                        </span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
