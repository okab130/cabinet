import { create } from 'zustand';
import { User } from '../types/user';
import { mockUsers } from '../data/mockData';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  login: (email: string) => {
    const user = mockUsers.find((u) => u.email === email);
    if (user) {
      set({ currentUser: user, isAuthenticated: true });
      return true;
    }
    // デモ用: 任意のメールでも管理者としてログイン可能
    set({ currentUser: mockUsers[0], isAuthenticated: true });
    return true;
  },
  logout: () => set({ currentUser: null, isAuthenticated: false }),
}));
