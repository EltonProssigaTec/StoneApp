/**
 * Extensão do Serviço de Planos
 * Endpoints adicionais baseados no APK antigo
 */

import api from './api.config';

export interface InserirPlanoBody {
  idUser: string;
  idPlano: string;
  metodoPagamento: string;
  transactionId?: string;
  purchaseToken?: string;
  productId?: string;
  [key: string]: any;
}

export interface CupomBody {
  idUser: string;
  codigo: string;
}

export const PlanoServiceExtended = {
  /**
   * ⭐ CRIAR ASSINATURA - Endpoint principal para criar assinatura após pagamento
   * Endpoint: POST /monitora/inser_plano_user
   *
   * Este endpoint deve ser chamado após o pagamento bem-sucedido para registrar
   * a assinatura no backend.
   */
  inserirPlanoUser: async (body: InserirPlanoBody): Promise<any> => {
    try {
      if (__DEV__) {
        console.log('[PlanoServiceExtended] Inserindo plano para usuário:', {
          userId: body.idUser,
          planoId: body.idPlano,
          metodoPagamento: body.metodoPagamento,
        });
      }

      const response = await api.post('monitora/inser_plano_user', body);

      if (__DEV__) console.log('[PlanoServiceExtended] ✅ Assinatura criada com sucesso');

      return response.data;
    } catch (error: any) {
      if (__DEV__) {
        console.error('[PlanoServiceExtended] ❌ Erro ao inserir plano:', error.response?.data || error.message);
      }
      throw error;
    }
  },

  /**
   * Verifica se usuário tem plano ativo
   * Endpoint: POST /monitora/listar_plano_user
   *
   * @returns O plano ativo ou undefined se não tiver
   */
  verificarPlanoAtivo: async (userId: string): Promise<any | undefined> => {
    try {
      if (__DEV__) console.log('[PlanoServiceExtended] Verificando plano ativo para usuário:', userId);

      const response = await api.post('monitora/listar_plano_user', {
        idUser: userId
      });

      if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        const plano = response.data.data[0];

        if (__DEV__) {
          console.log('[PlanoServiceExtended] ✅ Plano ativo encontrado:', {
            id: plano.id,
            nome: plano.nome,
            status: plano.mp_status,
            ativo: plano.ativo,
          });
        }

        return plano;
      }

      if (__DEV__) console.log('[PlanoServiceExtended] ℹ️ Usuário não possui plano ativo');
      return undefined;
    } catch (error: any) {
      if (__DEV__) {
        console.error('[PlanoServiceExtended] ❌ Erro ao verificar plano ativo:', error.response?.data || error.message);
      }
      return undefined;
    }
  },

  /**
   * Usa cupom de desconto
   * Endpoint: POST /monitora/usarCupom
   */
  usarCupom: async (userId: string, codigoCupom: string): Promise<any> => {
    try {
      if (__DEV__) console.log('[PlanoServiceExtended] Aplicando cupom:', codigoCupom);

      const response = await api.post('monitora/usarCupom', {
        idUser: userId,
        codigo: codigoCupom,
      });

      if (__DEV__) console.log('[PlanoServiceExtended] ✅ Cupom aplicado com sucesso');

      return response.data;
    } catch (error: any) {
      if (__DEV__) {
        console.error('[PlanoServiceExtended] ❌ Erro ao usar cupom:', error.response?.data || error.message);
      }
      throw error;
    }
  },

  /**
   * Assina plano com fluxo completo
   * Endpoint: POST /monitora/assinar_plano_fluxo_full
   *
   * Este endpoint pode ser uma alternativa ao inser_plano_user
   * que faz todo o fluxo de assinatura de uma vez
   */
  assinarPlanoFluxoFull: async (body: any): Promise<any> => {
    try {
      if (__DEV__) console.log('[PlanoServiceExtended] Assinando plano (fluxo completo)');

      const response = await api.post('monitora/assinar_plano_fluxo_full', body);

      if (__DEV__) console.log('[PlanoServiceExtended] ✅ Assinatura concluída (fluxo completo)');

      return response.data;
    } catch (error: any) {
      if (__DEV__) {
        console.error('[PlanoServiceExtended] ❌ Erro no fluxo completo de assinatura:', error.response?.data || error.message);
      }
      throw error;
    }
  },
};
