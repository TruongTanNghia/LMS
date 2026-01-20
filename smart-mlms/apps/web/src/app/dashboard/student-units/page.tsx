'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Plus, ChevronRight, Edit, Trash2, X,
    Shield, Users, GraduationCap, Building2
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

// Icon và màu sắc theo type - CHỈ đơn vị Học viên
const unitConfig: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
    BATTALION: { icon: Shield, color: 'text-orange-400', bgColor: 'bg-orange-500/20', label: 'Tiểu đoàn' },
    COMPANY: { icon: Users, color: 'text-red-400', bgColor: 'bg-red-500/20', label: 'Đại đội' },
    CLASS: { icon: GraduationCap, color: 'text-pink-400', bgColor: 'bg-pink-500/20', label: 'Lớp' },
};

const defaultConfig = { icon: Building2, color: 'text-slate-400', bgColor: 'bg-slate-500/20', label: 'Đơn vị' };

export default function StudentUnitsPage() {
    const [units, setUnits] = useState<Unit[]>([]);
    const [allUnits, setAllUnits] = useState<Unit[]>([]); // For parent selection
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const { user } = useAuthStore();

    useEffect(() => {
        fetchUnits();
    }, []);

    const fetchUnits = async () => {
        try {
            const response = await unitsApi.getAll();
            // Lưu tất cả để chọn parent
            setAllUnits(response.data);
            // CHỈ lấy đơn vị Học viên (MILITARY)
            const militaryUnits = response.data.filter((u: Unit) => u.category === 'MILITARY');
            setUnits(militaryUnits);
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

    // Get root military units (Tiểu đoàn - level 1)
    const battalions = units.filter(u => u.type === 'BATTALION');

    // Stats
    const battalionCount = units.filter(u => u.type === 'BATTALION').length;
    const companyCount = units.filter(u => u.type === 'COMPANY').length;
    const classCount = units.filter(u => u.type === 'CLASS').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">🎖️ Đơn vị Học viên</h1>
                    <p className="text-slate-400">Tiểu đoàn → Đại đội → Lớp</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card p-4">
                    <p className="text-2xl font-bold text-white">{units.length}</p>
                    <p className="text-sm text-slate-400">Tổng đơn vị</p>
                </div>
                <div className="card p-4 border-l-4 border-l-orange-500">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                            <Shield className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-orange-400">{battalionCount}</p>
                            <p className="text-sm text-slate-400">Tiểu đoàn</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4 border-l-4 border-l-red-500">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <Users className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-400">{companyCount}</p>
                            <p className="text-sm text-slate-400">Đại đội</p>
                        </div>
                    </div>
                </div>
                <div className="card p-4 border-l-4 border-l-pink-500">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-500/20 rounded-lg">
                            <GraduationCap className="w-5 h-5 text-pink-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-pink-400">{classCount}</p>
                            <p className="text-sm text-slate-400">Lớp</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Units Tree */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : battalions.length === 0 ? (
                <div className="card p-12 text-center">
                    <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">Chưa có tiểu đoàn nào</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {battalions.sort((a, b) => a.order - b.order).map((battalion, index) => (
                        <motion.div
                            key={battalion._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <UnitTreeItem
                                unit={battalion}
                                allUnits={units}
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
                    allUnits={allUnits}
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

// Recursive Unit Tree Item
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
    const [expanded, setExpanded] = useState(true);
    const children = allUnits.filter(u => u.parentId === unit._id).sort((a, b) => a.order - b.order);
    const hasChildren = children.length > 0;
    const config = unitConfig[unit.type || ''] || defaultConfig;
    const IconComponent = config.icon;

    const levelColors = [
        'border-l-orange-500',
        'border-l-red-500',
        'border-l-pink-500',
    ];

    return (
        <div className={`${level > 0 ? 'ml-8 mt-3' : ''}`}>
            <div className={`card p-4 transition-all border-l-4 ${levelColors[level] || 'border-l-slate-500'}`}>
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
                                {hasChildren && (
                                    <span className="text-xs text-slate-500">({children.length})</span>
                                )}
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

// Unit Modal - CHỈ loại Học viên
function UnitModal({
    unit,
    units,
    allUnits,
    onClose,
    onSave,
}: {
    unit: Unit | null;
    units: Unit[];
    allUnits: Unit[];
    onClose: () => void;
    onSave: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: unit?.name || '',
        code: unit?.code || '',
        description: unit?.description || '',
        type: unit?.type || 'BATTALION',
        parentId: unit?.parentId || '',
        order: unit?.order || 0,
    });

    // Get school unit for attaching battalions
    const schoolUnit = allUnits.find(u => u.type === 'SCHOOL');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data: any = {
                name: form.name,
                code: form.code,
                type: form.type,
                category: 'MILITARY',
                order: form.order,
            };
            if (form.description) data.description = form.description;

            // Set parent based on type
            if (form.type === 'BATTALION' && schoolUnit) {
                data.parentId = schoolUnit._id;
            } else if (form.parentId) {
                data.parentId = form.parentId;
            }

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

    // Get possible parents based on type
    const getParentOptions = () => {
        if (form.type === 'BATTALION') return [];
        if (form.type === 'COMPANY') return units.filter(u => u.type === 'BATTALION');
        if (form.type === 'CLASS') return units.filter(u => u.type === 'COMPANY');
        return [];
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
                        {unit ? 'Sửa đơn vị' : 'Thêm đơn vị Học viên'}
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
                                placeholder="VD: Tiểu đoàn 1, Đại đội 2, Lớp CT01"
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
                                placeholder="VD: TD1, DD2, CT01"
                                required
                            />
                        </div>

                        <div>
                            <label className="label">Loại đơn vị *</label>
                            <select
                                className="input"
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value, parentId: '' })}
                            >
                                <option value="BATTALION">🎖️ Tiểu đoàn</option>
                                <option value="COMPANY">👥 Đại đội</option>
                                <option value="CLASS">🎓 Lớp</option>
                            </select>
                        </div>

                        {form.type !== 'BATTALION' && (
                            <div className="col-span-2">
                                <label className="label">
                                    {form.type === 'COMPANY' ? 'Thuộc Tiểu đoàn *' : 'Thuộc Đại đội *'}
                                </label>
                                <select
                                    className="input"
                                    value={form.parentId}
                                    onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Chọn --</option>
                                    {getParentOptions().map((u) => (
                                        <option key={u._id} value={u._id}>{u.name} ({u.code})</option>
                                    ))}
                                </select>
                            </div>
                        )}

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
