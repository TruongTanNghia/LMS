'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Plus, Search, MoreVertical, Edit, Trash2, UserCheck, UserX, X
} from 'lucide-react';
import { usersApi, unitsApi } from '@/lib/api';

interface User {
    _id: string;
    email: string;
    fullName: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT';
    trustScore: number;
    isActive: boolean;
    unitId?: { _id: string; name: string };
    militaryId?: string;
    rank?: string;
    createdAt: string;
}

interface Unit {
    _id: string;
    name: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [total, setTotal] = useState(0);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
        fetchUnits();
    }, [search, roleFilter]);

    const fetchUsers = async () => {
        try {
            const response = await usersApi.getAll({ search, role: roleFilter || undefined });
            setUsers(response.data.users);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnits = async () => {
        try {
            const response = await unitsApi.getAll();
            setUnits(response.data);
        } catch (error) {
            console.error('Error fetching units:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;
        setDeletingId(id);
        try {
            await usersApi.delete(id);
            fetchUsers();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Xóa thất bại');
        } finally {
            setDeletingId(null);
        }
    };

    const handleToggleActive = async (user: User) => {
        setTogglingId(user._id);
        try {
            await usersApi.update(user._id, { isActive: !user.isActive });
            fetchUsers();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setTogglingId(null);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return <span className="badge badge-danger">Admin</span>;
            case 'TEACHER':
                return <span className="badge badge-info">Giảng viên</span>;
            default:
                return <span className="badge badge-success">Học viên</span>;
        }
    };

    const getTrustScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Quản lý người dùng</h1>
                    <p className="text-slate-400">Tổng: {total} người dùng</p>
                </div>
                <button
                    onClick={() => { setEditingUser(null); setShowModal(true); }}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Thêm người dùng
                </button>
            </div>

            {/* Filters */}
            <div className="card p-4 flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, email..."
                        className="input pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="input w-auto"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="">Tất cả vai trò</option>
                    <option value="ADMIN">Admin</option>
                    <option value="TEACHER">Giảng viên</option>
                    <option value="STUDENT">Học viên</option>
                </select>
            </div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="table-header">
                                <th className="px-6 py-4 text-left">Người dùng</th>
                                <th className="px-6 py-4 text-left">Vai trò</th>
                                <th className="px-6 py-4 text-left">Đơn vị</th>
                                <th className="px-6 py-4 text-left">Trust Score</th>
                                <th className="px-6 py-4 text-left">Trạng thái</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                            Đang tải...
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        Không tìm thấy người dùng nào
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id} className="table-row">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-military-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                    {user.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{user.fullName}</p>
                                                    <p className="text-sm text-slate-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                                        <td className="px-6 py-4 text-slate-400">
                                            {typeof user.unitId === 'object' ? user.unitId?.name : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-semibold ${getTrustScoreColor(user.trustScore)}`}>
                                                {user.trustScore}/100
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleActive(user)}
                                                disabled={togglingId === user._id}
                                                className={`flex items-center gap-1.5 px-2 py-1 rounded transition-all ${user.isActive ? 'text-green-400 hover:bg-green-500/10' : 'text-red-400 hover:bg-red-500/10'} disabled:opacity-50`}
                                            >
                                                {togglingId === user._id ? (
                                                    <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                                ) : user.isActive ? (
                                                    <><UserCheck className="w-4 h-4" />Hoạt động</>
                                                ) : (
                                                    <><UserX className="w-4 h-4" />Vô hiệu</>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setEditingUser(user); setShowModal(true); }}
                                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4 text-slate-400" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    disabled={deletingId === user._id}
                                                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    {deletingId === user._id ? (
                                                        <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4 text-red-400" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Add/Edit Modal */}
            {showModal && (
                <UserModal
                    user={editingUser}
                    units={units}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); fetchUsers(); }}
                />
            )}
        </div>
    );
}

// User Modal Component
function UserModal({
    user,
    units,
    onClose,
    onSave,
}: {
    user: User | null;
    units: Unit[];
    onClose: () => void;
    onSave: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        email: user?.email || '',
        password: '',
        fullName: user?.fullName || '',
        role: user?.role || 'STUDENT',
        unitId: typeof user?.unitId === 'object' ? user?.unitId?._id : user?.unitId || '',
        militaryId: user?.militaryId || '',
        rank: user?.rank || '',
        trustScore: user?.trustScore || 100,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data: any = { ...form };
            if (!data.password) delete data.password;
            if (!data.unitId) delete data.unitId;

            // Backend không cho gửi trustScore khi tạo mới
            if (!user) {
                delete data.trustScore;
            }

            if (user) {
                await usersApi.update(user._id, data);
            } else {
                await usersApi.create(data);
            }
            onSave();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Lưu thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <h2 className="text-xl font-semibold text-white">
                        {user ? 'Sửa người dùng' : 'Thêm người dùng mới'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="label">Họ và tên *</label>
                            <input
                                type="text"
                                className="input"
                                value={form.fullName}
                                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="label">Email *</label>
                            <input
                                type="email"
                                className="input"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="label">{user ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}</label>
                            <input
                                type="password"
                                className="input"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required={!user}
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="label">Vai trò *</label>
                            <select
                                className="input"
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value as any })}
                            >
                                <option value="STUDENT">Học viên</option>
                                <option value="TEACHER">Giảng viên</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>

                        <div>
                            <label className="label">Đơn vị</label>
                            <select
                                className="input"
                                value={form.unitId}
                                onChange={(e) => setForm({ ...form, unitId: e.target.value })}
                            >
                                <option value="">-- Chọn đơn vị --</option>
                                {units.map((unit) => (
                                    <option key={unit._id} value={unit._id}>{unit.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="label">Mã quân nhân</label>
                            <input
                                type="text"
                                className="input"
                                value={form.militaryId}
                                onChange={(e) => setForm({ ...form, militaryId: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="label">Cấp bậc</label>
                            <input
                                type="text"
                                className="input"
                                value={form.rank}
                                onChange={(e) => setForm({ ...form, rank: e.target.value })}
                            />
                        </div>

                        {user && (
                            <div>
                                <label className="label">Trust Score</label>
                                <input
                                    type="number"
                                    className="input"
                                    min={0}
                                    max={100}
                                    value={form.trustScore}
                                    onChange={(e) => setForm({ ...form, trustScore: parseInt(e.target.value) })}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Hủy
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Đang lưu...' : user ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
