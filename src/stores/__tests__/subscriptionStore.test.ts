import { useSubscriptionStore } from '../subscriptionStore';

// Reset store state before each test to ensure test isolation
beforeEach(() => {
  useSubscriptionStore.setState({
    isEntitled: false,
    details: null,
    isLoadingDetails: false,
    detailsError: null,
  });
});

describe('subscriptionStore', () => {
  it('1. initial state: details is null, isEntitled is false, no error', () => {
    const state = useSubscriptionStore.getState();
    expect(state.isEntitled).toBe(false);
    expect(state.details).toBeNull();
    expect(state.isLoadingDetails).toBe(false);
    expect(state.detailsError).toBeNull();
  });

  it('2. fetchSubscription populates details from mock', async () => {
    await useSubscriptionStore.getState().fetchSubscription();
    const state = useSubscriptionStore.getState();
    expect(state.details).not.toBeNull();
    expect(state.details?.plan).toBe('Yearly Plan');
    expect(state.details?.price).toBe('$39.99 / year');
    expect(state.details?.renewalDate).toBe('May 14, 2026');
    expect(state.details?.isActive).toBe(true);
    expect(state.isLoadingDetails).toBe(false);
    expect(state.detailsError).toBeNull();
  });

  it('3. fetchSubscription sets isLoadingDetails true while in flight', async () => {
    const loadingStates: boolean[] = [];
    const unsub = useSubscriptionStore.subscribe((state) => {
      loadingStates.push(state.isLoadingDetails);
    });
    await useSubscriptionStore.getState().fetchSubscription();
    unsub();
    // At some point during the fetch, isLoadingDetails should have been true
    expect(loadingStates).toContain(true);
    // After completion it should be false
    expect(useSubscriptionStore.getState().isLoadingDetails).toBe(false);
  });

  it('4. setEntitled(true) updates entitlement (existing behavior preserved)', () => {
    useSubscriptionStore.getState().setEntitled(true);
    expect(useSubscriptionStore.getState().isEntitled).toBe(true);
    useSubscriptionStore.getState().setEntitled(false);
    expect(useSubscriptionStore.getState().isEntitled).toBe(false);
  });

  it('5. clearSubscription zeros everything — entitlement, details, loading, error', async () => {
    // Populate everything first
    await useSubscriptionStore.getState().fetchSubscription();
    useSubscriptionStore.getState().setEntitled(true);
    // Manually set an error state to verify it gets cleared
    useSubscriptionStore.setState({ detailsError: 'some error' });

    // Now clear
    useSubscriptionStore.getState().clearSubscription();
    const state = useSubscriptionStore.getState();
    expect(state.isEntitled).toBe(false);
    expect(state.details).toBeNull();
    expect(state.isLoadingDetails).toBe(false);
    expect(state.detailsError).toBeNull();
  });

  it('6. mock data has exactly 4 perks (regression guard)', async () => {
    await useSubscriptionStore.getState().fetchSubscription();
    const { details } = useSubscriptionStore.getState();
    expect(details?.perks).toHaveLength(4);
    expect(details?.perks).toEqual([
      'Unlimited daily logs',
      'AI weekly insights',
      'Vet-ready PDF export',
      'Up to 5 dogs',
    ]);
  });
});
