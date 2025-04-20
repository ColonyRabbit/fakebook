import { create } from "zustand";

interface NotificationState {
  notifications: string[];
  addNotification: (message: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (message) =>
    set((state) => ({ notifications: [...state.notifications, message] })),
  clearNotifications: () => set({ notifications: [] }),
}));
