'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Plus, ChevronRight, Edit, Trash2, X,
    School, BookOpen, Briefcase, FileText, Building2
} from 'lucide-react';
import { unitsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth';

interface Unit {
    _id: string;
    name: string;
    code: string;
    description?: string;
    type?: string;
    category?: string;
    parentId?: string;
    level: number;
    order: number;
    isActive: boolean;
}

// Icon và màu sắc theo type - CHỈ đơn vị Nhà trường
const unitConfig: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
    SCHOOL: { icon: School, color: 'text-amber-400', bgColor: 'bg-amber-500/20', label: 'Nhà trường' },
    FACULTY: { icon: BookOpen, color: 'text-blue-400', bgColor: 'bg-blue-500/20', label: 'Khoa' },
    INSTITUTE: { icon: BookOpen, color: 'text-indigo-400', bgColor: 'bg-indigo-500/20', label: 'Viện' },
    DEPARTMENT: { icon: FileText, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', label: 'Bộ môn' },
    OFFICE: { icon: Briefcase, color: 'text-green-400', bgColor: 'bg-green-500/20', label: 'Phòng' },
    DIVISION: { icon: FileText, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', label: 'Ban' },
};

const defaultConfig = { icon: Building2, color: 'text-slate-400', bgColor: 'bg-slate-500/20', label: 'Đơn vị' };

export default function SchoolUnitsPage() {
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [filter, setFilter] = useState<string>('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const { user } = useAuthStore();

    useEffect(() => {
        fetchUnits();
    }, []);

    const fetchUnits = async () => {
        try {
            const response = await unitsApi.getAll();
            // CHỈ lấy đơn vị Nhà trường (ACADEMIC + ADMINISTRATIVE)
            const schoolUnits = response.data.filter(
                (u: Unit) => u.category === 'ACADEMIC' || u.category === 'ADMINISTRATIVE'
            );
            setUnits(schoolUnits);
        } catch (error) {
            console.error('Error fetching units:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa đơn vị này?')) return;
        setDeletingId(id);
        try {
            await unitsApi.delete(id);
            fetchUnits();
        } catch (error) {
            alert('Xóa đơn vị thất bại');
        } finally {
            setDeletingId(null);
        }
    };

    // Filter by category
    const filteredUnits = filter
        ? units.filter(u => u.category === filter)
        : units;

    // Get root units (no parent or parent is school)
    const rootUnits = filteredUnits.filter(u => !u.parentId || u.type === 'SCHOOL');

    // Count by category
    const academicCount = units.filter(u => u.category === 'ACADEMIC').length;
    const adminCount = units.filter(u => u.category === 'ADMINISTRATIVE').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">🏫 Đơn vị Nhà trường</h1>
                    <p className="text-slate-400">Khoa, Viện, Bộ môn, Phòng, Ban</p>
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => setFilter('')}
                    className={`card p-4 text-left transition-all ${!filter ? 'ring-2 ring-primary-500' : 'hover:border-slate-600'}`}
                >
                    <p className="text-2xl font-bold text-white">{units.length}</p>
                    <p className="text-sm text-slate-400">Tổng đơn vị</p>
                </button>
                <button
                    onClick={() => setFilter('ACADEMIC')}
                    className={`card p-4 text-left transition-all ${filter === 'ACADEMIC' ? 'ring-2 ring-blue-500' : 'hover:border-slate-600'}`}
                >
                    <p className="text-2xl font-bold text-blue-400">{academicCount}</p>
                    <p className="text-sm text-slate-400">Đào tạo (Khoa/Bộ môn)</p>
                </button>
                <button
                    onClick={() => setFilter('ADMINISTRATIVE')}
                    className={`card p-4 text-left transition-all ${filter === 'ADMINISTRATIVE' ? 'ring-2 ring-green-500' : 'hover:border-slate-600'}`}
                >
                    <p className="text-2xl font-bold text-green-400">{adminCount}</p>
                    <p className="text-sm text-slate-400">Hành chính (Phòng/Ban)</p>
                </button>
            </div>

            {/* Units Tree */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : rootUnits.length === 0 ? (
                <div className="card p-12 text-center">
                    <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">Chưa có đơn vị nào</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {rootUnits.sort((a, b) => a.order - b.order).map((unit, index) => (
                        <motion.div
                            key={unit._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <UnitTreeItem
                                unit={unit}
                                allUnits={filteredUnits}
                                onEdit={(u) => {
                                    setEditingUnit(u);
                                    setShowModal(true);
                                }}
                                onDelete={handleDelete}
                                deletingId={deletingId}
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
    deletingId,
    isAdmin,
}: {
    unit: Unit;
    allUnits: Unit[];
    level?: number;
    onEdit: (unit: Unit) => void;
    onDelete: (id: string) => void;
    deletingId: string | null;
    isAdmin?: boolean;
}) {
    const [expanded, setExpanded] = useState(level < 2);
    const children = allUnits.filter(u => u.parentId === unit._id).sort((a, b) => a.order - b.order);
    const hasChildren = children.length > 0;
    const config = unitConfig[unit.type || ''] || defaultConfig;
    const IconComponent = config.icon;

    return (
        <div className={`${level > 0 ? 'ml-6 mt-2' : ''}`}>
            <div className={`card p-4 transition-all ${level === 0 ? 'border-l-4 border-l-blue-500' : ''}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {hasChildren ? (
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <ChevronRight
                                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
                                />
                            </button>
                        ) : (
                            <div className="w-8" />
                        )}
                        <div className={`p-3 rounded-xl ${config.bgColor}`}>
                            <IconComponent className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-white">{unit.name}</h3>
                                <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">{unit.code}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${config.bgColor} ${config.color}`}>
                                    {config.label}
                                </span>
                            </div>
                            {unit.description && (
                                <p className="text-sm text-slate-400 mt-0.5">{unit.description}</p>
                            )}
                        </div>
                    </div>
                    {isAdmin && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => onEdit(unit)}
                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <Edit className="w-4 h-4 text-slate-400" />
                            </button>
                            <button
                                onClick={() => onDelete(unit._id)}
                                disabled={deletingId === unit._id}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {deletingId === unit._id ? (
                                    <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {expanded && hasChildren && (
                <div className="border-l-2 border-slate-700/50 ml-4 pl-2">
                    {children.map(child => (
                        <UnitTreeItem
                            key={child._id}
                            unit={child}
                            allUnits={allUnits}
                            level={level + 1}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            deletingId={deletingId}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// Unit Modal - CHỈ loại Nhà trường
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
        type: unit?.type || 'FACULTY',
        category: unit?.category || 'ACADEMIC',
        parentId: unit?.parentId || '',
        order: unit?.order || 0,
    });

    const typeToCategory: Record<string, string> = {
        SCHOOL: 'ACADEMIC',
        FACULTY: 'ACADEMIC',
        INSTITUTE: 'ACADEMIC',
        DEPARTMENT: 'ACADEMIC',
        OFFICE: 'ADMINISTRATIVE',
        DIVISION: 'ADMINISTRATIVE',
    };

    const handleTypeChange = (type: string) => {
        setForm({ ...form, type, category: typeToCategory[type] || 'ACADEMIC' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data: any = {
                name: form.name,
                code: form.code,
                type: form.type,
                category: form.category,
                order: form.order,
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card w-full max-w-lg"
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <h2 className="text-xl font-semibold text-white">
                        {unit ? 'Sửa đơn vị' : 'Thêm đơn vị Nhà trường'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
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
                            <label className="label">Loại đơn vị *</label>
                            <select
                                className="input"
                                value={form.type}
                                onChange={(e) => handleTypeChange(e.target.value)}
                            >
                                <optgroup label="Đào tạo">
                                    <option value="SCHOOL">Nhà trường</option>
                                    <option value="FACULTY">Khoa</option>
                                    <option value="INSTITUTE">Viện</option>
                                    <option value="DEPARTMENT">Bộ môn</option>
                                </optgroup>
                                <optgroup label="Hành chính">
                                    <option value="OFFICE">Phòng</option>
                                    <option value="DIVISION">Ban</option>
                                </optgroup>
                            </select>
                        </div>

                        <div className="col-span-2">
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
                                <option value="">-- Không có --</option>
                                {units.filter(u => u._id !== unit?._id).map((u) => (
                                    <option key={u._id} value={u._id}>
                                        {'  '.repeat(u.level)}{u.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="label">Thứ tự</label>
                            <input
                                type="number"
                                className="input"
                                min={0}
                                value={form.order}
                                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary">Hủy</button>
                        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Đang lưu...
                                </>
                            ) : 'Lưu'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
