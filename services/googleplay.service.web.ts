/**
 * Mock do GooglePlayService para Web
 * O Google Play Billing não funciona na web, então fornecemos um mock
 */

export const SUBSCRIPTION_SKUS = {
  MONITORA: 'com.stoneativos.monitoraapp.monitora',
  MONITORA_01: 'monitora-01',
  MONITORA_02: 'monitora-02',
  MONITORA_ANUAL: 'com.stoneativos.monitoraapp.stoneupplus',
  MONITORA_ANUAL_01: 'monitora-anual-01',
} as const;

export interface SubscriptionProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceAmountMicros: number;
  priceCurrencyCode: string;
  subscriptionPeriod?: string;
}

export interface PurchaseResult {
  acknowledged: boolean;
  orderId: string;
  packageName: string;
  productId: string;
  purchaseTime: number;
  purchaseToken: string;
  transactionReceipt?: string;
}

export const GooglePlayService = {
  initialize: async (): Promise<boolean> => {
    console.warn('[GooglePlay] Not available on web');
    return false;
  },

  getSubscriptions: async (): Promise<SubscriptionProduct[]> => {
    console.warn('[GooglePlay] Not available on web');
    return [];
  },

  purchaseSubscription: async (productId: string): Promise<[PurchaseResult | null, string | null]> => {
    console.warn('[GooglePlay] Not available on web');
    return [null, 'Google Play Billing is not available on web'];
  },

  validatePurchaseOnBackend: async (): Promise<boolean> => {
    return false;
  },

  getPurchaseHistory: async (): Promise<any[]> => {
    return [];
  },

  hasActiveSubscription: async (): Promise<boolean> => {
    return false;
  },

  disconnect: async (): Promise<void> => {},

  setPurchaseListener: (callback: any): void => {},
};
