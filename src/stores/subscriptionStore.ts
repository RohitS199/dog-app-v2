import { create } from 'zustand';

interface SubscriptionState {
  /** Whether the user has an active entitlement */
  isEntitled: boolean;
  /** Set entitlement status (called by SubscriptionSync) */
  setEntitled: (entitled: boolean) => void;
  /** Reset on sign-out */
  clearSubscription: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  isEntitled: false,

  setEntitled: (entitled) => {
    set({ isEntitled: entitled });
  },

  clearSubscription: () => {
    set({ isEntitled: false });
  },
}));
