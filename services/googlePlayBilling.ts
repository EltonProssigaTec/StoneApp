/**
 * Google Play Billing Service - VERSÃO FINAL CORRIGIDA
 * Gerencia assinaturas via Google Play In-App Purchases
 *
 * ✅ Usa getSubscriptions() para assinaturas (não fetchProducts)
 * ✅ Busca offerToken correto via subscriptionOfferDetails
 * ✅ Compatível com Play Billing Library 6+
 * ✅ Logs detalhados para debug
 * ✅ Tratamento completo de erros
 * ✅ Pronto para validação backend
 *
 * ⚠️ IMPORTANTE: react-native-iap NÃO funciona no Expo Go!
 * Precisa de: npx expo prebuild ou eas build
 */

import { Platform, Alert } from 'react-native';
import type {
  Subscription,
  SubscriptionPurchase,
  PurchaseError,
  ProductPurchase,
} from 'react-native-iap';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface SubscriptionConfig {
  productId: string;
  basePlanId: string;
  name: string;
  description: string;
}

interface PurchaseResult {
  success: boolean;
  orderId?: string;
  purchaseToken?: string;
  productId?: string;
  basePlanId?: string;
  transactionDate?: number;
  acknowledged?: boolean;
  error?: string;
}

interface SubscriptionProduct extends Subscription {
  offerToken?: string;
  basePlanId?: string;
}

// ============================================================================
// IMPORT CONDICIONAL (para evitar erro no Expo Go)
// ============================================================================

let RNIap: any = null;
let initConnection: any = null;
let endConnection: any = null;
let getSubscriptions: any = null;
let requestSubscription: any = null;
let finishTransaction: any = null;
let purchaseUpdatedListener: any = null;
let purchaseErrorListener: any = null;
let getAvailablePurchases: any = null;

const LOG_PREFIX = '[GooglePlayBilling]';
const IS_ANDROID = Platform.OS === 'android';

// Função auxiliar para log
const log = {
  info: (...args: any[]) => console.log(`${LOG_PREFIX} 🔵`, ...args),
  success: (...args: any[]) => console.log(`${LOG_PREFIX} ✅`, ...args),
  warning: (...args: any[]) => console.warn(`${LOG_PREFIX} ⚠️`, ...args),
  error: (...args: any[]) => console.error(`${LOG_PREFIX} ❌`, ...args),
  debug: (...args: any[]) => console.log(`${LOG_PREFIX} 🐛`, ...args),
};

try {
  log.info('Tentando importar react-native-iap...');
  RNIap = require('react-native-iap');

  initConnection = RNIap.initConnection;
  endConnection = RNIap.endConnection;
  getSubscriptions = RNIap.getSubscriptions; // ✅ CORRETO para assinaturas
  requestSubscription = RNIap.requestSubscription; // ✅ CORRETO para requestar assinatura
  finishTransaction = RNIap.finishTransaction;
  purchaseUpdatedListener = RNIap.purchaseUpdatedListener;
  purchaseErrorListener = RNIap.purchaseErrorListener;
  getAvailablePurchases = RNIap.getAvailablePurchases;

  log.success('react-native-iap importado com sucesso!');
  log.debug('Métodos disponíveis:', {
    initConnection: !!initConnection,
    getSubscriptions: !!getSubscriptions,
    requestSubscription: !!requestSubscription,
  });
} catch (error) {
  log.warning('react-native-iap não disponível (Expo Go não suportado)');
  log.warning('Para usar Google Play IAP, faça build nativo com: npx expo prebuild');
}

// ============================================================================
// CONFIGURAÇÃO DE ASSINATURAS
// ============================================================================

/**
 * ✅ CENTRALIZANDO TODOS OS IDS DE ASSINATURAS
 * Produtos e planos configurados no Google Play Console
 */
export const SUBSCRIPTIONS = {
  // Produto 1: Monitora (Mensal e Trimestral)
  MONITORA: {
    productId: 'br.com.stoneup.monitora.app.monitora',
    plans: {
      MONTHLY: {
        basePlanId: 'monitora-01',
        name: 'Plano Mensal',
        description: 'Assinatura mensal do Monitora',
      },
      QUARTERLY: {
        basePlanId: 'monitora-02',
        name: 'Plano Trimestral',
        description: 'Assinatura trimestral do Monitora',
      },
    },
  },

  // Produto 2: StoneUP Plus (Anual)
  STONEUP_PLUS: {
    productId: 'br.com.stoneup.monitora.app.stoneupplus',
    plans: {
      ANNUAL: {
        basePlanId: 'monitora-anual-01',
        name: 'Plano Anual',
        description: 'Assinatura anual StoneUP Plus',
      },
    },
  },
} as const;

/**
 * Lista de todos os Product IDs (para buscar no Google Play)
 */
const SUBSCRIPTION_PRODUCT_IDS = [
  SUBSCRIPTIONS.MONITORA.productId,
  SUBSCRIPTIONS.STONEUP_PLUS.productId,
];

/**
 * Mapeamento de plano interno → Configuração Google Play
 */
const PLAN_CONFIG_MAP: Record<string, SubscriptionConfig> = {
  monthly: {
    productId: SUBSCRIPTIONS.MONITORA.productId,
    basePlanId: SUBSCRIPTIONS.MONITORA.plans.MONTHLY.basePlanId,
    name: SUBSCRIPTIONS.MONITORA.plans.MONTHLY.name,
    description: SUBSCRIPTIONS.MONITORA.plans.MONTHLY.description,
  },
  quarterly: {
    productId: SUBSCRIPTIONS.MONITORA.productId,
    basePlanId: SUBSCRIPTIONS.MONITORA.plans.QUARTERLY.basePlanId,
    name: SUBSCRIPTIONS.MONITORA.plans.QUARTERLY.name,
    description: SUBSCRIPTIONS.MONITORA.plans.QUARTERLY.description,
  },
  annual: {
    productId: SUBSCRIPTIONS.STONEUP_PLUS.productId,
    basePlanId: SUBSCRIPTIONS.STONEUP_PLUS.plans.ANNUAL.basePlanId,
    name: SUBSCRIPTIONS.STONEUP_PLUS.plans.ANNUAL.name,
    description: SUBSCRIPTIONS.STONEUP_PLUS.plans.ANNUAL.description,
  },
};

// ============================================================================
// CLASSE PRINCIPAL - GOOGLE PLAY BILLING SERVICE
// ============================================================================

class GooglePlayBillingService {
  private isInitialized = false;
  private isInitializing = false;
  private purchaseUpdateSubscription: any = null;
  private purchaseErrorSubscription: any = null;
  private cachedSubscriptions: Map<string, SubscriptionProduct> = new Map();

  // ==========================================================================
  // 1. INICIALIZAÇÃO
  // ==========================================================================

  /**
   * ✅ Inicializa conexão com Google Play Billing
   * Deve ser chamado antes de qualquer operação
   */
  async initBilling(): Promise<boolean> {
    if (!IS_ANDROID) {
      log.warning('Google Play Billing disponível apenas no Android');
      return false;
    }

    if (!RNIap || !initConnection) {
      log.error('react-native-iap não disponível. Execute: npx expo prebuild');
      return false;
    }

    if (this.isInitialized) {
      log.info('Billing já inicializado');
      return true;
    }

    if (this.isInitializing) {
      log.warning('Inicialização já em andamento...');
      return false;
    }

    try {
      this.isInitializing = true;
      log.info('Iniciando conexão com Google Play Billing...');

      // Inicializa conexão
      const connected = await initConnection();
      log.success('Conexão estabelecida:', connected);

      // Configura listeners de compra
      this.setupPurchaseListeners();

      this.isInitialized = true;
      this.isInitializing = false;

      log.success('✅ Google Play Billing inicializado com sucesso!');
      return true;
    } catch (error: any) {
      this.isInitializing = false;
      log.error('Erro ao inicializar Google Play Billing:', error?.message || error);
      return false;
    }
  }

  /**
   * ✅ Configura listeners para eventos de compra
   */
  private setupPurchaseListeners(): void {
    if (!purchaseUpdatedListener || !purchaseErrorListener) {
      log.warning('Listeners de compra não disponíveis');
      return;
    }

    // Listener de compra bem-sucedida
    this.purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: SubscriptionPurchase | ProductPurchase) => {
        log.success('📦 Compra recebida:', {
          productId: purchase.productId,
          transactionId: purchase.transactionId,
          transactionDate: purchase.transactionDate,
        });

        try {
          // Finaliza a transação
          await this.finishPurchase(purchase);
          log.success('✅ Compra finalizada com sucesso!');

          // Alerta de sucesso
          Alert.alert(
            'Assinatura Ativada! 🎉',
            'Seu plano foi ativado com sucesso. Aproveite todos os recursos premium!',
            [{ text: 'OK' }]
          );
        } catch (error: any) {
          log.error('Erro ao finalizar compra:', error?.message || error);
        }
      }
    );

    // Listener de erro de compra
    this.purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        log.error('❌ Erro na compra:', {
          code: error.code,
          message: error.message,
          responseCode: error.responseCode,
        });

        // Traduz códigos de erro comuns
        this.handlePurchaseError(error);
      }
    );

    log.success('Listeners de compra configurados');
  }

  /**
   * ✅ Traduz e trata erros de compra
   */
  private handlePurchaseError(error: PurchaseError): void {
    const errorMessages: Record<string, string> = {
      'E_USER_CANCELLED': 'Compra cancelada pelo usuário',
      'E_DEVELOPER_ERROR': 'Erro de configuração do desenvolvedor',
      'E_ITEM_UNAVAILABLE': 'Item não disponível',
      'E_SERVICE_DISCONNECTED': 'Serviço do Google Play desconectado',
      'E_NETWORK_ERROR': 'Erro de conexão com a internet',
      'E_ALREADY_OWNED': 'Você já possui este item',
      'E_ITEM_NOT_OWNED': 'Você não possui este item',
      'E_ITEM_ALREADY_OWNED': 'Item já adquirido',
    };

    const message = errorMessages[error.code] || `Erro desconhecido: ${error.message}`;

    log.error(`Erro de compra [${error.code}]:`, message);

    // Não mostra alerta se usuário cancelou
    if (error.code !== 'E_USER_CANCELLED') {
      Alert.alert('Erro na Compra', message);
    }
  }

  /**
   * ✅ Encerra conexão com Google Play Billing
   */
  async disconnect(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      // Remove listeners
      if (this.purchaseUpdateSubscription) {
        this.purchaseUpdateSubscription.remove();
        this.purchaseUpdateSubscription = null;
      }

      if (this.purchaseErrorSubscription) {
        this.purchaseErrorSubscription.remove();
        this.purchaseErrorSubscription = null;
      }

      // Encerra conexão
      if (endConnection) {
        await endConnection();
      }

      this.isInitialized = false;
      this.cachedSubscriptions.clear();

      log.success('Conexão com Google Play Billing encerrada');
    } catch (error: any) {
      log.error('Erro ao encerrar conexão:', error?.message || error);
    }
  }

  // ==========================================================================
  // 2. BUSCAR ASSINATURAS
  // ==========================================================================

  /**
   * ✅ Busca TODAS as assinaturas disponíveis no Google Play
   * IMPORTANTE: Usa getSubscriptions() - não fetchProducts()!
   */
  async getAllSubscriptions(): Promise<SubscriptionProduct[]> {
    if (!this.isInitialized) {
      log.warning('Billing não inicializado. Inicializando...');
      const success = await this.initBilling();
      if (!success) {
        log.error('Falha ao inicializar billing');
        return [];
      }
    }

    if (!getSubscriptions) {
      log.error('getSubscriptions não disponível');
      return [];
    }

    try {
      log.info('🔍 Buscando assinaturas no Google Play...');
      log.debug('Product IDs:', SUBSCRIPTION_PRODUCT_IDS);

      // ✅ USA getSubscriptions (não fetchProducts!)
      const subscriptions: Subscription[] = await getSubscriptions({
        skus: SUBSCRIPTION_PRODUCT_IDS,
      });

      log.success(`✅ ${subscriptions.length} produto(s) encontrado(s)!`);

      if (subscriptions.length === 0) {
        log.warning('⚠️ Nenhum produto encontrado. Verifique:');
        log.warning('1. Produtos existem no Google Play Console?');
        log.warning('2. Produtos estão ATIVOS (não Rascunho)?');
        log.warning('3. App está em trilha de teste?');
        log.warning('4. Usuário é testador autorizado?');
        log.warning('5. Product IDs estão corretos?');
        return [];
      }

      // Processa e enriquece cada assinatura com offerToken
      const enrichedSubscriptions = subscriptions.map((sub, index) => {
        log.debug(`\n📦 Produto ${index + 1}:`, {
          productId: sub.productId,
          title: sub.title,
          description: sub.description,
          price: (sub as any).localizedPrice || (sub as any).price,
        });

        // Extrai offer tokens dos base plans
        const enrichedSub = this.enrichSubscriptionWithOffers(sub);

        // Cache para uso posterior
        this.cachedSubscriptions.set(sub.productId, enrichedSub);

        return enrichedSub;
      });

      return enrichedSubscriptions;
    } catch (error: any) {
      log.error('❌ Erro ao buscar assinaturas:', error?.message || error);
      log.debug('Stack:', error?.stack);
      return [];
    }
  }

  /**
   * ✅ Enriquece assinatura com offerTokens dos base plans
   * CRUCIAL: Extrai offerToken de subscriptionOfferDetails
   */
  private enrichSubscriptionWithOffers(subscription: Subscription): SubscriptionProduct {
    const enriched = { ...subscription } as SubscriptionProduct;

    try {
      // subscriptionOfferDetails contém os base plans com offerTokens
      const offerDetails = (subscription as any).subscriptionOfferDetails;

      if (!offerDetails || !Array.isArray(offerDetails)) {
        log.warning(`Produto ${subscription.productId} sem subscriptionOfferDetails`);
        return enriched;
      }

      log.debug(`\n🎯 Produto ${subscription.productId} tem ${offerDetails.length} offer(s):`);

      offerDetails.forEach((offer: any, index: number) => {
        log.debug(`  Offer ${index + 1}:`, {
          basePlanId: offer.basePlanId,
          offerToken: offer.offerToken?.substring(0, 20) + '...',
          offerId: offer.offerId,
        });
      });

      // Armazena todos os offers para busca posterior
      (enriched as any).subscriptionOfferDetails = offerDetails;

    } catch (error: any) {
      log.error(`Erro ao processar offers para ${subscription.productId}:`, error?.message);
    }

    return enriched;
  }

  /**
   * ✅ Busca assinatura específica por ID de plano interno
   * @param planId - ID interno do plano (monthly, quarterly, annual)
   */
  async getSubscriptionProduct(planId: string): Promise<SubscriptionProduct | null> {
    const config = PLAN_CONFIG_MAP[planId];

    if (!config) {
      log.error(`❌ Plano interno "${planId}" não configurado`);
      log.debug('Planos disponíveis:', Object.keys(PLAN_CONFIG_MAP));
      return null;
    }

    log.info(`🔍 Buscando assinatura para plano: ${planId}`);
    log.debug('Configuração:', config);

    // Busca todas as assinaturas (usa cache se disponível)
    const allSubscriptions = await this.getAllSubscriptions();

    if (allSubscriptions.length === 0) {
      log.error('❌ Nenhuma assinatura disponível');
      return null;
    }

    // Encontra o produto específico
    const product = allSubscriptions.find(sub => sub.productId === config.productId);

    if (!product) {
      log.error(`❌ Produto não encontrado: ${config.productId}`);
      return null;
    }

    // Encontra o offerToken do base plan específico
    const offerDetails = (product as any).subscriptionOfferDetails;

    if (!offerDetails || !Array.isArray(offerDetails)) {
      log.error(`❌ Produto ${config.productId} sem offers disponíveis`);
      return null;
    }

    const offer = offerDetails.find((o: any) => o.basePlanId === config.basePlanId);

    if (!offer) {
      log.error(`❌ Base plan não encontrado: ${config.basePlanId}`);
      log.debug('Base plans disponíveis:', offerDetails.map((o: any) => o.basePlanId));
      return null;
    }

    if (!offer.offerToken) {
      log.error(`❌ Offer token não encontrado para base plan: ${config.basePlanId}`);
      return null;
    }

    // Retorna produto enriquecido com dados do plano específico
    const enrichedProduct: SubscriptionProduct = {
      ...product,
      offerToken: offer.offerToken,
      basePlanId: config.basePlanId,
    };

    log.success(`✅ Assinatura encontrada:`, {
      productId: enrichedProduct.productId,
      basePlanId: enrichedProduct.basePlanId,
      title: enrichedProduct.title,
      hasOfferToken: !!enrichedProduct.offerToken,
    });

    return enrichedProduct;
  }

  // ==========================================================================
  // 3. REALIZAR COMPRA
  // ==========================================================================

  /**
   * ✅ Realiza compra de assinatura
   * @param planId - ID interno do plano (monthly, quarterly, annual)
   */
  async purchaseSubscription(planId: string): Promise<PurchaseResult> {
    if (!this.isInitialized) {
      log.error('❌ Billing não inicializado');
      return { success: false, error: 'Billing não inicializado' };
    }

    if (!requestSubscription) {
      log.error('❌ requestSubscription não disponível');
      return { success: false, error: 'Método de compra não disponível' };
    }

    try {
      log.info(`🛒 Iniciando compra do plano: ${planId}`);

      // 1. Busca o produto com offerToken
      const product = await this.getSubscriptionProduct(planId);

      if (!product) {
        log.error(`❌ Produto não encontrado para plano: ${planId}`);
        return { success: false, error: 'Produto não encontrado' };
      }

      if (!product.offerToken) {
        log.error(`❌ Offer token não disponível para: ${planId}`);
        return { success: false, error: 'Offer token não disponível' };
      }

      log.info('📦 Produto encontrado, iniciando compra...');
      log.debug('Detalhes:', {
        productId: product.productId,
        basePlanId: product.basePlanId,
        offerToken: product.offerToken.substring(0, 20) + '...',
      });

      // 2. Solicita compra ao Google Play
      // ✅ Para Play Billing Library 6+, usa subscriptionOffers
      const purchaseResult = await requestSubscription({
        sku: product.productId,
        subscriptionOffers: [
          {
            sku: product.productId,
            offerToken: product.offerToken,
          },
        ],
      });

      log.success('✅ Compra solicitada com sucesso!');
      log.debug('Purchase result:', purchaseResult);

      // 3. Retorna resultado formatado para backend
      return this.formatPurchaseResult(purchaseResult, product.basePlanId);
    } catch (error: any) {
      log.error('❌ Erro ao realizar compra:', error?.message || error);
      log.debug('Erro completo:', error);

      return {
        success: false,
        error: error?.message || 'Erro desconhecido ao realizar compra',
      };
    }
  }

  /**
   * ✅ Formata resultado da compra para validação no backend
   */
  private formatPurchaseResult(
    purchase: SubscriptionPurchase | ProductPurchase,
    basePlanId?: string
  ): PurchaseResult {
    try {
      return {
        success: true,
        orderId: purchase.transactionId,
        purchaseToken: purchase.purchaseToken,
        productId: purchase.productId,
        basePlanId: basePlanId,
        transactionDate: purchase.transactionDate,
        acknowledged: (purchase as any).isAcknowledgedAndroid || false,
      };
    } catch (error: any) {
      log.error('Erro ao formatar resultado:', error?.message);
      return {
        success: false,
        error: 'Erro ao processar resultado da compra',
      };
    }
  }

  // ==========================================================================
  // 4. FINALIZAR TRANSAÇÃO
  // ==========================================================================

  /**
   * ✅ Finaliza transação (acknowledge) após validação
   * IMPORTANTE: Deve ser chamado após validar no backend
   */
  async finishPurchase(purchase: SubscriptionPurchase | ProductPurchase): Promise<boolean> {
    if (!finishTransaction) {
      log.error('❌ finishTransaction não disponível');
      return false;
    }

    try {
      log.info('🏁 Finalizando transação...');
      log.debug('Purchase:', {
        productId: purchase.productId,
        transactionId: purchase.transactionId,
      });

      await finishTransaction({ purchase, isConsumable: false });

      log.success('✅ Transação finalizada com sucesso!');
      return true;
    } catch (error: any) {
      log.error('❌ Erro ao finalizar transação:', error?.message || error);
      return false;
    }
  }

  // ==========================================================================
  // 5. RECUPERAR COMPRAS
  // ==========================================================================

  /**
   * ✅ Recupera todas as compras ativas do usuário
   * Útil para restaurar assinaturas
   */
  async getActivePurchases(): Promise<(SubscriptionPurchase | ProductPurchase)[]> {
    if (!this.isInitialized) {
      log.warning('Billing não inicializado. Inicializando...');
      const success = await this.initBilling();
      if (!success) {
        log.error('Falha ao inicializar billing');
        return [];
      }
    }

    if (!getAvailablePurchases) {
      log.error('❌ getAvailablePurchases não disponível');
      return [];
    }

    try {
      log.info('🔍 Buscando compras ativas...');

      const purchases = await getAvailablePurchases();

      log.success(`✅ ${purchases.length} compra(s) ativa(s) encontrada(s)`);

      purchases.forEach((purchase: any, index: number) => {
        log.debug(`\n📦 Compra ${index + 1}:`, {
          productId: purchase.productId,
          transactionId: purchase.transactionId,
          transactionDate: new Date(purchase.transactionDate).toLocaleString(),
          acknowledged: purchase.isAcknowledgedAndroid,
        });
      });

      return purchases;
    } catch (error: any) {
      log.error('❌ Erro ao buscar compras:', error?.message || error);
      return [];
    }
  }

  /**
   * ✅ Verifica se usuário tem assinatura ativa de um plano específico
   */
  async hasActiveSubscription(planId: string): Promise<boolean> {
    const config = PLAN_CONFIG_MAP[planId];

    if (!config) {
      log.error(`❌ Plano não configurado: ${planId}`);
      return false;
    }

    try {
      const purchases = await this.getActivePurchases();

      const hasActive = purchases.some(
        (purchase: any) => purchase.productId === config.productId
      );

      log.info(`Assinatura ativa para ${planId}:`, hasActive);
      return hasActive;
    } catch (error: any) {
      log.error('Erro ao verificar assinatura:', error?.message);
      return false;
    }
  }

  // ==========================================================================
  // 6. DIAGNÓSTICO E DEBUG
  // ==========================================================================

  /**
   * ✅ Executa diagnóstico completo do sistema de billing
   */
  async runDiagnostics(): Promise<void> {
    log.info('\n========================================');
    log.info('🔍 DIAGNÓSTICO GOOGLE PLAY BILLING');
    log.info('========================================\n');

    // 1. Verifica plataforma
    log.info('1️⃣ Plataforma:', Platform.OS);
    if (!IS_ANDROID) {
      log.warning('⚠️ Google Play Billing disponível apenas no Android');
      return;
    }

    // 2. Verifica react-native-iap
    log.info('2️⃣ react-native-iap:', RNIap ? '✅ Disponível' : '❌ Não disponível');
    if (!RNIap) {
      log.error('Execute: npx expo prebuild');
      return;
    }

    // 3. Verifica inicialização
    log.info('3️⃣ Status inicialização:', this.isInitialized ? '✅ Inicializado' : '❌ Não inicializado');

    // 4. Tenta inicializar se necessário
    if (!this.isInitialized) {
      log.info('4️⃣ Tentando inicializar...');
      const success = await this.initBilling();
      log.info('Resultado:', success ? '✅ Sucesso' : '❌ Falha');
      if (!success) return;
    }

    // 5. Busca assinaturas
    log.info('5️⃣ Buscando assinaturas...');
    const subscriptions = await this.getAllSubscriptions();
    log.info(`Resultado: ${subscriptions.length} produto(s) encontrado(s)`);

    // 6. Detalha cada produto
    if (subscriptions.length > 0) {
      log.info('\n6️⃣ Detalhes dos produtos:');
      subscriptions.forEach((sub, index) => {
        const offerDetails = (sub as any).subscriptionOfferDetails || [];
        log.info(`\n   📦 Produto ${index + 1}:`);
        log.info(`      Product ID: ${sub.productId}`);
        log.info(`      Título: ${sub.title}`);
        log.info(`      Descrição: ${sub.description}`);
        log.info(`      Base Plans: ${offerDetails.length}`);

        offerDetails.forEach((offer: any, i: number) => {
          log.info(`         ${i + 1}. ${offer.basePlanId} (token: ${offer.offerToken ? '✅' : '❌'})`);
        });
      });
    }

    // 7. Busca compras ativas
    log.info('\n7️⃣ Buscando compras ativas...');
    const purchases = await this.getActivePurchases();
    log.info(`Resultado: ${purchases.length} compra(s) ativa(s)`);

    log.info('\n========================================');
    log.info('✅ DIAGNÓSTICO COMPLETO');
    log.info('========================================\n');
  }

  // ==========================================================================
  // GETTERS
  // ==========================================================================

  get initialized(): boolean {
    return this.isInitialized;
  }

  get available(): boolean {
    return IS_ANDROID && !!RNIap;
  }

  // ==========================================================================
  // MÉTODOS DE COMPATIBILIDADE (para manter API existente)
  // ==========================================================================

  /**
   * Alias para initBilling (compatibilidade)
   */
  async initialize(): Promise<boolean> {
    return this.initBilling();
  }

  /**
   * Alias para getAllSubscriptions (compatibilidade)
   */
  async getAvailableSubscriptions(): Promise<SubscriptionProduct[]> {
    return this.getAllSubscriptions();
  }

  /**
   * Alias para runDiagnostics (compatibilidade)
   */
  async runCompleteDiagnostics(): Promise<void> {
    return this.runDiagnostics();
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

const googlePlayBillingService = new GooglePlayBillingService();

export default googlePlayBillingService;

// ============================================================================
// EXPORTS ADICIONAIS
// ============================================================================

export { SUBSCRIPTIONS, PLAN_CONFIG_MAP };
export type { SubscriptionProduct, PurchaseResult, SubscriptionConfig };
