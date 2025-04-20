import { create } from "zustand";
import { toast } from "react-hot-toast"; // นำเข้า toast

interface CurrentUserState {
  isChatOpen: boolean;
  toggleChat: () => void;
  notifications: string[];
  addNotification: (message: string) => void;
  clearNotifications: () => void;
}

export const globalStateChat = create<CurrentUserState>((set) => ({
  isChatOpen: false,
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  notifications: [],
  addNotification: (message) => {
    // เพิ่มข้อความใน Zustand
    set((state) => ({ notifications: [...state.notifications, message] }));
    // แสดง toast แจ้งเตือน
    toast.success(message);
  },
  clearNotifications: () => set({ notifications: [] }),
}));
