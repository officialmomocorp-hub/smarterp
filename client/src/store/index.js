import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      impersonateId: null,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      setImpersonateId: (id) => set({ impersonateId: id }),
      logout: () => set({ user: null, token: null, isAuthenticated: false, impersonateId: null }),
    }),
    { name: 'smarterp-auth' }
  )
);

export const useAppStore = create((set) => ({
  sidebarOpen: true,
  currentLanguage: 'en',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setLanguage: (lang) => set({ currentLanguage: lang }),
}));
