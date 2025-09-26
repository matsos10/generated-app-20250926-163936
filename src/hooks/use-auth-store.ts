import { create } from 'zustand';
import type { SubscriptionStatus } from '../../worker/types';
interface User {
  name: string;
  email: string;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: string | null;
}
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}
export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: (email: string) => {
    // In a real app, you'd fetch user data from the backend upon login.
    // Here, we'll mock it.
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);
    set({
      isAuthenticated: true,
      user: {
        name: 'Demo User',
        email,
        subscriptionStatus: 'Trialing',
        trialEndsAt: trialEndsAt.toISOString(),
      }
    });
  },
  logout: () => set({ isAuthenticated: false, user: null }),
  setUser: (user) => set({ user }),
}));