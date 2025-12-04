/**
 * Google Play Billing Service
 * Gerencia assinaturas via Google Play In-App Purchases
 *
 * Baseado no projeto antecessor com react-native-iap
 *
 * ⚠️ IMPORTANTE: react-native-iap NÃO funciona no Expo Go!
 * Precisa de:
 * - npx expo prebuild
 * - eas build
 * - ou development build
 */

import { Platform, Alert } from 'react-native';
import subscriptionService from './subscription';

// Import condicional para evitar erro no Expo Go
let RNIap: any = null;
let initConnection: any = null;
let endConnection: any = null;
let getSubscriptions: any = null;
let requestSubscription: any = null;
let finishTransaction: any = null;
let purchaseUpdatedListener: any = null;
let purchaseErrorListener: any = null;

try {
  // Tenta importar react-native-iap (só funciona em builds nativos)
  RNIap = require('react-native-iap');
  initConnection = RNIap.initConnection;
  endConnection = RNIap.endConnection;
  getSubscriptions = RNIap.getSubscriptions;
  requestSubscription = RNIap.requestSubscription;
  finishTransaction = RNIap.finishTransaction;
  purchaseUpdatedListener = RNIap.purchaseUpdatedListener;
  purchaseErrorListener = RNIap.purchaseErrorListener;
} catch (error) {
  if (__DEV__) {
    console.warn('[GooglePlay] react-native-iap não disponível (Expo Go não suportado)');
    console.warn('[GooglePlay] Para usar Google Play IAP, faça build nativo com: npx expo prebuild');
  }
}

/**
 * SKUs dos produtos configurados no Google Play Console
 *
 * IMPORTANTE: Configure estes produtos no Play Console:
 * https://play.google.com/console -> Seu App -> Monetização -> Produtos
 */
export const SUBSCRIPTION_SKUS = Platform.select({
  android: [
    'br.com.stoneup.monitora.app.monitora',      // Plano Mensal - R$ 14,99/mês
    'br.com.stoneup.monitora.app.stoneupplus',   // Plano Anual - R$ 59,99/ano
  ],
  default: [],
}) as string[];

/**
 * Mapeia os SKUs do Google Play para os IDs dos planos internos
 */
const SKU_TO_PLAN_ID: Record<string, string> = {
  'br.com.stoneup.monitora.app.monitora': 'monthly',
  'br.com.stoneup.monitora.app.stoneupplus': 'annual',
};

// Types para evitar erros de import
type ProductPurchase = any;
type Subscription = any;
type PurchaseError = any;

interface GooglePlayPurchaseResult {
  success: boolean;
  productId?: string;
  purchaseToken?: string;
  transactionId?: string;
  error?: string;
}

class GooglePlayBillingService {
  private purchaseUpdateSubscription: any;
  private purchaseErrorSubscription: any;
  private isInitialized = false;

  /**
   * Inicializa a conexão com o Google Play Billing
   * Deve ser chamado ao abrir a tela de checkout/planos
   */
  async initialize(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.log('[GooglePlay] Disponível apenas no Android');
      return false;
    }

    if (!initConnection) {
      if (__DEV__) {
        console.warn('[GooglePlay] react-native-iap não disponível (usando Expo Go)');
      }
      return false;
    }

    try {
      console.log('[GooglePlay] Inicializando conexão...');
      const result = await initConnection();
      console.log('[GooglePlay] Conexão estabelecida:', result);

      this.isInitialized = true;

      // Configura listeners para atualizações de compra
      this.setupPurchaseListeners();

      return true;
    } catch (error) {
      console.error('[GooglePlay] Erro ao inicializar:', error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Finaliza a conexão com o Google Play Billing
   * Deve ser chamado ao sair da tela de checkout
   */
  async disconnect(): Promise<void> {
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

      // Finaliza conexão (só se estiver disponível)
      if (endConnection && this.isInitialized) {
        await endConnection();
        this.isInitialized = false;
        console.log('[GooglePlay] Conexão encerrada');
      }
    } catch (error) {
      if (__DEV__) console.error('[GooglePlay] Erro ao desconectar:', error);
    }
  }

  /**
   * Busca os produtos disponíveis no Google Play
   * Retorna lista com preços, descrições, etc.
   */
  async getAvailableSubscriptions(): Promise<Subscription[]> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) return [];
    }

    try {
      console.log('[GooglePlay] Buscando assinaturas:', SUBSCRIPTION_SKUS);
      const subscriptions = await getSubscriptions({ skus: SUBSCRIPTION_SKUS });
      console.log('[GooglePlay] Assinaturas encontradas:', subscriptions);
      return subscriptions;
    } catch (error) {
      console.error('[GooglePlay] Erro ao buscar produtos:', error);
      return [];
    }
  }

  /**
   * Inicia o fluxo de compra de uma assinatura
   *
   * @param sku - ID do produto no Google Play (ex: 'monitora_mensal')
   * @returns Resultado da compra
   */
  async purchaseSubscription(sku: string): Promise<GooglePlayPurchaseResult> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        return {
          success: false,
          error: 'Não foi possível conectar ao Google Play',
        };
      }
    }

    try {
      console.log('[GooglePlay] Iniciando compra:', sku);

      // Inicia o fluxo de compra (abre dialog do Google Play)
      await requestSubscription({ sku });

      // O resultado virá pelo listener purchaseUpdatedListener
      // Retornamos sucesso aqui apenas para indicar que o fluxo iniciou
      return {
        success: true,
        productId: sku,
      };
    } catch (error: any) {
      console.error('[GooglePlay] Erro ao comprar:', error);

      let errorMessage = 'Erro ao processar compra';
      if (error.code === 'E_USER_CANCELLED') {
        errorMessage = 'Compra cancelada pelo usuário';
      } else if (error.code === 'E_ALREADY_OWNED') {
        errorMessage = 'Você já possui esta assinatura';
      } else if (error.code === 'E_NETWORK_ERROR') {
        errorMessage = 'Erro de conexão. Verifique sua internet';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Configura listeners para atualizações de compra
   * Chamado automaticamente pelo initialize()
   */
  private setupPurchaseListeners(): void {
    // Listener para compras bem-sucedidas
    this.purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: ProductPurchase) => {
        console.log('[GooglePlay] Compra atualizada:', purchase);

        const receipt = purchase.transactionReceipt;
        if (receipt) {
          try {
            // 1. Valida o recibo com seu backend
            await this.validatePurchaseWithBackend(purchase);

            // 2. Ativa a assinatura localmente
            const planId = SKU_TO_PLAN_ID[purchase.productId];
            if (planId) {
              await subscriptionService.activateGooglePlaySubscription(
                planId,
                purchase.productId,
                purchase.purchaseToken || '',
                purchase.transactionId || ''
              );
            }

            // 3. Finaliza a transação (confirma para o Google Play)
            await finishTransaction({ purchase, isConsumable: false });

            console.log('[GooglePlay] Compra finalizada com sucesso!');

            Alert.alert(
              'Assinatura Ativada! 🎉',
              'Seu plano foi ativado com sucesso. Aproveite todos os recursos premium!',
              [{ text: 'OK' }]
            );
          } catch (error) {
            console.error('[GooglePlay] Erro ao processar compra:', error);
            Alert.alert(
              'Erro na Ativação',
              'Sua compra foi processada, mas houve um erro ao ativar. Entre em contato com o suporte.',
              [{ text: 'OK' }]
            );
          }
        }
      }
    );

    // Listener para erros de compra
    this.purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        console.error('[GooglePlay] Erro na compra:', error);

        if (error.code !== 'E_USER_CANCELLED') {
          Alert.alert(
            'Erro no Pagamento',
            error.message || 'Não foi possível processar sua compra. Tente novamente.',
            [{ text: 'OK' }]
          );
        }
      }
    );
  }

  /**
   * Valida a compra com o backend
   *
   * IMPORTANTE: Implemente este endpoint no backend para segurança!
   * O backend deve validar o recibo com a Google Play Developer API
   *
   * Endpoint sugerido: POST /monitora/assinaturas/validate-google-play
   * Body: { productId, purchaseToken, packageName }
   */
  private async validatePurchaseWithBackend(purchase: ProductPurchase): Promise<void> {
    try {
      // TODO: Implementar chamada ao backend
      //
      // const response = await api.post('/monitora/assinaturas/validate-google-play', {
      //   productId: purchase.productId,
      //   purchaseToken: purchase.purchaseToken,
      //   packageName: purchase.packageName,
      //   transactionId: purchase.transactionId,
      // });
      //
      // if (!response.data.valid) {
      //   throw new Error('Compra inválida');
      // }

      console.log('[GooglePlay] Validação com backend (mock) - OK');

      // Por enquanto, apenas log em desenvolvimento
      if (__DEV__) {
        console.log('[GooglePlay] ⚠️ ATENÇÃO: Validação com backend não implementada!');
        console.log('[GooglePlay] Em produção, SEMPRE valide compras no backend!');
      }
    } catch (error) {
      console.error('[GooglePlay] Erro ao validar com backend:', error);
      throw error;
    }
  }

  /**
   * Verifica se o usuário tem assinaturas ativas no Google Play
   * Útil para restaurar compras ao fazer login
   */
  async checkActiveSubscriptions(): Promise<Subscription[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const subscriptions = await getSubscriptions({ skus: SUBSCRIPTION_SKUS });

      // Filtra apenas as assinaturas ativas
      // (você pode implementar lógica adicional de verificação aqui)
      return subscriptions;
    } catch (error) {
      console.error('[GooglePlay] Erro ao verificar assinaturas:', error);
      return [];
    }
  }
}

// Exporta instância única (singleton)
export default new GooglePlayBillingService();
