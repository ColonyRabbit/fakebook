import { create } from "zustand";
interface CurrentUserState {
  id: number | null;
  username: string | null;
  photo: string | null;
  email: string | null;
  setUser: (user: {
    id: number;
    username: string;
    photo: string;
    email: string;
  }) => void;
  clearUser: () => void;
}

export const useCurrentUserStore = create<CurrentUserState>((set) => ({
  id: null,
  username: null,
  photo: null,
  email: null,
  setUser: ({ id, username, photo, email }) =>
    set({ id, username, photo, email }),
  clearUser: () => set({ id: null, username: null, photo: null, email: null }),
}));
