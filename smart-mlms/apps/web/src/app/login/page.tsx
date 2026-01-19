'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth';

const loginSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { token, setAuth } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (token) {
            router.replace('/dashboard');
        }
    }, [token, router]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setError('');
        setLoading(true);

        try {
            const response = await authApi.login(data.email, data.password);
            setAuth(response.data.user, response.data.token);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-military-500/10 rounded-full filter blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-military-500 rounded-2xl shadow-2xl shadow-primary-500/30 mb-4"
                    >
                        <Shield className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-military-400 bg-clip-text text-transparent">
                        Smart MLMS
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Hệ thống Đào tạo Quân sự Thông minh
                    </p>
                </div>

                {/* Login Card */}
                <div className="card p-8">
                    <h2 className="text-xl font-semibold text-center mb-6">Đăng nhập</h2>

                    {/* Error Alert */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
                        >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="label">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="admin@military.edu.vn"
                                className={`input ${errors.email ? 'border-red-500' : ''}`}
                                {...register('email')}
                            />
                            {errors.email && (
                                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="label">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className={`input pr-12 ${errors.password ? 'border-red-500' : ''}`}
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Đang đăng nhập...</span>
                                </>
                            ) : (
                                'Đăng nhập'
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
                        <p className="text-slate-400 text-sm text-center mb-2">Tài khoản demo:</p>
                        <div className="text-center text-sm">
                            <span className="text-slate-300">admin@military.edu.vn</span>
                            <span className="text-slate-500 mx-2">/</span>
                            <span className="text-slate-300">Admin@123</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-500 text-sm mt-6">
                    © 2024 Smart MLMS - Phiên bản 1.0
                </p>
            </motion.div>
        </div>
    );
}
