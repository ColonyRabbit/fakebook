import { create } from "zustand";

type NotificationStore = {
  unreadCount: number;
  messages: string[];
  addMessage: (msg: string) => void;
  clearMessages: () => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,
  messages: [],
  addMessage: (msg) =>
    set((state) => ({
      unreadCount: state.unreadCount + 1,
      messages: [...state.messages, msg],
    })),
  clearMessages: () => set({ unreadCount: 0, messages: [] }),
}));
