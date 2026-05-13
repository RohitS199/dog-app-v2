import { create } from 'zustand';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SubscriptionDetails = {
  plan: string;
  renewalDate: string;
  price: string;
  isActive: boolean;
  perks: string[];
  manageBillingUrl?: string;
};

// ─── Mock data (swap this body for the real RevenueCat call when ready) ───────

const MOCK_SUBSCRIPTION: SubscriptionDetails = {
  plan: 'Yearly Plan',
  renewalDate: 'May 14, 2026',
  price: '$39.99 / year',
  isActive: true,
  perks: [
    'Unlimited daily logs',
    'AI weekly insights',
    'Vet-ready PDF export',
    'Up to 5 dogs',
  ],
};

// ─── Store interface ──────────────────────────────────────────────────────────

interface SubscriptionState {
  /** Whether the user has an active entitlement */
  isEntitled: boolean;

  /** Full subscription details (null until fetchSubscription resolves) */
  details: SubscriptionDetails | null;

  /** True while fetchSubscription is in flight */
  isLoadingDetails: boolean;

  /** Error message from the last failed fetchSubscription call */
  detailsError: string | null;

  /** Set entitlement status (called by SubscriptionSync in SuperwallProvider) */
  setEntitled: (entitled: boolean) => void;

  /**
   * Load subscription details.
   * Today returns mock data — swap the function body for the real RevenueCat
   * call when billing is wired in. No screen refactor needed.
   */
  fetchSubscription: () => Promise<void>;

  /** Reset on sign-out — clears entitlement AND details */
  clearSubscription: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  isEntitled: false,
  details: null,
  isLoadingDetails: false,
  detailsError: null,

  setEntitled: (entitled) => {
    set({ isEntitled: entitled });
  },

  fetchSubscription: async () => {
    set({ isLoadingDetails: true, detailsError: null });
    try {
      // Simulate async fetch — when RevenueCat wires in, replace this body with the real call
      await new Promise((resolve) => setTimeout(resolve, 100));
      set({ details: MOCK_SUBSCRIPTION, isLoadingDetails: false });
    } catch (e: any) {
      set({ detailsError: e?.message ?? 'Unknown error', isLoadingDetails: false });
    }
  },

  clearSubscription: () => {
    set({
      isEntitled: false,
      details: null,
      isLoadingDetails: false,
      detailsError: null,
    });
  },
}));
