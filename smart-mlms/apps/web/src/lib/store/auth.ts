import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
    _id: string;
    email: string;
    fullName: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT';
    unitId?: string;
    trustScore: number;
    avatar?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    _hasHydrated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isLoading: false,
            _hasHydrated: false,
            setAuth: (user, token) => set({ user, token }),
            logout: () => set({ user: null, token: null }),
            setLoading: (isLoading) => set({ isLoading }),
            setHasHydrated: (state) => set({ _hasHydrated: state }),
        }),
        {
            name: 'mlms-auth',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);

export const getAuthHeader = () => {
    const token = useAuthStore.getState().token;
    return token ? { Authorization: `Bearer ${token}` } : {};
};
