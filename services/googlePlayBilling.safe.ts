/**
 * Google Play Billing - SAFE WRAPPER
 * Versão simplificada sem crashes
 */

import { Platform } from 'react-native';

// Import seguro do módulo principal
let billingModule: any = null;

try {
  billingModule = require('./googlePlayBilling');
} catch (error) {
  console.error('[SafeBilling] ❌ Erro ao importar módulo principal:', error);
}

// Wrapper seguro que nunca vai crashar
const safeGooglePlayBilling = {
  // Verifica se está disponível
  get available(): boolean {
    return Platform.OS === 'android' && billingModule && billingModule.default;
  },

  // Verifica se está inicializado
  get initialized(): boolean {
    if (!this.available) return false;
    try {
      return billingModule.default.initialized || false;
    } catch {
      return false;
    }
  },

  // Inicializa billing
  async initBilling(): Promise<boolean> {
    if (!this.available) {
      console.warn('[SafeBilling] ⚠️ Google Play Billing não disponível');
      return false;
    }

    try {
      return await billingModule.default.initBilling();
    } catch (error: any) {
      console.error('[SafeBilling] ❌ Erro ao inicializar:', error);
      return false;
    }
  },

  // Alias para compatibilidade
  async initialize(): Promise<boolean> {
    return this.initBilling();
  },

  // Busca todas assinaturas
  async getAllSubscriptions(): Promise<any[]> {
    if (!this.available) return [];

    try {
      return await billingModule.default.getAllSubscriptions();
    } catch (error: any) {
      console.error('[SafeBilling] ❌ Erro ao buscar assinaturas:', error);
      return [];
    }
  },

  // Alias para compatibilidade
  async getAvailableSubscriptions(): Promise<any[]> {
    return this.getAllSubscriptions();
  },

  // Busca assinatura específica
  async getSubscriptionProduct(planId: string): Promise<any | null> {
    if (!this.available) return null;

    try {
      return await billingModule.default.getSubscriptionProduct(planId);
    } catch (error: any) {
      console.error('[SafeBilling] ❌ Erro ao buscar produto:', error);
      return null;
    }
  },

  // Compra assinatura
  async purchaseSubscription(planId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.available) {
      return { success: false, error: 'Google Play Billing não disponível' };
    }

    try {
      return await billingModule.default.purchaseSubscription(planId);
    } catch (error: any) {
      console.error('[SafeBilling] ❌ Erro ao comprar:', error);
      return { success: false, error: error?.message || 'Erro desconhecido' };
    }
  },

  // Finaliza transação
  async finishPurchase(purchase: any): Promise<boolean> {
    if (!this.available) return false;

    try {
      return await billingModule.default.finishPurchase(purchase);
    } catch (error: any) {
      console.error('[SafeBilling] ❌ Erro ao finalizar:', error);
      return false;
    }
  },

  // Busca compras ativas
  async getActivePurchases(): Promise<any[]> {
    if (!this.available) return [];

    try {
      return await billingModule.default.getActivePurchases();
    } catch (error: any) {
      console.error('[SafeBilling] ❌ Erro ao buscar compras:', error);
      return [];
    }
  },

  // Verifica assinatura ativa
  async hasActiveSubscription(planId: string): Promise<boolean> {
    if (!this.available) return false;

    try {
      return await billingModule.default.hasActiveSubscription(planId);
    } catch (error: any) {
      console.error('[SafeBilling] ❌ Erro ao verificar assinatura:', error);
      return false;
    }
  },

  // Diagnóstico
  async runDiagnostics(): Promise<void> {
    if (!this.available) {
      console.log('[SafeBilling] ℹ️ Google Play Billing não disponível');
      console.log('[SafeBilling] ℹ️ Platform:', Platform.OS);
      console.log('[SafeBilling] ℹ️ Módulo carregado:', !!billingModule);
      console.log('[SafeBilling] ℹ️ Export default:', !!billingModule?.default);
      return;
    }

    try {
      await billingModule.default.runDiagnostics();
    } catch (error: any) {
      console.error('[SafeBilling] ❌ Erro ao executar diagnóstico:', error);
    }
  },

  // Alias para compatibilidade
  async runCompleteDiagnostics(): Promise<void> {
    return this.runDiagnostics();
  },

  // Desconecta
  async disconnect(): Promise<void> {
    if (!this.available) return;

    try {
      await billingModule.default.disconnect();
    } catch (error: any) {
      console.error('[SafeBilling] ❌ Erro ao desconectar:', error);
    }
  },
};

// Exports
export default safeGooglePlayBilling;

// Re-export constantes se disponíveis
export const SUBSCRIPTIONS = billingModule?.SUBSCRIPTIONS || {};
export const PLAN_CONFIG_MAP = billingModule?.PLAN_CONFIG_MAP || {};
