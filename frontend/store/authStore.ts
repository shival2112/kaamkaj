import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

interface DbUser {
  id: string;
  name: string;
  email: string;
  role: 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';
  avatar: string | null;
}

interface AuthState {
  user: User | null;
  dbUser: DbUser | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  setDbUser: (dbUser: DbUser) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  dbUser: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setDbUser: (dbUser) => set({ dbUser }),
  setLoading: (isLoading) => set({ isLoading }),
  clearUser: () => set({ user: null, dbUser: null }),
}));
