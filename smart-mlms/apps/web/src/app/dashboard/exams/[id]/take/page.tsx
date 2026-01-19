'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Clock, AlertTriangle, CheckCircle, Camera, Monitor,
    ChevronLeft, ChevronRight, Flag, Send
} from 'lucide-react';
import { examsApi } from '@/lib/api';

interface Question {
    type: string;
    content: string;
    options: string[];
    points: number;
}

interface ExamAttempt {
    _id: string;
    examId: string;
    questionOrder: number[];
    startedAt: string;
    status: string;
}

interface Exam {
    _id: string;
    title: string;
    duration: number;
    totalPoints: number;
    passScore: number;
    requireProctoring: boolean;
    questions: Question[];
}

export default function TakeExamPage() {
    const params = useParams();
    const router = useRouter();
    const [exam, setExam] = useState<Exam | null>(null);
    const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [violations, setViolations] = useState<string[]>([]);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        startExam();
    }, [params.id]);

    // Timer
    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    // Tab visibility detection
    useEffect(() => {
        const handleVisibility = () => {
            if (document.hidden && attempt) {
                addViolation('TAB_SWITCH');
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [attempt]);

    // Start camera for proctoring
    useEffect(() => {
        if (exam?.requireProctoring && !cameraActive) {
            startCamera();
        }
        return () => stopCamera();
    }, [exam]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraActive(true);
            }
        } catch (err) {
            console.error('Camera error:', err);
            addViolation('CAMERA_DENIED');
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
        }
    };

    const startExam = async () => {
        try {
            // Get exam details
            const examRes = await examsApi.getById(params.id as string);
            setExam(examRes.data);

            // Start attempt
            const attemptRes = await examsApi.start(params.id as string);
            setAttempt(attemptRes.data);
            setTimeLeft(examRes.data.duration * 60);
        } catch (error: any) {
            console.error('Error starting exam:', error);
            alert(error.response?.data?.message || 'Không thể bắt đầu bài thi');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const addViolation = async (type: string) => {
        if (!attempt) return;
        setViolations((prev) => [...prev, type]);
        try {
            await examsApi.reportViolation(attempt._id, type);
        } catch (err) {
            console.error('Error reporting violation:', err);
        }
    };

    const handleAnswer = (questionIndex: number, answer: string) => {
        setAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
    };

    const handleSubmit = async () => {
        if (!attempt || submitting) return;
        setSubmitting(true);

        try {
            const answerArray = Object.entries(answers).map(([idx, answer]) => ({
                questionIndex: parseInt(idx),
                answer,
            }));

            const result = await examsApi.submit(attempt._id, answerArray);
            stopCamera();

            alert(`Điểm của bạn: ${result.data.score}/${exam?.totalPoints}\n${result.data.isPassed ? '✅ ĐẬU' : '❌ KHÔNG ĐẬT'}`);
            router.push('/dashboard/exams');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Nộp bài thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Đang tải bài thi...</p>
                </div>
            </div>
        );
    }

    if (!exam || !attempt) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-400">Không thể tải bài thi</p>
            </div>
        );
    }

    const question = exam.questions[attempt.questionOrder[currentQuestion]];

    return (
        <div className="min-h-screen bg-dark-300">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 bg-dark-200/95 backdrop-blur border-b border-slate-700 z-50">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="font-semibold text-white">{exam.title}</h1>
                        {violations.length > 0 && (
                            <span className="badge badge-warning flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {violations.length} vi phạm
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Camera indicator */}
                        {exam.requireProctoring && (
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${cameraActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                <Camera className="w-4 h-4" />
                                <span className="text-sm">{cameraActive ? 'Đang giám sát' : 'Camera tắt'}</span>
                            </div>
                        )}
                        {/* Timer */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeLeft < 300 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700'}`}>
                            <Clock className="w-4 h-4" />
                            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-20 pb-24 max-w-4xl mx-auto px-4">
                {/* Camera Preview */}
                {exam.requireProctoring && (
                    <div className="fixed bottom-24 right-4 w-48 aspect-video rounded-lg overflow-hidden border-2 border-slate-600 shadow-xl">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Question */}
                <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card p-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-sm text-slate-400">
                            Câu {currentQuestion + 1} / {exam.questions.length}
                        </span>
                        <span className="text-sm text-primary-400">{question?.points} điểm</span>
                    </div>

                    <h2 className="text-xl text-white mb-6">{question?.content}</h2>

                    {/* Options */}
                    <div className="space-y-3">
                        {question?.options.map((option, idx) => {
                            const isSelected = answers[attempt.questionOrder[currentQuestion]] === option;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(attempt.questionOrder[currentQuestion], option)}
                                    className={`w-full text-left p-4 rounded-lg border transition-all ${isSelected
                                            ? 'border-primary-500 bg-primary-500/10 text-white'
                                            : 'border-slate-700 hover:border-slate-500 text-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary-500 bg-primary-500' : 'border-slate-600'
                                            }`}>
                                            {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                                        </div>
                                        <span>{option}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Question Navigator */}
                <div className="mt-6 card p-4">
                    <p className="text-sm text-slate-400 mb-3">Danh sách câu hỏi</p>
                    <div className="flex flex-wrap gap-2">
                        {exam.questions.map((_, idx) => {
                            const questionIdx = attempt.questionOrder[idx];
                            const isAnswered = answers[questionIdx] !== undefined;
                            const isCurrent = idx === currentQuestion;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentQuestion(idx)}
                                    className={`w-10 h-10 rounded-lg font-medium transition-all ${isCurrent
                                            ? 'bg-primary-500 text-white'
                                            : isAnswered
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-dark-200/95 backdrop-blur border-t border-slate-700">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                        disabled={currentQuestion === 0}
                        className="btn-secondary flex items-center gap-2 disabled:opacity-50"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Câu trước
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="btn-primary flex items-center gap-2"
                    >
                        {submitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                        Nộp bài
                    </button>

                    <button
                        onClick={() => setCurrentQuestion((prev) => Math.min(exam.questions.length - 1, prev + 1))}
                        disabled={currentQuestion === exam.questions.length - 1}
                        className="btn-secondary flex items-center gap-2 disabled:opacity-50"
                    >
                        Câu sau
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
