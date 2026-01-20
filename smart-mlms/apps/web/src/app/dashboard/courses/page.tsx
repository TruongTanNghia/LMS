'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Search, BookOpen, Clock, Edit, Trash2, Eye, EyeOff, Play } from 'lucide-react';
import { coursesApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth';

interface Course {
    _id: string;
    title: string;
    description: string;
    thumbnail: string;
    totalLessons: number;
    totalDuration: number;
    isPublished: boolean;
    chapters: any[];
    instructorId: { fullName: string };
    createdAt: string;
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [total, setTotal] = useState(0);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [publishingId, setPublishingId] = useState<string | null>(null);
    const { user } = useAuthStore();

    useEffect(() => {
        fetchCourses();
    }, [search]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await coursesApi.getAll({ search });
            setCourses(response.data.courses || []);
            setTotal(response.data.total || 0);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa khóa học này?')) return;
        setDeletingId(id);
        try {
            await coursesApi.delete(id);
            fetchCourses();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Xóa thất bại');
        } finally {
            setDeletingId(null);
        }
    };

    const handleTogglePublish = async (course: Course) => {
        setPublishingId(course._id);
        try {
            if (course.isPublished) {
                await coursesApi.update(course._id, { isPublished: false });
            } else {
                await coursesApi.publish(course._id);
            }
            fetchCourses();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setPublishingId(null);
        }
    };

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'TEACHER';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Khóa học</h1>
                    <p className="text-slate-400">Tổng: {total} khóa học</p>
                </div>
                {isAdmin && (
                    <Link href="/dashboard/courses/new">
                        <button className="btn-primary flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Tạo khóa học
                        </button>
                    </Link>
                )}
            </div>

            {/* Search */}
            <div className="card p-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm khóa học..."
                        className="input pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Courses Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : courses.length === 0 ? (
                <div className="card p-12 text-center">
                    <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">Chưa có khóa học nào</p>
                    {isAdmin && (
                        <Link href="/dashboard/courses/new">
                            <button className="btn-primary mt-4">Tạo khóa học đầu tiên</button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course, index) => (
                        <motion.div
                            key={course._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="card card-hover overflow-hidden group"
                        >
                            {/* Thumbnail */}
                            <div className="h-40 bg-gradient-to-br from-primary-600 to-military-600 relative">
                                <Link href={`/dashboard/courses/${course._id}`}>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 cursor-pointer">
                                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                                            <Play className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </Link>
                                {!course.isPublished && (
                                    <div className="absolute top-3 left-3">
                                        <span className="badge badge-warning">Bản nháp</span>
                                    </div>
                                )}
                                {/* Admin Actions */}
                                {isAdmin && (
                                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleTogglePublish(course)}
                                            disabled={publishingId === course._id}
                                            className="p-2 bg-slate-800/80 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                                            title={course.isPublished ? 'Ẩn khóa học' : 'Xuất bản'}
                                        >
                                            {publishingId === course._id ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : course.isPublished ? (
                                                <EyeOff className="w-4 h-4 text-yellow-400" />
                                            ) : (
                                                <Eye className="w-4 h-4 text-green-400" />
                                            )}
                                        </button>
                                        <Link href={`/dashboard/courses/${course._id}/edit`}>
                                            <button className="p-2 bg-slate-800/80 rounded-lg hover:bg-slate-700 transition-colors">
                                                <Edit className="w-4 h-4 text-slate-300" />
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(course._id)}
                                            disabled={deletingId === course._id}
                                            className="p-2 bg-slate-800/80 rounded-lg hover:bg-red-500/50 transition-colors disabled:opacity-50"
                                        >
                                            {deletingId === course._id ? (
                                                <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                            {/* Content */}
                            <div className="p-4">
                                <Link href={`/dashboard/courses/${course._id}`}>
                                    <h3 className="font-semibold text-white mb-2 line-clamp-2 hover:text-primary-400 transition-colors cursor-pointer">
                                        {course.title}
                                    </h3>
                                </Link>
                                <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                                    {course.description || 'Chưa có mô tả'}
                                </p>
                                <div className="flex items-center justify-between text-sm text-slate-500">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1">
                                            <BookOpen className="w-4 h-4" />
                                            {course.chapters?.reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0) || 0} bài
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {course.totalDuration || 0}p
                                        </span>
                                    </div>
                                </div>
                                {course.instructorId?.fullName && (
                                    <p className="text-xs text-slate-500 mt-3">
                                        GV: {course.instructorId.fullName}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
