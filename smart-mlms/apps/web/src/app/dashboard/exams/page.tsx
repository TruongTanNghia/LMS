'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, FileQuestion, Clock, Play, CheckCircle, Edit, Trash2, X, Eye } from 'lucide-react';
import { examsApi, coursesApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth';

interface Question {
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
    content: string;
    options: string[];
    correctAnswer: string;
    points: number;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

interface Exam {
    _id: string;
    title: string;
    description: string;
    duration: number;
    totalPoints: number;
    passScore: number;
    isPublished: boolean;
    requireProctoring: boolean;
    startTime?: string;
    endTime?: string;
    courseId?: { _id: string; title: string };
    questions: Question[];
}

interface Course {
    _id: string;
    title: string;
}

export default function ExamsPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const { user } = useAuthStore();

    useEffect(() => {
        fetchExams();
        fetchCourses();
    }, []);

    const fetchExams = async () => {
        try {
            const response = await examsApi.getAll();
            setExams(response.data);
        } catch (error) {
            console.error('Error fetching exams:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await coursesApi.getAll();
            setCourses(response.data.courses || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa bài thi này?')) return;
        setDeletingId(id);
        try {
            await examsApi.delete(id);
            fetchExams();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Xóa thất bại');
        } finally {
            setDeletingId(null);
        }
    };

    const getExamStatus = (exam: Exam) => {
        const now = new Date();
        if (exam.startTime && new Date(exam.startTime) > now) {
            return { label: 'Sắp diễn ra', color: 'badge-info' };
        }
        if (exam.endTime && new Date(exam.endTime) < now) {
            return { label: 'Đã kết thúc', color: 'badge-warning' };
        }
        return { label: 'Đang mở', color: 'badge-success' };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Bài thi</h1>
                    <p className="text-slate-400">Quản lý và tham gia các bài kiểm tra</p>
                </div>
                {(user?.role === 'ADMIN' || user?.role === 'TEACHER') && (
                    <button
                        onClick={() => { setEditingExam(null); setShowModal(true); }}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Tạo bài thi
                    </button>
                )}
            </div>

            {/* Exams List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : exams.length === 0 ? (
                <div className="card p-12 text-center">
                    <FileQuestion className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">Chưa có bài thi nào</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {exams.map((exam, index) => {
                        const status = getExamStatus(exam);
                        return (
                            <motion.div
                                key={exam._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="card card-hover p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                                            <FileQuestion className="w-7 h-7 text-white" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-white">{exam.title}</h3>
                                                <span className={`badge ${status.color}`}>{status.label}</span>
                                                {exam.requireProctoring && (
                                                    <span className="badge badge-warning">AI Giám sát</span>
                                                )}
                                                {!exam.isPublished && (
                                                    <span className="badge badge-info">Bản nháp</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-400">
                                                {exam.courseId?.title || 'Không có khóa học'} • {exam.questions?.length || 0} câu hỏi
                                            </p>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {exam.duration} phút
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Đạt: {exam.passScore}/{exam.totalPoints} điểm
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {user?.role === 'STUDENT' ? (
                                            <Link href={`/dashboard/exams/${exam._id}/take`}>
                                                <button className="btn-primary flex items-center gap-2">
                                                    <Play className="w-4 h-4" />
                                                    Vào thi
                                                </button>
                                            </Link>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => { setEditingExam(exam); setShowModal(true); }}
                                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                                    title="Sửa"
                                                >
                                                    <Edit className="w-5 h-5 text-slate-400" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(exam._id)}
                                                    disabled={deletingId === exam._id}
                                                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Xóa"
                                                >
                                                    {deletingId === exam._id ? (
                                                        <div className="w-5 h-5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-5 h-5 text-red-400" />
                                                    )}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Exam Modal */}
            {showModal && (
                <ExamModal
                    exam={editingExam}
                    courses={courses}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); fetchExams(); }}
                />
            )}
        </div>
    );
}

// Exam Modal Component
function ExamModal({
    exam,
    courses,
    onClose,
    onSave,
}: {
    exam: Exam | null;
    courses: Course[];
    onClose: () => void;
    onSave: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: exam?.title || '',
        description: exam?.description || '',
        courseId: exam?.courseId?._id || '',
        duration: exam?.duration || 45,
        passScore: exam?.passScore || 60,
        requireProctoring: exam?.requireProctoring ?? true,
        shuffleQuestions: true,
        shuffleOptions: true,
        maxAttempts: 1,
        isPublished: exam?.isPublished ?? false,
    });
    const [questions, setQuestions] = useState<Question[]>(exam?.questions || []);

    const addQuestion = () => {
        setQuestions([...questions, {
            type: 'MULTIPLE_CHOICE',
            content: '',
            options: ['', '', '', ''],
            correctAnswer: '',
            points: 10,
            difficulty: 'MEDIUM',
        }]);
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const updated = [...questions];
        (updated[index] as any)[field] = value;
        setQuestions(updated);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const updated = [...questions];
        updated[qIndex].options[oIndex] = value;
        setQuestions(updated);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (questions.length === 0) {
            alert('Vui lòng thêm ít nhất 1 câu hỏi');
            return;
        }
        setLoading(true);

        try {
            const data = {
                ...form,
                questions,
                courseId: form.courseId || undefined,
            };

            if (exam) {
                await examsApi.update(exam._id, data);
            } else {
                await examsApi.create(data);
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
                className="card w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <h2 className="text-xl font-semibold text-white">
                        {exam ? 'Sửa bài thi' : 'Tạo bài thi mới'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="label">Tiêu đề bài thi *</label>
                            <input
                                type="text"
                                className="input"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="label">Khóa học</label>
                            <select
                                className="input"
                                value={form.courseId}
                                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                            >
                                <option value="">-- Chọn khóa học --</option>
                                {courses.map((c) => (
                                    <option key={c._id} value={c._id}>{c.title}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="label">Thời gian (phút) *</label>
                            <input
                                type="number"
                                className="input"
                                min={1}
                                value={form.duration}
                                onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })}
                                required
                            />
                        </div>

                        <div>
                            <label className="label">Điểm đạt *</label>
                            <input
                                type="number"
                                className="input"
                                min={0}
                                value={form.passScore}
                                onChange={(e) => setForm({ ...form, passScore: parseInt(e.target.value) })}
                                required
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.requireProctoring}
                                    onChange={(e) => setForm({ ...form, requireProctoring: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className="text-slate-300">AI Giám sát</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isPublished}
                                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className="text-slate-300">Xuất bản</span>
                            </label>
                        </div>
                    </div>

                    {/* Questions */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-white">Câu hỏi ({questions.length})</h3>
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="btn-secondary text-sm flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm câu hỏi
                            </button>
                        </div>

                        <div className="space-y-4">
                            {questions.map((q, qIndex) => (
                                <div key={qIndex} className="border border-slate-700 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400 text-sm">Câu {qIndex + 1}</span>
                                        <div className="flex items-center gap-2">
                                            <select
                                                className="input w-auto text-sm py-1"
                                                value={q.type}
                                                onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                                            >
                                                <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                                                <option value="TRUE_FALSE">Đúng/Sai</option>
                                            </select>
                                            <input
                                                type="number"
                                                className="input w-20 text-sm py-1"
                                                placeholder="Điểm"
                                                value={q.points}
                                                onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(qIndex)}
                                                className="p-1 hover:bg-red-500/20 rounded text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <textarea
                                        className="input text-sm resize-none"
                                        rows={2}
                                        placeholder="Nội dung câu hỏi"
                                        value={q.content}
                                        onChange={(e) => updateQuestion(qIndex, 'content', e.target.value)}
                                    />

                                    {q.type === 'MULTIPLE_CHOICE' && (
                                        <div className="grid grid-cols-2 gap-2">
                                            {q.options.map((opt, oIndex) => (
                                                <div key={oIndex} className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name={`correct-${qIndex}`}
                                                        checked={q.correctAnswer === opt && opt !== ''}
                                                        onChange={() => updateQuestion(qIndex, 'correctAnswer', opt)}
                                                        className="w-4 h-4"
                                                    />
                                                    <input
                                                        type="text"
                                                        className="input flex-1 text-sm py-1"
                                                        placeholder={`Đáp án ${oIndex + 1}`}
                                                        value={opt}
                                                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {q.type === 'TRUE_FALSE' && (
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={`tf-${qIndex}`}
                                                    checked={q.correctAnswer === 'Đúng'}
                                                    onChange={() => updateQuestion(qIndex, 'correctAnswer', 'Đúng')}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-slate-300">Đúng</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={`tf-${qIndex}`}
                                                    checked={q.correctAnswer === 'Sai'}
                                                    onChange={() => updateQuestion(qIndex, 'correctAnswer', 'Sai')}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-slate-300">Sai</span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {questions.length === 0 && (
                                <div className="text-center py-8 text-slate-500">
                                    Chưa có câu hỏi nào. Bấm "Thêm câu hỏi" để bắt đầu.
                                </div>
                            )}
                        </div>
                    </div>
                </form>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
                    <button type="button" onClick={onClose} className="btn-secondary">
                        Hủy
                    </button>
                    <button onClick={handleSubmit} disabled={loading} className="btn-primary">
                        {loading ? 'Đang lưu...' : exam ? 'Cập nhật' : 'Tạo bài thi'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
