import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      userName: 'Aryan',
      userAvatar: '/assets/student_avatar.jpg',
      userMotto: 'Building high focus, one sprint at a time 🎯',
      isPro: true,

      // Theme
      theme: 'dark', // 'light' | 'dark'
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: next });
        if (next === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      setTheme: (theme) => {
        set({ theme });
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      // Sound
      soundEnabled: true,
      soundVolume: 0.5,

      // Notifications
      notificationsEnabled: true,
      readNotificationIds: [],
      markAllNotificationsAsRead: (ids = []) => {
        const current = get().readNotificationIds || [];
        set({ readNotificationIds: Array.from(new Set([...current, ...ids])) });
      },
      clearReadNotifications: () => set({ readNotificationIds: [] }),

      // Profile updates
      updateProfile: (profile) => set(profile),
    }),
    {
      name: 'build-lhs-settings-v1',
      version: 1,
      onRehydrateStorage: () => (state) => {
        // Sync dark mode class on hydration
        if (state && state.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }
  )
);
