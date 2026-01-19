'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Building2, ChevronRight, Edit, Trash2, Users } from 'lucide-react';
import { unitsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth';

interface Unit {
    _id: string;
    name: string;
    code: string;
    description?: string;
    parentId?: string;
    level: number;
    isActive: boolean;
}

export default function UnitsPage() {
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const { user } = useAuthStore();

    useEffect(() => {
        fetchUnits();
    }, []);

    const fetchUnits = async () => {
        try {
            const response = await unitsApi.getAll();
            setUnits(response.data);
        } catch (error) {
            console.error('Error fetching units:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa đơn vị này?')) return;
        try {
            await unitsApi.delete(id);
            fetchUnits();
        } catch (error) {
            alert('Xóa đơn vị thất bại');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Quản lý đơn vị</h1>
                    <p className="text-slate-400">Cơ cấu tổ chức theo hệ thống quân sự</p>
                </div>
                {user?.role === 'ADMIN' && (
                    <button
                        onClick={() => {
                            setEditingUnit(null);
                            setShowModal(true);
                        }}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Thêm đơn vị
                    </button>
                )}
            </div>

            {/* Units Tree */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : units.length === 0 ? (
                <div className="card p-12 text-center">
                    <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">Chưa có đơn vị nào</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Render root units (level 0 OR no parentId) */}
                    {units.filter(u => !u.parentId).map((rootUnit, index) => (
                        <motion.div
                            key={rootUnit._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <UnitTreeItem
                                unit={rootUnit}
                                allUnits={units}
                                onEdit={(u) => {
                                    setEditingUnit(u);
                                    setShowModal(true);
                                }}
                                onDelete={handleDelete}
                                isAdmin={user?.role === 'ADMIN'}
                            />
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <UnitModal
                    unit={editingUnit}
                    units={units}
                    onClose={() => setShowModal(false)}
                    onSave={() => {
                        setShowModal(false);
                        fetchUnits();
                    }}
                />
            )}
        </div>
    );
}

// Recursive Unit Tree Item Component
function UnitTreeItem({
    unit,
    allUnits,
    level = 0,
    onEdit,
    onDelete,
    isAdmin,
}: {
    unit: Unit;
    allUnits: Unit[];
    level?: number;
    onEdit: (unit: Unit) => void;
    onDelete: (id: string) => void;
    isAdmin?: boolean;
}) {
    const [expanded, setExpanded] = useState(true);
    const children = allUnits.filter(u => u.parentId === unit._id);
    const hasChildren = children.length > 0;

    return (
        <div className={`${level > 0 ? 'ml-8 mt-2' : ''}`}>
            <div className="card card-hover p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {hasChildren ? (
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="p-1 hover:bg-slate-700 rounded transition-colors"
                            >
                                <ChevronRight
                                    className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
                                />
                            </button>
                        ) : (
                            <div className="w-7" />
                        )}
                        <div className={`p-3 rounded-xl ${level === 0 ? 'bg-primary-500/20' : level === 1 ? 'bg-blue-500/20' : 'bg-slate-700'}`}>
                            <Building2 className={`w-6 h-6 ${level === 0 ? 'text-primary-400' : level === 1 ? 'text-blue-400' : 'text-slate-400'}`} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-white">{unit.name}</h3>
                                <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">{unit.code}</span>
                                {level === 0 && <span className="text-xs text-primary-400 bg-primary-500/20 px-2 py-0.5 rounded">Gốc</span>}
                            </div>
                            {unit.description && (
                                <p className="text-sm text-slate-400">{unit.description}</p>
                            )}
                        </div>
                    </div>
                    {isAdmin && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onEdit(unit)}
                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <Edit className="w-4 h-4 text-slate-400" />
                            </button>
                            <button
                                onClick={() => onDelete(unit._id)}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* Render children recursively */}
            {expanded && hasChildren && (
                <div className="border-l-2 border-slate-700 ml-4">
                    {children.map(child => (
                        <UnitTreeItem
                            key={child._id}
                            unit={child}
                            allUnits={allUnits}
                            level={level + 1}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// Unit Modal Component
function UnitModal({
    unit,
    units,
    onClose,
    onSave,
}: {
    unit: Unit | null;
    units: Unit[];
    onClose: () => void;
    onSave: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: unit?.name || '',
        code: unit?.code || '',
        description: unit?.description || '',
        parentId: unit?.parentId || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Clean up empty fields
            const data: any = {
                name: form.name,
                code: form.code,
            };
            if (form.description) data.description = form.description;
            if (form.parentId) data.parentId = form.parentId;

            if (unit) {
                await unitsApi.update(unit._id, data);
            } else {
                await unitsApi.create(data);
            }
            onSave();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Lưu thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card w-full max-w-md p-6"
            >
                <h2 className="text-xl font-semibold text-white mb-4">
                    {unit ? 'Sửa đơn vị' : 'Thêm đơn vị mới'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Tên đơn vị *</label>
                        <input
                            type="text"
                            className="input"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="label">Mã đơn vị *</label>
                        <input
                            type="text"
                            className="input"
                            value={form.code}
                            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                            required
                        />
                    </div>

                    <div>
                        <label className="label">Mô tả</label>
                        <textarea
                            className="input resize-none"
                            rows={2}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="label">Đơn vị cha</label>
                        <select
                            className="input"
                            value={form.parentId}
                            onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                        >
                            <option value="">-- Không có (đơn vị gốc) --</option>
                            {units.map((u) => (
                                <option key={u._id} value={u._id}>{u.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Hủy
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
