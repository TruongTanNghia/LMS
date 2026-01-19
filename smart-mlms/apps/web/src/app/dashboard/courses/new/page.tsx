'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Trash2, GripVertical, Save, Video, FileText, Presentation, Type } from 'lucide-react';
import { coursesApi } from '@/lib/api';

const lessonSchema = z.object({
    title: z.string().min(1, 'Tiêu đề bài học là bắt buộc'),
    type: z.enum(['VIDEO', 'DOCUMENT', 'SLIDE', 'TEXT']),
    content: z.string().optional(),
    videoUrl: z.string().optional(),
    duration: z.number().optional(),
    position: z.number(),
});

const chapterSchema = z.object({
    title: z.string().min(1, 'Tiêu đề chương là bắt buộc'),
    description: z.string().optional(),
    position: z.number(),
    lessons: z.array(lessonSchema),
});

const courseSchema = z.object({
    title: z.string().min(1, 'Tiêu đề khóa học là bắt buộc'),
    description: z.string().optional(),
    tags: z.string().optional(),
    chapters: z.array(chapterSchema),
});

type CourseForm = z.infer<typeof courseSchema>;

const lessonTypes = [
    { value: 'VIDEO', label: 'Video', icon: Video },
    { value: 'DOCUMENT', label: 'Tài liệu', icon: FileText },
    { value: 'SLIDE', label: 'Slide', icon: Presentation },
    { value: 'TEXT', label: 'Văn bản', icon: Type },
];

export default function CreateCoursePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<CourseForm>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            title: '',
            description: '',
            tags: '',
            chapters: [
                {
                    title: 'Chương 1',
                    description: '',
                    position: 1,
                    lessons: [],
                },
            ],
        },
    });

    const { fields: chapterFields, append: appendChapter, remove: removeChapter } = useFieldArray({
        control,
        name: 'chapters',
    });

    const onSubmit = async (data: CourseForm) => {
        setError('');
        setLoading(true);

        try {
            // Transform tags string to array
            const courseData = {
                ...data,
                tags: data.tags ? data.tags.split(',').map((t) => t.trim()) : [],
            };

            await coursesApi.create(courseData);
            router.push('/dashboard/courses');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Tạo khóa học thất bại');
        } finally {
            setLoading(false);
        }
    };

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
                    <h1 className="text-2xl font-bold text-white">Tạo khóa học mới</h1>
                    <p className="text-slate-400">Điền thông tin và nội dung khóa học</p>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                            placeholder="VD: Chiến thuật quân sự nâng cao"
                            className={`input ${errors.title ? 'border-red-500' : ''}`}
                            {...register('title')}
                        />
                        {errors.title && (
                            <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="label">Mô tả</label>
                        <textarea
                            rows={3}
                            placeholder="Mô tả ngắn gọn về khóa học..."
                            className="input resize-none"
                            {...register('description')}
                        />
                    </div>

                    <div>
                        <label className="label">Tags (phân cách bởi dấu phẩy)</label>
                        <input
                            type="text"
                            placeholder="VD: chiến thuật, nâng cao, tác chiến"
                            className="input"
                            {...register('tags')}
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
                            onClick={() =>
                                appendChapter({
                                    title: `Chương ${chapterFields.length + 1}`,
                                    description: '',
                                    position: chapterFields.length + 1,
                                    lessons: [],
                                })
                            }
                            className="btn-secondary flex items-center gap-2 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm chương
                        </button>
                    </div>

                    <div className="space-y-4">
                        {chapterFields.map((chapter, chapterIndex) => (
                            <ChapterEditor
                                key={chapter.id}
                                index={chapterIndex}
                                control={control}
                                register={register}
                                errors={errors}
                                onRemove={() => removeChapter(chapterIndex)}
                                canRemove={chapterFields.length > 1}
                            />
                        ))}
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
                        disabled={loading}
                        className="btn-primary flex items-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Tạo khóa học
                    </button>
                </div>
            </form>
        </div>
    );
}

// Chapter Editor Component
function ChapterEditor({
    index,
    control,
    register,
    errors,
    onRemove,
    canRemove,
}: {
    index: number;
    control: any;
    register: any;
    errors: any;
    onRemove: () => void;
    canRemove: boolean;
}) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `chapters.${index}.lessons`,
    });

    return (
        <div className="border border-slate-700 rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-4">
                <GripVertical className="w-5 h-5 text-slate-500 cursor-move" />
                <input
                    type="text"
                    placeholder="Tiêu đề chương"
                    className="input flex-1"
                    {...register(`chapters.${index}.title`)}
                />
                {canRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
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
                {...register(`chapters.${index}.description`)}
            />

            {/* Lessons */}
            <div className="space-y-2 pl-6 border-l-2 border-slate-700">
                {fields.map((lesson, lessonIndex) => (
                    <div key={lesson.id} className="flex items-center gap-3">
                        <select
                            className="input w-32 text-sm"
                            {...register(`chapters.${index}.lessons.${lessonIndex}.type`)}
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
                            {...register(`chapters.${index}.lessons.${lessonIndex}.title`)}
                        />
                        <input
                            type="number"
                            placeholder="Phút"
                            className="input w-20 text-sm"
                            {...register(`chapters.${index}.lessons.${lessonIndex}.duration`, {
                                valueAsNumber: true,
                            })}
                        />
                        <button
                            type="button"
                            onClick={() => remove(lessonIndex)}
                            className="p-1.5 hover:bg-red-500/20 rounded text-red-400 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() =>
                        append({
                            title: '',
                            type: 'VIDEO',
                            duration: 0,
                            position: fields.length + 1,
                        })
                    }
                    className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
                >
                    <Plus className="w-4 h-4" />
                    Thêm bài học
                </button>
            </div>
        </div>
    );
}
