'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard, Users, Building2, BookOpen, FileQuestion,
    BarChart3, Settings, LogOut, Shield, GraduationCap
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Người dùng', href: '/dashboard/users', icon: Users, roles: ['ADMIN'] },
    { name: 'Đơn vị Nhà trường', href: '/dashboard/school-units', icon: Building2, roles: ['ADMIN'] },
    { name: 'Đơn vị Học viên', href: '/dashboard/student-units', icon: GraduationCap, roles: ['ADMIN'] },
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
            <div className="min-h-screen flex flex-col items-center justify-center bg-dark-100">
                {/* Logo with RGB border animation */}
                <div className="relative mb-8">
                    {/* Animated gradient border */}
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 via-red-500 via-orange-500 via-yellow-500 via-green-500 to-blue-500 opacity-75 blur-sm animate-gradient-xy" />

                    {/* Inner glow */}
                    <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-x" />

                    {/* Logo container */}
                    <div className="relative w-24 h-24 bg-dark-100 rounded-2xl flex items-center justify-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-military-500 rounded-xl flex items-center justify-center shadow-2xl">
                            <Shield className="w-10 h-10 text-white" />
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
                    Smart MLMS
                </h2>

                {/* Loading bar */}
                <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-loading-bar" />
                </div>

                <p className="text-slate-500 text-sm mt-3">Đang khởi tạo...</p>
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
                {children}
            </main>
        </div>
    );
}
