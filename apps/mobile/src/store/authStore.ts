import { create } from 'zustand';

interface AuthState {
  userId: string | null;
  isGuest: boolean;
  setUser: (userId: string, isGuest?: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  isGuest: true,
  setUser: (userId, isGuest = false) => set({ userId, isGuest }),
  signOut: () => set({ userId: null, isGuest: true }),
}));

