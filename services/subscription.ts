/**
 * Serviço de Assinatura
 * Gerencia planos, pagamentos e verificação de status
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Plan {
  id: string;
  name: string;
  displayName: string;
  period: string;
  price: number;
  durationDays: number;
  badge?: {
    text: string;
    color?: string;
  };
}

export interface Subscription {
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  paymentMethod?: 'pix' | 'credit_card' | 'boleto' | 'google_play';
  amount: number;
  googlePlayData?: {
    productId: string;
    purchaseToken: string;
    transactionId: string;
  };
}

// Planos disponíveis
export const PLANS: Plan[] = [
  {
    id: 'annual',
    name: 'Monitora Ano',
    displayName: 'Anual',
    period: 'PLANO ANUAL',
    price: 59.99,
    durationDays: 365,
    badge: {
      text: 'MAIOR DESCONTO',
      color: '#FF9500',
    },
  },
  {
    id: 'quarterly',
    name: 'Monitora Trimestre',
    displayName: 'Trimestral',
    period: 'PLANO TRIMESTRAL',
    price: 34.99,
    durationDays: 90,
    badge: {
      text: 'MAIS POPULAR',
      color: '#FF9500',
    },
  },
  {
    id: 'monthly',
    name: 'Monitora Mês',
    displayName: 'Mensal',
    period: 'PLANO MENSAL',
    price: 14.99,
    durationDays: 30,
  },
];

class SubscriptionService {
  private readonly STORAGE_KEY = '@Subscription:data';

  /**
   * Busca a assinatura ativa do usuário
   */
  async getActiveSubscription(): Promise<Subscription | null> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!data) return null;

      const subscription: Subscription = JSON.parse(data);

      // Verifica se ainda está ativa
      const endDate = new Date(subscription.endDate);
      const now = new Date();

      if (now > endDate) {
        subscription.status = 'expired';
        await this.saveSubscription(subscription);
      }

      return subscription.status === 'active' ? subscription : null;
    } catch (error) {
      if (__DEV__) console.error('[Subscription] Erro ao buscar assinatura:', error);
      return null;
    }
  }

  /**
   * Verifica se o usuário tem assinatura ativa
   */
  async hasActiveSubscription(): Promise<boolean> {
    const subscription = await this.getActiveSubscription();
    return subscription !== null;
  }

  /**
   * Busca um plano pelo ID
   */
  getPlanById(planId: string): Plan | undefined {
    return PLANS.find(p => p.id === planId);
  }

  /**
   * Busca um plano pelo nome
   */
  getPlanByName(planName: string): Plan | undefined {
    return PLANS.find(p => p.name === planName);
  }

  /**
   * Salva a assinatura
   */
  private async saveSubscription(subscription: Subscription): Promise<void> {
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(subscription));
  }

  /**
   * Cria uma nova assinatura
   */
  async createSubscription(
    planId: string,
    paymentMethod: 'pix' | 'credit_card' | 'boleto'
  ): Promise<Subscription> {
    const plan = this.getPlanById(planId);
    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    const now = new Date();
    const endDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    const subscription: Subscription = {
      planId: plan.id,
      planName: plan.name,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      status: 'active',
      paymentMethod,
      amount: plan.price,
    };

    await this.saveSubscription(subscription);

    if (__DEV__) {
      console.log('[Subscription] Assinatura criada:', subscription);
    }

    return subscription;
  }

  /**
   * Cancela a assinatura ativa
   */
  async cancelSubscription(): Promise<void> {
    const subscription = await this.getActiveSubscription();
    if (subscription) {
      subscription.status = 'cancelled';
      await this.saveSubscription(subscription);

      if (__DEV__) {
        console.log('[Subscription] Assinatura cancelada');
      }
    }
  }

  /**
   * Formata o preço
   */
  formatPrice(price: number): string {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  /**
   * Formata a data
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  /**
   * Simula processamento de pagamento via PIX
   */
  async processPixPayment(planId: string): Promise<{ qrCode: string; qrCodeText: string }> {
    // Em produção, aqui você faria uma chamada para a API de pagamento
    // Por enquanto, vamos simular
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          qrCodeText: '00020126580014br.gov.bcb.pix0136' + Math.random().toString(36).substring(7),
        });
      }, 1000);
    });
  }

  /**
   * Simula processamento de pagamento via Cartão
   */
  async processCreditCardPayment(
    planId: string,
    cardData: {
      number: string;
      name: string;
      expiry: string;
      cvv: string;
    }
  ): Promise<{ transactionId: string }> {
    // Em produção, aqui você faria uma chamada para a API de pagamento
    // Por enquanto, vamos simular
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          transactionId: 'TXN-' + Date.now(),
        });
      }, 2000);
    });
  }

  /**
   * Ativa assinatura do Google Play
   * Chamado após validar a compra com sucesso
   */
  async activateGooglePlaySubscription(
    planId: string,
    productId: string,
    purchaseToken: string,
    transactionId: string
  ): Promise<Subscription> {
    const plan = this.getPlanById(planId);
    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    const now = new Date();
    const endDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    const subscription: Subscription = {
      planId: plan.id,
      planName: plan.name,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      status: 'active',
      paymentMethod: 'google_play',
      amount: plan.price,
      googlePlayData: {
        productId,
        purchaseToken,
        transactionId,
      },
    };

    await this.saveSubscription(subscription);

    if (__DEV__) {
      console.log('[Subscription] Assinatura Google Play ativada:', subscription);
    }

    return subscription;
  }
}

export default new SubscriptionService();
