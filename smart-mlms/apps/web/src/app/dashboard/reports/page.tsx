'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3, Users, BookOpen, FileQuestion, TrendingUp, Download,
    Calendar, Filter
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

// Mock data
const monthlyData = [
    { month: 'T1', users: 120, courses: 8, exams: 45 },
    { month: 'T2', users: 145, courses: 10, exams: 52 },
    { month: 'T3', users: 180, courses: 12, exams: 68 },
    { month: 'T4', users: 210, courses: 15, exams: 75 },
    { month: 'T5', users: 250, courses: 18, exams: 89 },
    { month: 'T6', users: 298, courses: 20, exams: 102 },
];

const passRateData = [
    { name: 'Đậu', value: 78, color: '#22c55e' },
    { name: 'Không đậu', value: 22, color: '#ef4444' },
];

const violationData = [
    { type: 'Tab Switch', count: 45 },
    { type: 'Face Not Detected', count: 23 },
    { type: 'Looking Away', count: 67 },
    { type: 'Multiple Faces', count: 8 },
    { type: 'Phone Detected', count: 12 },
];

const topCourses = [
    { name: 'Chiến thuật quân sự cơ bản', enrolled: 156, completion: 82 },
    { name: 'Kỹ thuật thông tin liên lạc', enrolled: 134, completion: 75 },
    { name: 'Chiến lược quốc phòng', enrolled: 98, completion: 68 },
    { name: 'An ninh mạng quân sự', enrolled: 87, completion: 71 },
];

export default function ReportsPage() {
    const [dateRange, setDateRange] = useState('6months');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Báo cáo & Thống kê</h1>
                    <p className="text-slate-400">Phân tích dữ liệu học tập và đào tạo</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        className="input w-auto"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                    >
                        <option value="7days">7 ngày qua</option>
                        <option value="30days">30 ngày qua</option>
                        <option value="6months">6 tháng qua</option>
                        <option value="1year">1 năm qua</option>
                    </select>
                    <button className="btn-secondary flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Xuất báo cáo
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Tổng người dùng', value: '1,234', change: '+12%', icon: Users, color: 'from-blue-500 to-blue-600' },
                    { label: 'Khóa học', value: '48', change: '+3', icon: BookOpen, color: 'from-green-500 to-green-600' },
                    { label: 'Bài thi đã làm', value: '2,847', change: '+156', icon: FileQuestion, color: 'from-purple-500 to-purple-600' },
                    { label: 'Tỷ lệ đậu', value: '78%', change: '+5%', icon: TrendingUp, color: 'from-orange-500 to-orange-600' },
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="stat-card"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="stat-label">{stat.label}</p>
                                <p className="stat-value">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <p className="text-green-400 text-sm mt-2">{stat.change} so với kỳ trước</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Trend */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card p-6"
                >
                    <h2 className="text-lg font-semibold text-white mb-4">Xu hướng theo tháng</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="month" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                }}
                            />
                            <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Người dùng" />
                            <Line type="monotone" dataKey="exams" stroke="#22c55e" strokeWidth={2} name="Bài thi" />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Pass Rate */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card p-6"
                >
                    <h2 className="text-lg font-semibold text-white mb-4">Tỷ lệ đậu/rớt</h2>
                    <div className="flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={passRateData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {passRateData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        {passRateData.map((entry) => (
                            <div key={entry.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-slate-400">{entry.name}: {entry.value}%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Violations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="card p-6"
                >
                    <h2 className="text-lg font-semibold text-white mb-4">Vi phạm trong thi cử</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={violationData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis type="number" stroke="#94a3b8" />
                            <YAxis dataKey="type" type="category" stroke="#94a3b8" width={120} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                }}
                            />
                            <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Top Courses */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="card p-6"
                >
                    <h2 className="text-lg font-semibold text-white mb-4">Khóa học phổ biến</h2>
                    <div className="space-y-4">
                        {topCourses.map((course, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <span className="w-6 h-6 flex items-center justify-center bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium">
                                    {index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white truncate">{course.name}</p>
                                    <div className="flex items-center gap-4 text-sm text-slate-400">
                                        <span>{course.enrolled} học viên</span>
                                        <span>Hoàn thành: {course.completion}%</span>
                                    </div>
                                </div>
                                <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary-500"
                                        style={{ width: `${course.completion}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
