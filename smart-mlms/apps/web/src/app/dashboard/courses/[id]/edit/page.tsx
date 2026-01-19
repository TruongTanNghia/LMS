'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { ArrowLeft, Plus, Trash2, GripVertical, Save, Video, FileText, Presentation, Type } from 'lucide-react';
import { coursesApi } from '@/lib/api';

interface Lesson {
    title: string;
    type: 'VIDEO' | 'DOCUMENT' | 'SLIDE' | 'TEXT';
    content?: string;
    videoUrl?: string;
    duration?: number;
    position: number;
}

interface Chapter {
    title: string;
    description?: string;
    position: number;
    lessons: Lesson[];
}

interface CourseForm {
    title: string;
    description?: string;
    tags?: string;
    chapters: Chapter[];
}

const lessonTypes = [
    { value: 'VIDEO', label: 'Video', icon: Video },
    { value: 'DOCUMENT', label: 'Tài liệu', icon: FileText },
    { value: 'SLIDE', label: 'Slide', icon: Presentation },
    { value: 'TEXT', label: 'Văn bản', icon: Type },
];

export default function EditCoursePage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [course, setCourse] = useState<any>(null);

    const [form, setForm] = useState<CourseForm>({
        title: '',
        description: '',
        tags: '',
        chapters: [],
    });

    useEffect(() => {
        fetchCourse();
    }, [params.id]);

    const fetchCourse = async () => {
        try {
            const response = await coursesApi.getById(params.id as string);
            const data = response.data;
            setCourse(data);
            setForm({
                title: data.title,
                description: data.description || '',
                tags: data.tags?.join(', ') || '',
                chapters: data.chapters || [],
            });
        } catch (error) {
            console.error('Error fetching course:', error);
            alert('Không tìm thấy khóa học');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const addChapter = () => {
        setForm({
            ...form,
            chapters: [...form.chapters, {
                title: `Chương ${form.chapters.length + 1}`,
                description: '',
                position: form.chapters.length + 1,
                lessons: [],
            }],
        });
    };

    const removeChapter = (index: number) => {
        setForm({
            ...form,
            chapters: form.chapters.filter((_, i) => i !== index),
        });
    };

    const updateChapter = (index: number, field: string, value: any) => {
        const updated = [...form.chapters];
        (updated[index] as any)[field] = value;
        setForm({ ...form, chapters: updated });
    };

    const addLesson = (chapterIndex: number) => {
        const updated = [...form.chapters];
        updated[chapterIndex].lessons.push({
            title: '',
            type: 'VIDEO',
            duration: 0,
            position: updated[chapterIndex].lessons.length + 1,
        });
        setForm({ ...form, chapters: updated });
    };

    const removeLesson = (chapterIndex: number, lessonIndex: number) => {
        const updated = [...form.chapters];
        updated[chapterIndex].lessons = updated[chapterIndex].lessons.filter((_, i) => i !== lessonIndex);
        setForm({ ...form, chapters: updated });
    };

    const updateLesson = (chapterIndex: number, lessonIndex: number, field: string, value: any) => {
        const updated = [...form.chapters];
        (updated[chapterIndex].lessons[lessonIndex] as any)[field] = value;
        setForm({ ...form, chapters: updated });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const courseData = {
                ...form,
                tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [],
            };

            await coursesApi.update(params.id as string, courseData);
            router.push('/dashboard/courses');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Cập nhật khóa học thất bại');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Sửa khóa học</h1>
                    <p className="text-slate-400">{course?.title}</p>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-6 space-y-4"
                >
                    <h2 className="text-lg font-semibold text-white">Thông tin cơ bản</h2>

                    <div>
                        <label className="label">Tiêu đề khóa học *</label>
                        <input
                            type="text"
                            className="input"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="label">Mô tả</label>
                        <textarea
                            rows={3}
                            className="input resize-none"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="label">Tags (phân cách bởi dấu phẩy)</label>
                        <input
                            type="text"
                            className="input"
                            value={form.tags}
                            onChange={(e) => setForm({ ...form, tags: e.target.value })}
                        />
                    </div>
                </motion.div>

                {/* Chapters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card p-6 space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Nội dung khóa học</h2>
                        <button
                            type="button"
                            onClick={addChapter}
                            className="btn-secondary flex items-center gap-2 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm chương
                        </button>
                    </div>

                    <div className="space-y-4">
                        {form.chapters.map((chapter, chapterIndex) => (
                            <div key={chapterIndex} className="border border-slate-700 rounded-lg p-4 space-y-4">
                                <div className="flex items-center gap-4">
                                    <GripVertical className="w-5 h-5 text-slate-500 cursor-move" />
                                    <input
                                        type="text"
                                        placeholder="Tiêu đề chương"
                                        className="input flex-1"
                                        value={chapter.title}
                                        onChange={(e) => updateChapter(chapterIndex, 'title', e.target.value)}
                                    />
                                    {form.chapters.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeChapter(chapterIndex)}
                                            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <input
                                    type="text"
                                    placeholder="Mô tả chương (tùy chọn)"
                                    className="input text-sm"
                                    value={chapter.description || ''}
                                    onChange={(e) => updateChapter(chapterIndex, 'description', e.target.value)}
                                />

                                {/* Lessons */}
                                <div className="space-y-2 pl-6 border-l-2 border-slate-700">
                                    {chapter.lessons.map((lesson, lessonIndex) => (
                                        <div key={lessonIndex} className="flex items-center gap-3">
                                            <select
                                                className="input w-32 text-sm"
                                                value={lesson.type}
                                                onChange={(e) => updateLesson(chapterIndex, lessonIndex, 'type', e.target.value)}
                                            >
                                                {lessonTypes.map((type) => (
                                                    <option key={type.value} value={type.value}>
                                                        {type.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="text"
                                                placeholder="Tiêu đề bài học"
                                                className="input flex-1 text-sm"
                                                value={lesson.title}
                                                onChange={(e) => updateLesson(chapterIndex, lessonIndex, 'title', e.target.value)}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Phút"
                                                className="input w-20 text-sm"
                                                value={lesson.duration || ''}
                                                onChange={(e) => updateLesson(chapterIndex, lessonIndex, 'duration', parseInt(e.target.value) || 0)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeLesson(chapterIndex, lessonIndex)}
                                                className="p-1.5 hover:bg-red-500/20 rounded text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addLesson(chapterIndex)}
                                        className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Thêm bài học
                                    </button>
                                </div>
                            </div>
                        ))}

                        {form.chapters.length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                Chưa có chương nào. Bấm "Thêm chương" để bắt đầu.
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="btn-secondary"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
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
            </form>
        </div>
    );
}
