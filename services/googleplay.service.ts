/**
 * Serviço de Assinaturas Google Play
 * Gerencia compras in-app e assinaturas via Google Play Billing
 */

import * as InAppPurchases from 'react-native-iap';

// IDs dos produtos de assinatura (correspondem aos criados no Google Play Console)
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
  /**
   * Inicializa a conexão com o Google Play Billing
   */
  initialize: async (): Promise<boolean> => {
    try {
      if (__DEV__) console.log('[GooglePlay] Inicializando...');

      const isConnected = await InAppPurchases.connectAsync();

      if (__DEV__) console.log('[GooglePlay] Conectado:', isConnected);
      return isConnected;
    } catch (error: any) {
      if (__DEV__) console.error('[GooglePlay] Erro ao inicializar:', error);
      return false;
    }
  },

  /**
   * Busca produtos de assinatura disponíveis
   */
  getSubscriptions: async (): Promise<SubscriptionProduct[]> => {
    try {
      const skus = Object.values(SUBSCRIPTION_SKUS);

      if (__DEV__) console.log('[GooglePlay] Buscando produtos:', skus);

      const { results } = await InAppPurchases.getProductsAsync(skus);

      if (__DEV__) console.log('[GooglePlay] Produtos encontrados:', results.length);

      return results.map(product => ({
        productId: product.productId,
        title: product.title,
        description: product.description,
        price: product.price,
        priceAmountMicros: product.priceAmountMicros || 0,
        priceCurrencyCode: product.priceCurrencyCode || 'BRL',
        subscriptionPeriod: (product as any).subscriptionPeriod,
      }));
    } catch (error: any) {
      if (__DEV__) console.error('[GooglePlay] Erro ao buscar produtos:', error);
      return [];
    }
  },

  /**
   * Compra uma assinatura
   */
  purchaseSubscription: async (productId: string): Promise<[PurchaseResult | null, string | null]> => {
    try {
      if (__DEV__) console.log('[GooglePlay] Iniciando compra:', productId);

      const result = await InAppPurchases.purchaseItemAsync(productId);

      if (__DEV__) console.log('[GooglePlay] Resultado da compra:', result);

      if (result.responseCode === InAppPurchases.IAPResponseCode.OK) {
        const purchase = result.results?.[0];

        if (purchase) {
          // Validar compra no backend antes de finalizar
          const isValid = await GooglePlayService.validatePurchaseOnBackend(purchase);

          if (!isValid) {
            return [null, 'Falha na validação da compra'];
          }

          // Finalizar compra (acknowledge)
          await InAppPurchases.finishTransactionAsync(purchase, true);

          return [{
            acknowledged: purchase.acknowledged,
            orderId: purchase.orderId || '',
            packageName: purchase.packageName || '',
            productId: purchase.productId,
            purchaseTime: purchase.purchaseTime || Date.now(),
            purchaseToken: purchase.purchaseToken || '',
            transactionReceipt: purchase.transactionReceipt,
          }, null];
        }

        return [null, 'Nenhuma compra retornada'];
      } else if (result.responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
        return [null, 'Compra cancelada pelo usuário'];
      } else {
        return [null, `Erro na compra: ${result.responseCode}`];
      }
    } catch (error: any) {
      if (__DEV__) console.error('[GooglePlay] Erro ao comprar:', error);
      return [null, error.message || 'Erro ao processar compra'];
    }
  },

  /**
   * Valida a compra no backend
   * IMPORTANTE: Sempre valide compras no servidor para evitar fraudes
   */
  validatePurchaseOnBackend: async (purchase: InAppPurchases.InAppPurchase): Promise<boolean> => {
    try {
      if (__DEV__) console.log('[GooglePlay] Validando compra no backend...');

      // TODO: Implementar validação no backend
      // O backend deve verificar o purchaseToken com a API do Google Play
      // https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.subscriptions/get

      // Por enquanto, retorna true (REMOVER EM PRODUÇÃO)
      if (__DEV__) console.warn('[GooglePlay] ⚠️ Validação de compra não implementada no backend!');

      return true;
    } catch (error: any) {
      if (__DEV__) console.error('[GooglePlay] Erro ao validar compra:', error);
      return false;
    }
  },

  /**
   * Busca histórico de compras do usuário
   */
  getPurchaseHistory: async (): Promise<InAppPurchases.InAppPurchase[]> => {
    try {
      if (__DEV__) console.log('[GooglePlay] Buscando histórico de compras...');

      const { results } = await InAppPurchases.getPurchaseHistoryAsync();

      if (__DEV__) console.log('[GooglePlay] Compras encontradas:', results.length);

      return results;
    } catch (error: any) {
      if (__DEV__) console.error('[GooglePlay] Erro ao buscar histórico:', error);
      return [];
    }
  },

  /**
   * Verifica se o usuário tem assinatura ativa
   */
  hasActiveSubscription: async (): Promise<boolean> => {
    try {
      const history = await GooglePlayService.getPurchaseHistory();

      // Filtra apenas assinaturas (não compras únicas)
      const subscriptions = history.filter(purchase =>
        Object.values(SUBSCRIPTION_SKUS).includes(purchase.productId as any)
      );

      if (subscriptions.length === 0) {
        return false;
      }

      // Ordena por data de compra (mais recente primeiro)
      subscriptions.sort((a, b) => (b.purchaseTime || 0) - (a.purchaseTime || 0));

      const latestSubscription = subscriptions[0];

      // Verifica se a assinatura ainda está ativa
      // NOTA: Esta verificação deve ser feita idealmente no backend
      // consultando a API do Google Play para obter o status atual
      return latestSubscription.acknowledged === true;
    } catch (error: any) {
      if (__DEV__) console.error('[GooglePlay] Erro ao verificar assinatura:', error);
      return false;
    }
  },

  /**
   * Desconecta do Google Play Billing
   */
  disconnect: async (): Promise<void> => {
    try {
      if (__DEV__) console.log('[GooglePlay] Desconectando...');
      await InAppPurchases.disconnectAsync();
    } catch (error: any) {
      if (__DEV__) console.error('[GooglePlay] Erro ao desconectar:', error);
    }
  },

  /**
   * Configura listener para mudanças no estado de compra
   */
  setPurchaseListener: (callback: (result: InAppPurchases.InAppPurchase) => void): void => {
    InAppPurchases.setPurchaseListener(({ responseCode, results }) => {
      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        results?.forEach(purchase => {
          if (__DEV__) console.log('[GooglePlay] Compra atualizada:', purchase);
          callback(purchase);
        });
      }
    });
  },
};
