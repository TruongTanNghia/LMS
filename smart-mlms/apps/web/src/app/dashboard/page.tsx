'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users, BookOpen, FileQuestion, TrendingUp,
    Clock, CheckCircle, AlertTriangle, Activity
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';

// Mock data - in production, fetch from API
const stats = [
    { label: 'Tổng người dùng', value: '1,234', icon: Users, change: '+12%', color: 'from-blue-500 to-blue-600' },
    { label: 'Khóa học', value: '48', icon: BookOpen, change: '+3', color: 'from-green-500 to-green-600' },
    { label: 'Bài thi', value: '156', icon: FileQuestion, change: '+8', color: 'from-purple-500 to-purple-600' },
    { label: 'Hoàn thành hôm nay', value: '89', icon: TrendingUp, change: '+15%', color: 'from-orange-500 to-orange-600' },
];

const recentActivities = [
    { user: 'Nguyễn Văn An', action: 'hoàn thành khóa học', target: 'Chiến thuật cơ bản', time: '5 phút trước', type: 'success' },
    { user: 'Trần Thị Bình', action: 'bắt đầu bài thi', target: 'Kiểm tra giữa kỳ', time: '12 phút trước', type: 'info' },
    { user: 'Lê Văn Cường', action: 'vi phạm quy chế thi', target: 'Nhìn ra ngoài màn hình', time: '23 phút trước', type: 'warning' },
    { user: 'Phạm Thị Dung', action: 'đạt điểm cao nhất', target: 'Bài thi cuối kỳ', time: '1 giờ trước', type: 'success' },
];

const examStats = [
    { label: 'Đang diễn ra', value: 3, icon: Clock, color: 'text-blue-400' },
    { label: 'Hoàn thành', value: 127, icon: CheckCircle, color: 'text-green-400' },
    { label: 'Cần xem xét', value: 8, icon: AlertTriangle, color: 'text-yellow-400' },
];

export default function DashboardPage() {
    const { user } = useAuthStore();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400 mt-1">
                    Xin chào, <span className="text-primary-400">{user?.fullName}</span>. Chúc bạn một ngày làm việc hiệu quả!
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="stat-card group"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="stat-label">{stat.label}</p>
                                <p className="stat-value">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="text-green-400">{stat.change}</span>
                            <span className="text-slate-500 ml-2">so với tuần trước</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activities */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 card p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">Hoạt động gần đây</h2>
                        <Activity className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="space-y-4">
                        {recentActivities.map((activity, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-800/30 transition-colors"
                            >
                                <div className={`w-2 h-2 rounded-full ${activity.type === 'success' ? 'bg-green-400' :
                                        activity.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                                    }`}></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white">
                                        <span className="font-medium">{activity.user}</span>
                                        <span className="text-slate-400"> {activity.action} </span>
                                        <span className="text-primary-400">{activity.target}</span>
                                    </p>
                                </div>
                                <span className="text-xs text-slate-500 whitespace-nowrap">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Exam Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="card p-6"
                >
                    <h2 className="text-lg font-semibold text-white mb-6">Trạng thái bài thi</h2>
                    <div className="space-y-4">
                        {examStats.map((stat, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    <span className="text-slate-300">{stat.label}</span>
                                </div>
                                <span className="text-2xl font-bold text-white">{stat.value}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Quick Actions (for Admin/Teacher) */}
            {(user?.role === 'ADMIN' || user?.role === 'TEACHER') && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="card p-6"
                >
                    <h2 className="text-lg font-semibold text-white mb-4">Thao tác nhanh</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button className="btn-secondary flex flex-col items-center gap-2 py-4">
                            <Users className="w-6 h-6" />
                            <span>Thêm học viên</span>
                        </button>
                        <button className="btn-secondary flex flex-col items-center gap-2 py-4">
                            <BookOpen className="w-6 h-6" />
                            <span>Tạo khóa học</span>
                        </button>
                        <button className="btn-secondary flex flex-col items-center gap-2 py-4">
                            <FileQuestion className="w-6 h-6" />
                            <span>Tạo bài thi</span>
                        </button>
                        <button className="btn-secondary flex flex-col items-center gap-2 py-4">
                            <AlertTriangle className="w-6 h-6" />
                            <span>Xem vi phạm</span>
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
