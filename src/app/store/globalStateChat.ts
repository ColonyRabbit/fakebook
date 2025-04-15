import { create } from "zustand";
interface CurrentUserState {
  isChatOpen: boolean;
  toggleChat: () => void;
}

export const globalStateChat = create<CurrentUserState>((set) => ({
  isChatOpen: false,
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
}));
