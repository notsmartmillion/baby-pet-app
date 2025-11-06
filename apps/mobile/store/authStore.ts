import { create } from 'zustand';

interface AuthState {
  userId: string | null;
  isGuest: boolean;
  userRegion: string | null; // 'EU', 'US', 'OTHER'
  isEUUser: boolean;
  setUser: (userId: string, isGuest?: boolean) => void;
  signOut: () => void;
  setUserRegion: (region: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  isGuest: true,
  userRegion: null,
  isEUUser: false,
  setUser: (userId, isGuest = false) => set({ userId, isGuest }),
  signOut: () => set({ userId: null, isGuest: true }),
  setUserRegion: (region) => set({ 
    userRegion: region,
    isEUUser: ['EU', 'GB', 'CH', 'NO', 'IS', 'LI'].includes(region)
  }),
}));

