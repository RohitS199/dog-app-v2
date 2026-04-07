import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const REVENUECAT_API_KEYS = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '',
};

const SUPERWALL_API_KEYS = {
  ios: process.env.EXPO_PUBLIC_SUPERWALL_IOS_KEY ?? '',
};

// True when running in Expo Go (native modules like Superwall aren't available)
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

interface Props {
  children: React.ReactNode;
}

/**
 * Wraps the app with Superwall + RevenueCat providers in development builds.
 * In Expo Go, renders children directly (no paywall functionality).
 */
export function SuperwallProviderWrapper({ children }: Props) {
  if (isExpoGo) {
    return <>{children}</>;
  }

  return <SuperwallInner>{children}</SuperwallInner>;
}

// --- Everything below only executes in development/production builds ---

// Conditional imports: these modules crash in Expo Go, so they're gated by isExpoGo above
const superwallModule = isExpoGo ? null : require('expo-superwall');
const purchasesModule = isExpoGo ? null : require('react-native-purchases');

function SuperwallInner({ children }: Props) {
  const {
    CustomPurchaseControllerProvider,
    SuperwallProvider: ExpoSuperwallProvider,
  } = superwallModule!;
  const Purchases = purchasesModule!.default;
  const { PURCHASES_ERROR_CODE } = purchasesModule!;

  useEffect(() => {
    if (Platform.OS === 'ios' && REVENUECAT_API_KEYS.ios) {
      Purchases.configure({ apiKey: REVENUECAT_API_KEYS.ios });
    }
  }, []);

  return (
    <CustomPurchaseControllerProvider
      controller={{
        onPurchase: async (params: any) => {
          try {
            const products = await Purchases.getProducts([params.productId]);
            const product = products[0];

            if (!product) {
              return { type: 'failed', error: 'Product not found' };
            }

            await Purchases.purchaseStoreProduct(product);
          } catch (error: any) {
            if (error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
              return { type: 'cancelled' };
            }
            return { type: 'failed', error: error.message };
          }
        },

        onPurchaseRestore: async () => {
          try {
            await Purchases.restorePurchases();
          } catch (error: any) {
            return { type: 'failed', error: error.message };
          }
        },
      }}
    >
      <ExpoSuperwallProvider apiKeys={SUPERWALL_API_KEYS}>
        <SubscriptionSync />
        {children}
      </ExpoSuperwallProvider>
    </CustomPurchaseControllerProvider>
  );
}

function SubscriptionSync() {
  const { useUser } = superwallModule!;
  const Purchases = purchasesModule!.default;
  const { useSubscriptionStore } = require('../stores/subscriptionStore');

  const { setSubscriptionStatus } = useUser();
  const { setEntitled } = useSubscriptionStore();

  useEffect(() => {
    const syncStatus = (customerInfo: any) => {
      const activeEntitlements = Object.keys(customerInfo.entitlements.active);
      const isActive = activeEntitlements.length > 0;

      setSubscriptionStatus({
        status: isActive ? 'ACTIVE' : 'INACTIVE',
        entitlements: activeEntitlements.map((id: string) => ({
          id,
          type: 'SERVICE_LEVEL' as const,
        })),
      });

      setEntitled(isActive);
    };

    const listener = Purchases.addCustomerInfoUpdateListener(syncStatus);

    Purchases.getCustomerInfo()
      .then(syncStatus)
      .catch(() => {});

    return () => {
      listener?.remove();
    };
  }, [setSubscriptionStatus, setEntitled]);

  return null;
}
