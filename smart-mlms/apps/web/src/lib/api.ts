import axios from 'axios';
import { useAuthStore } from '@/lib/store/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),

    register: (data: {
        email: string;
        password: string;
        fullName: string;
        role?: string;
    }) => api.post('/auth/register', data),

    me: () => api.get('/auth/me'),
};

// Users API
export const usersApi = {
    getAll: (params?: { page?: number; limit?: number; role?: string; search?: string }) =>
        api.get('/users', { params }),

    getById: (id: string) => api.get(`/users/${id}`),

    create: (data: any) => api.post('/users', data),

    update: (id: string, data: any) => api.patch(`/users/${id}`, data),

    delete: (id: string) => api.delete(`/users/${id}`),
};

// Units API
export const unitsApi = {
    getAll: () => api.get('/units'),

    getTree: () => api.get('/units/tree'),

    getById: (id: string) => api.get(`/units/${id}`),

    create: (data: any) => api.post('/units', data),

    update: (id: string, data: any) => api.patch(`/units/${id}`, data),

    delete: (id: string) => api.delete(`/units/${id}`),
};

// Courses API
export const coursesApi = {
    getAll: (params?: { page?: number; limit?: number; search?: string; published?: boolean }) =>
        api.get('/courses', { params }),

    getById: (id: string) => api.get(`/courses/${id}`),

    create: (data: any) => api.post('/courses', data),

    update: (id: string, data: any) => api.patch(`/courses/${id}`, data),

    delete: (id: string) => api.delete(`/courses/${id}`),

    publish: (id: string) => api.patch(`/courses/${id}/publish`),

    getProgress: (id: string) => api.get(`/courses/${id}/progress`),

    updateProgress: (id: string, data: { chapterIndex: number; lessonIndex: number; progress: number }) =>
        api.post(`/courses/${id}/progress`, data),
};

// Exams API
export const examsApi = {
    getAll: (params?: { courseId?: string; published?: boolean }) =>
        api.get('/exams', { params }),

    getById: (id: string) => api.get(`/exams/${id}`),

    create: (data: any) => api.post('/exams', data),

    update: (id: string, data: any) => api.patch(`/exams/${id}`, data),

    delete: (id: string) => api.delete(`/exams/${id}`),

    start: (id: string) => api.post(`/exams/${id}/start`),

    submit: (attemptId: string, answers: { questionIndex: number; answer: string }[]) =>
        api.post(`/exams/attempts/${attemptId}/submit`, { answers }),

    reportViolation: (attemptId: string, type: string, screenshot?: string) =>
        api.post(`/exams/attempts/${attemptId}/violation`, { type, screenshot }),

    getAttempts: (examId: string) => api.get(`/exams/${examId}/attempts`),
};
