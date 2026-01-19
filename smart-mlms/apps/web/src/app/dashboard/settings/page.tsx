'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User, Bell, Shield, Palette, Globe, Save, Camera
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving] = useState(false);

    const [profile, setProfile] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: '',
        militaryId: '',
        rank: '',
    });

    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        examReminder: true,
        courseUpdate: true,
        violations: true,
    });

    const handleSave = async () => {
        setSaving(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSaving(false);
        alert('Đã lưu cài đặt');
    };

    const tabs = [
        { id: 'profile', label: 'Hồ sơ', icon: User },
        { id: 'notifications', label: 'Thông báo', icon: Bell },
        { id: 'security', label: 'Bảo mật', icon: Shield },
        { id: 'appearance', label: 'Giao diện', icon: Palette },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Cài đặt</h1>
                <p className="text-slate-400">Quản lý thông tin cá nhân và tùy chọn</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="card p-4 h-fit">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${activeTab === tab.id
                                        ? 'bg-primary-500/20 text-primary-400'
                                        : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="md:col-span-3">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card p-6"
                    >
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-white">Thông tin cá nhân</h2>

                                {/* Avatar */}
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-military-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                            {profile.fullName.charAt(0) || 'U'}
                                        </div>
                                        <button className="absolute bottom-0 right-0 p-2 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors">
                                            <Camera className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-white">{profile.fullName || 'Người dùng'}</h3>
                                        <p className="text-slate-400">{user?.role}</p>
                                        <p className="text-sm text-slate-500">Trust Score: {user?.trustScore}/100</p>
                                    </div>
                                </div>

                                {/* Form */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Họ và tên</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={profile.fullName}
                                            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Email</label>
                                        <input
                                            type="email"
                                            className="input"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Số điện thoại</label>
                                        <input
                                            type="tel"
                                            className="input"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Mã quân nhân</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={profile.militaryId}
                                            onChange={(e) => setProfile({ ...profile, militaryId: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Cấp bậc</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={profile.rank}
                                            onChange={(e) => setProfile({ ...profile, rank: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-white">Cài đặt thông báo</h2>

                                <div className="space-y-4">
                                    {[
                                        { key: 'email', label: 'Thông báo qua email', desc: 'Nhận email về các cập nhật quan trọng' },
                                        { key: 'push', label: 'Thông báo đẩy', desc: 'Nhận thông báo trên trình duyệt' },
                                        { key: 'examReminder', label: 'Nhắc nhở bài thi', desc: 'Nhắc trước khi bài thi sắp bắt đầu' },
                                        { key: 'courseUpdate', label: 'Cập nhật khóa học', desc: 'Thông báo khi có bài học mới' },
                                        { key: 'violations', label: 'Cảnh báo vi phạm', desc: 'Thông báo khi có vi phạm quy chế thi' },
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                                            <div>
                                                <p className="text-white font-medium">{item.label}</p>
                                                <p className="text-sm text-slate-400">{item.desc}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={notifications[item.key as keyof typeof notifications]}
                                                    onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                                                />
                                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-white">Bảo mật</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="label">Mật khẩu hiện tại</label>
                                        <input type="password" className="input" placeholder="••••••••" />
                                    </div>
                                    <div>
                                        <label className="label">Mật khẩu mới</label>
                                        <input type="password" className="input" placeholder="••••••••" />
                                    </div>
                                    <div>
                                        <label className="label">Xác nhận mật khẩu mới</label>
                                        <input type="password" className="input" placeholder="••••••••" />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-700">
                                    <h3 className="font-medium text-white mb-4">Phiên đăng nhập</h3>
                                    <div className="p-4 bg-slate-800/50 rounded-lg flex items-center justify-between">
                                        <div>
                                            <p className="text-white">Thiết bị hiện tại</p>
                                            <p className="text-sm text-slate-400">Windows • Chrome • Hà Nội, Việt Nam</p>
                                        </div>
                                        <span className="badge badge-success">Đang hoạt động</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Appearance Tab */}
                        {activeTab === 'appearance' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-white">Giao diện</h2>

                                <div>
                                    <label className="label">Chủ đề</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {['dark', 'light', 'system'].map((theme) => (
                                            <button
                                                key={theme}
                                                className={`p-4 rounded-lg border-2 transition-colors ${theme === 'dark'
                                                        ? 'border-primary-500 bg-primary-500/10'
                                                        : 'border-slate-700 hover:border-slate-500'
                                                    }`}
                                            >
                                                <div className={`w-full h-20 rounded mb-2 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`} />
                                                <p className="text-white capitalize">{theme === 'system' ? 'Theo hệ thống' : theme === 'dark' ? 'Tối' : 'Sáng'}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Ngôn ngữ</label>
                                    <select className="input w-auto">
                                        <option value="vi">Tiếng Việt</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="flex justify-end pt-6 mt-6 border-t border-slate-700">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="btn-primary flex items-center gap-2"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                Lưu thay đổi
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
