import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import { useTaskStore } from './useTaskStore';
import { useSettingsStore } from './useSettingsStore';
import {
  INITIAL_TASKS,
  INITIAL_SUBJECTS,
  INITIAL_ROUTINES,
  INITIAL_TIMER_LOGS,
  INITIAL_MONTHS_PLAN,
} from '../data/seed';

const USER_DATA_PREFIX = 'build-lhs-user-';
const USER_SETTINGS_PREFIX = 'build-lhs-settings-';

const createSalt = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
};

const createUserId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `user-${crypto.randomUUID()}`;
  }
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

// Fallback hash for non-HTTPS local network origins where crypto.subtle is unavailable
const fallbackHash = (input) => {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `${(h2 >>> 0).toString(16).padStart(8, '0')}${(h1 >>> 0).toString(16).padStart(8, '0')}`;
};

const hashPassword = async (password, salt) => {
  const payload = `${salt}:${password}`;
  if (
    typeof crypto !== 'undefined' &&
    crypto.subtle &&
    typeof TextEncoder !== 'undefined'
  ) {
    try {
      const encoded = new TextEncoder().encode(payload);
      const digest = await crypto.subtle.digest('SHA-256', encoded);
      return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return fallbackHash(payload);
    }
  }
  return fallbackHash(payload);
};

const extractTaskData = (state) => ({
  tasks: state.tasks || [],
  subjects: state.subjects || [],
  goals: state.goals || [],
  routines: state.routines || [],
  timerLogs: state.timerLogs || [],
  yearlyPlan: state.yearlyPlan || INITIAL_MONTHS_PLAN,
});

const extractSettingsData = (state) => ({
  userName: state.userName || 'Student',
  userAvatar: state.userAvatar || '/assets/student_avatar.jpg',
  userMotto: state.userMotto || 'Building high focus, one sprint at a time 🎯',
  theme: state.theme || 'dark',
  soundEnabled: state.soundEnabled !== undefined ? state.soundEnabled : true,
  soundVolume: state.soundVolume !== undefined ? state.soundVolume : 0.5,
  notificationsEnabled:
    state.notificationsEnabled !== undefined ? state.notificationsEnabled : true,
  readNotificationIds: state.readNotificationIds || [],
});

const buildFreshTaskData = () => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const clonedTasks = JSON.parse(JSON.stringify(INITIAL_TASKS)).map((t) => ({
    ...t,
    date: todayStr,
    createdAt: new Date().toISOString(),
  }));
  const clonedLogs = JSON.parse(JSON.stringify(INITIAL_TIMER_LOGS)).map((l) => ({
    ...l,
    date: todayStr,
  }));
  return {
    tasks: clonedTasks,
    subjects: JSON.parse(JSON.stringify(INITIAL_SUBJECTS)),
    goals: [],
    routines: JSON.parse(JSON.stringify(INITIAL_ROUTINES)),
    timerLogs: clonedLogs,
    yearlyPlan: JSON.parse(JSON.stringify(INITIAL_MONTHS_PLAN)),
  };
};

let isSwitchingAccount = false;

const saveUserSnapshot = (userId) => {
  if (!userId || typeof window === 'undefined' || !window.localStorage) return;
  try {
    const taskSlice = extractTaskData(useTaskStore.getState());
    const settingsSlice = extractSettingsData(useSettingsStore.getState());
    window.localStorage.setItem(`${USER_DATA_PREFIX}${userId}`, JSON.stringify(taskSlice));
    window.localStorage.setItem(`${USER_SETTINGS_PREFIX}${userId}`, JSON.stringify(settingsSlice));
  } catch {
    // ignore storage errors
  }
};

const loadUserSnapshot = (user) => {
  if (!user || typeof window === 'undefined' || !window.localStorage) return;
  isSwitchingAccount = true;
  try {
    const rawTasks = window.localStorage.getItem(`${USER_DATA_PREFIX}${user.id}`);
    if (rawTasks) {
      const parsedTasks = JSON.parse(rawTasks);
      useTaskStore.setState({
        tasks: Array.isArray(parsedTasks.tasks) ? parsedTasks.tasks : [],
        subjects: Array.isArray(parsedTasks.subjects) ? parsedTasks.subjects : [],
        goals: Array.isArray(parsedTasks.goals) ? parsedTasks.goals : [],
        routines: Array.isArray(parsedTasks.routines) ? parsedTasks.routines : [],
        timerLogs: Array.isArray(parsedTasks.timerLogs) ? parsedTasks.timerLogs : [],
        yearlyPlan: Array.isArray(parsedTasks.yearlyPlan)
          ? parsedTasks.yearlyPlan
          : JSON.parse(JSON.stringify(INITIAL_MONTHS_PLAN)),
      });
    } else {
      useTaskStore.setState(buildFreshTaskData());
    }

    const rawSettings = window.localStorage.getItem(`${USER_SETTINGS_PREFIX}${user.id}`);
    if (rawSettings) {
      const parsedSettings = JSON.parse(rawSettings);
      useSettingsStore.setState({
        ...parsedSettings,
        userName: parsedSettings.userName || user.name,
      });
    } else {
      useSettingsStore.setState({
        userName: user.name,
        userAvatar: '/assets/student_avatar.jpg',
        readNotificationIds: [],
      });
    }

    if (typeof useTaskStore.getState().recordDailyVisit === 'function') {
      useTaskStore.getState().recordDailyVisit();
    }
  } catch {
    // ignore parse errors
  } finally {
    isSwitchingAccount = false;
  }
  saveUserSnapshot(user.id);
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: null,

      signUp: async ({ name, email, password }) => {
        const cleanName = (name || '').trim();
        const cleanEmail = (email || '').trim().toLowerCase();
        const rawPassword = password || '';

        if (!cleanName) {
          return { success: false, error: 'Please enter your name.' };
        }
        if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
          return { success: false, error: 'Please enter a valid email address.' };
        }
        if (rawPassword.length < 6) {
          return { success: false, error: 'Password must be at least 6 characters.' };
        }

        const existingUsers = get().users || [];
        if (existingUsers.some((u) => u.email === cleanEmail)) {
          return { success: false, error: 'An account with this email already exists.' };
        }

        const salt = createSalt();
        const passwordHash = await hashPassword(rawPassword, salt);
        const newUser = {
          id: createUserId(),
          name: cleanName,
          email: cleanEmail,
          passwordHash,
          salt,
          createdAt: new Date().toISOString(),
        };

        const isFirstAccount = existingUsers.length === 0;

        if (isFirstAccount) {
          // Keep and link existing tasks, subjects, routines, and analytics to the first signed-up account
          useSettingsStore.setState({ userName: cleanName });
          set({
            users: [newUser],
            currentUserId: newUser.id,
          });
          saveUserSnapshot(newUser.id);
          if (typeof useTaskStore.getState().recordDailyVisit === 'function') {
            useTaskStore.getState().recordDailyVisit();
          }
        } else {
          // Subsequent accounts start with fresh separate study data
          const freshData = buildFreshTaskData();
          isSwitchingAccount = true;
          try {
            useTaskStore.setState(freshData);
            useSettingsStore.setState({
              userName: cleanName,
              userAvatar: '/assets/student_avatar.jpg',
              readNotificationIds: [],
            });
          } finally {
            isSwitchingAccount = false;
          }

          set({
            users: [...existingUsers, newUser],
            currentUserId: newUser.id,
          });
          saveUserSnapshot(newUser.id);
        }

        return { success: true, user: newUser };
      },

      signIn: async ({ email, password }) => {
        const cleanEmail = (email || '').trim().toLowerCase();
        const rawPassword = password || '';

        if (!cleanEmail || !rawPassword) {
          return { success: false, error: 'Please enter both email and password.' };
        }

        const user = (get().users || []).find((u) => u.email === cleanEmail);
        if (!user) {
          return { success: false, error: 'No account found with that email.' };
        }

        const candidateHash = await hashPassword(rawPassword, user.salt);
        if (candidateHash !== user.passwordHash) {
          return { success: false, error: 'Incorrect password. Please try again.' };
        }

        set({ currentUserId: user.id });
        loadUserSnapshot(user);
        return { success: true, user };
      },

      signOut: () => {
        const currentId = get().currentUserId;
        if (currentId) {
          saveUserSnapshot(currentId);
        }
        set({ currentUserId: null });
      },

      updateCurrentUserName: (name) => {
        const cleanName = (name || '').trim();
        const currentId = get().currentUserId;
        if (!cleanName || !currentId) return;
        set((state) => ({
          users: state.users.map((u) => (u.id === currentId ? { ...u, name: cleanName } : u)),
        }));
      },

      changePassword: async ({ currentPassword, newPassword }) => {
        const currentId = get().currentUserId;
        const user = (get().users || []).find((u) => u.id === currentId);
        if (!user) return { success: false, error: 'Not signed in.' };

        const currentHash = await hashPassword(currentPassword || '', user.salt);
        if (currentHash !== user.passwordHash) {
          return { success: false, error: 'Current password is incorrect.' };
        }
        if ((newPassword || '').length < 6) {
          return { success: false, error: 'New password must be at least 6 characters.' };
        }

        const nextSalt = createSalt();
        const nextHash = await hashPassword(newPassword, nextSalt);
        set((state) => ({
          users: state.users.map((u) =>
            u.id === currentId ? { ...u, salt: nextSalt, passwordHash: nextHash } : u
          ),
        }));
        return { success: true };
      },
    }),
    {
      name: 'build-lhs-auth-v1',
      version: 1,
    }
  )
);

// Automatically persist changes to the active user's storage slice
useTaskStore.subscribe(() => {
  if (isSwitchingAccount) return;
  const currentId = useAuthStore.getState().currentUserId;
  if (currentId) {
    saveUserSnapshot(currentId);
  }
});

useSettingsStore.subscribe(() => {
  if (isSwitchingAccount) return;
  const currentId = useAuthStore.getState().currentUserId;
  if (currentId) {
    saveUserSnapshot(currentId);
  }
});

