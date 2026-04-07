module.exports = {
  SuperwallProvider: ({ children }) => children,
  CustomPurchaseControllerProvider: ({ children }) => children,
  usePlacement: () => ({
    registerPlacement: jest.fn(),
    state: { status: 'idle' },
  }),
  useUser: () => ({
    setSubscriptionStatus: jest.fn(),
  }),
  useSuperwall: () => ({}),
};
