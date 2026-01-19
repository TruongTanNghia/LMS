'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Play, Clock, BookOpen, User, ChevronDown, ChevronRight,
    CheckCircle, Lock, PlayCircle
} from 'lucide-react';
import { coursesApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth';

interface Lesson {
    title: string;
    type: string;
    duration: number;
    position: number;
    videoUrl?: string;
    content?: string;
}

interface Chapter {
    title: string;
    description?: string;
    position: number;
    lessons: Lesson[];
}

interface Course {
    _id: string;
    title: string;
    description: string;
    thumbnail: string;
    totalLessons: number;
    totalDuration: number;
    isPublished: boolean;
    chapters: Chapter[];
    instructorId: { fullName: string; email: string };
}

interface Progress {
    chapterIndex: number;
    lessonIndex: number;
    progress: number;
    isCompleted: boolean;
}

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const [course, setCourse] = useState<Course | null>(null);
    const [progress, setProgress] = useState<Progress[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedChapters, setExpandedChapters] = useState<number[]>([0]);
    const [currentLesson, setCurrentLesson] = useState<{ chapter: number; lesson: number } | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchCourse();
            fetchProgress();
        }
    }, [params.id]);

    const fetchCourse = async () => {
        try {
            const response = await coursesApi.getById(params.id as string);
            setCourse(response.data);
        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProgress = async () => {
        try {
            const response = await coursesApi.getProgress(params.id as string);
            setProgress(response.data);
        } catch (error) {
            console.error('Error fetching progress:', error);
        }
    };

    const toggleChapter = (index: number) => {
        setExpandedChapters((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    const getLessonProgress = (chapterIndex: number, lessonIndex: number): Progress | undefined => {
        return progress.find(
            (p) => p.chapterIndex === chapterIndex && p.lessonIndex === lessonIndex
        );
    };

    const startLesson = (chapterIndex: number, lessonIndex: number) => {
        setCurrentLesson({ chapter: chapterIndex, lesson: lessonIndex });
    };

    const completedCount = progress.filter((p) => p.isCompleted).length;
    const totalLessons = course?.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0) || 0;
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-400">Không tìm thấy khóa học</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-white">{course.title}</h1>
                    <p className="text-slate-400">{course.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Video Player Area */}
                    {currentLesson ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="card aspect-video bg-dark-300 flex items-center justify-center"
                        >
                            <div className="text-center">
                                <PlayCircle className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-white">
                                    {course.chapters[currentLesson.chapter]?.lessons[currentLesson.lesson]?.title}
                                </h3>
                                <p className="text-slate-400 text-sm mt-2">
                                    Video player sẽ hiển thị ở đây
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="card aspect-video bg-gradient-to-br from-primary-600 to-military-600 flex items-center justify-center">
                            <div className="text-center text-white">
                                <Play className="w-16 h-16 mx-auto mb-4 opacity-80" />
                                <p>Chọn bài học để bắt đầu</p>
                            </div>
                        </div>
                    )}

                    {/* Course Curriculum */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Nội dung khóa học</h2>
                        <div className="space-y-2">
                            {course.chapters.map((chapter, chapterIndex) => (
                                <div key={chapterIndex} className="border border-slate-700 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => toggleChapter(chapterIndex)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {expandedChapters.includes(chapterIndex) ? (
                                                <ChevronDown className="w-5 h-5 text-slate-400" />
                                            ) : (
                                                <ChevronRight className="w-5 h-5 text-slate-400" />
                                            )}
                                            <span className="font-medium text-white">{chapter.title}</span>
                                        </div>
                                        <span className="text-sm text-slate-400">
                                            {chapter.lessons.length} bài học
                                        </span>
                                    </button>

                                    {expandedChapters.includes(chapterIndex) && (
                                        <div className="border-t border-slate-700">
                                            {chapter.lessons.map((lesson, lessonIndex) => {
                                                const lessonProgress = getLessonProgress(chapterIndex, lessonIndex);
                                                const isCompleted = lessonProgress?.isCompleted;
                                                const isCurrent =
                                                    currentLesson?.chapter === chapterIndex &&
                                                    currentLesson?.lesson === lessonIndex;

                                                return (
                                                    <button
                                                        key={lessonIndex}
                                                        onClick={() => startLesson(chapterIndex, lessonIndex)}
                                                        className={`w-full flex items-center gap-3 p-3 pl-12 text-left hover:bg-slate-800/30 transition-colors ${isCurrent ? 'bg-primary-500/10 border-l-2 border-primary-500' : ''
                                                            }`}
                                                    >
                                                        {isCompleted ? (
                                                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                                        ) : (
                                                            <PlayCircle className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                                        )}
                                                        <span className={`flex-1 ${isCompleted ? 'text-slate-400' : 'text-white'}`}>
                                                            {lesson.title}
                                                        </span>
                                                        <span className="text-sm text-slate-500">{lesson.duration} phút</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Progress Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="card p-6"
                    >
                        <h3 className="font-semibold text-white mb-4">Tiến độ học tập</h3>
                        <div className="relative pt-1">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">Hoàn thành</span>
                                <span className="text-sm font-semibold text-primary-400">{progressPercent}%</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary-500 to-military-500 transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <p className="text-sm text-slate-500 mt-2">
                                {completedCount}/{totalLessons} bài học
                            </p>
                        </div>
                    </motion.div>

                    {/* Course Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card p-6 space-y-4"
                    >
                        <h3 className="font-semibold text-white">Thông tin khóa học</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3 text-slate-400">
                                <User className="w-4 h-4" />
                                <span>Giảng viên: {course.instructorId?.fullName || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <BookOpen className="w-4 h-4" />
                                <span>{totalLessons} bài học</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <Clock className="w-4 h-4" />
                                <span>{course.totalDuration || 0} phút</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
