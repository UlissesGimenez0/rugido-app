import { create } from 'zustand';

export type UserProfile = {
  id: string;
  name: string;
  role: "admin" | "professor" | "student";
  academy_id: string ;
  professor_id?: string | null;
};

type AuthStore = {
  user: UserProfile | null
  setUser: (user: UserProfile | null) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
