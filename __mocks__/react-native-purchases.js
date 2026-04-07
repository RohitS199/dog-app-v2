module.exports = {
  configure: jest.fn(),
  getProducts: jest.fn(() => Promise.resolve([])),
  purchaseStoreProduct: jest.fn(),
  restorePurchases: jest.fn(),
  getCustomerInfo: jest.fn(() => Promise.resolve({ entitlements: { active: {} } })),
  addCustomerInfoUpdateListener: jest.fn(() => ({ remove: jest.fn() })),
  PURCHASES_ERROR_CODE: { PURCHASE_CANCELLED_ERROR: 'PURCHASE_CANCELLED_ERROR' },
};
