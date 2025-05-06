import { create } from "zustand";

interface CurrentUserState {
  openChats: { [userId: string]: boolean };
  toggleChat: (userId: string) => void;
  closeChat: (userId: string) => void;
}

export const globalStateChat = create<CurrentUserState>((set) => ({
  openChats: {},
  toggleChat: (userId) =>
    set((state) => ({
      openChats: {
        ...state.openChats,
        [userId]: !state.openChats[userId],
      },
    })),
  closeChat: (userId) =>
    set((state) => {
      const newChats = { ...state.openChats };
      delete newChats[userId];
      return { openChats: newChats };
    }),
}));
