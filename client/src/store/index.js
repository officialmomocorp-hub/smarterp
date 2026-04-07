import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      impersonateId: null,

      setAuth: (user) => set({ user, isAuthenticated: !!user }),
      setImpersonateId: (id) => set({ impersonateId: id }),
      logout: () => {
        set({ user: null, isAuthenticated: false, impersonateId: null });
      },
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
