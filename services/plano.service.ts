/**
 * Serviço de Planos
 * Baseado em: monitora_mobile/src/integrations/meuplano.js e selecionar-plano.js
 */

import api from './api.config';

export interface Plano {
  id: string;
  nome: string;
  valor: number;
  descricao?: string;
  mp_status?: string;
  ativo?: string;
}

export interface Desconto {
  id: string;
  descricao: string;
  valor: number;
  porcentagem?: number;
}

export interface PagamentoLojaBody {
  idUser: string;
  idPlano: string;
  loja: string;
  [key: string]: any;
}

export const PlanoService = {
  /**
   * Lista todos os planos disponíveis
   */
  listarPlanos: async (): Promise<Plano[]> => {
    const url = 'monitora/listar_planos';

    try {
      const { data } = await api.post(url);

      if (data && Array.isArray(data.data)) {
        if (__DEV__) console.log('[PlanoService] Planos encontrados:', data.data.length);
        return data.data;
      }

      return [];
    } catch (error: any) {
      if (__DEV__) console.error('[PlanoService] Erro ao listar planos:', error.response?.data || error.message);
      return [];
    }
  },

  /**
   * Busca plano do usuário
   */
  getPlano: async (userId: string): Promise<Plano | undefined> => {
    try {
      const urlPost = 'monitora/listar_plano_user';
      const body = { idUser: userId };

      const response = await api.post(urlPost, body);

      if (response && Array.isArray(response.data.data)) {
        const data = response.data.data[0];

        if (__DEV__) console.log('[PlanoService] Plano do usuário:', data);

        // Se o plano está autorizado, marca como ativo
        if (data && data.mp_status === 'authorized') {
          data.ativo = '1';
        }

        return data;
      }

      return undefined;
    } catch (error: any) {
      if (__DEV__) console.error('[PlanoService] Erro ao buscar plano do usuário:', error.response?.data || error.message);
      return undefined;
    }
  },

  /**
   * Busca descontos do plano
   */
  getDescontosFromPlano: async (planoId: string): Promise<Desconto[]> => {
    try {
      const urlPost = 'monitora/listar_descontos_plano_user';
      const body = { id_plano: planoId };

      const { data } = await api.post(urlPost, body);

      if (data && Array.isArray(data.data)) {
        if (__DEV__) console.log('[PlanoService] Descontos do plano:', data.data.length);
        return data.data;
      }

      return [];
    } catch (error: any) {
      if (__DEV__) console.error('[PlanoService] Erro ao buscar descontos do plano:', error.response?.data || error.message);
      return [];
    }
  },

  /**
   * Remove plano do usuário (cancelamento)
   */
  removerPlanoUser: async (userId: string): Promise<any> => {
    try {
      const response = await api.post('monitora/remover_plano_user', { idUser: userId });

      if (__DEV__) console.log('[PlanoService] Plano removido com sucesso');

      return response.data;
    } catch (error: any) {
      if (__DEV__) console.error('[PlanoService] Erro ao remover plano:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Altera plano do usuário
   */
  alterarPlano: async (userId: string, planoId: string): Promise<any> => {
    try {
      const response = await api.post('monitora/alterar-plano', {
        idUser: userId,
        plano: planoId,
      });

      if (__DEV__) console.log('[PlanoService] Plano alterado com sucesso');

      return response.data;
    } catch (error: any) {
      if (__DEV__) console.error('[PlanoService] Erro ao alterar plano:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Contrata plano via pagamento em loja física
   */
  contratarPlano: async (loja: string, body: PagamentoLojaBody): Promise<[any, undefined] | [undefined, string]> => {
    const url = `monitora/gravarpagamentoloja/${loja}`;

    if (__DEV__) console.log('[PlanoService] Contratando plano via loja:', loja);

    try {
      const response = await api.post(url, body);

      if (__DEV__) console.log('[PlanoService] Plano contratado com sucesso');

      return [response.data, undefined];
    } catch (error: any) {
      if (__DEV__) console.error('[PlanoService] Erro ao contratar plano:', error.response?.data || error.message);

      const errorData = error?.response?.data;
      const errorMsg =
        errorData?.body || errorData?.error?.message || errorData?.error ||
        'Falha na atualização. Verifique a permissão de uso virtual do cartão.';

      return [undefined, errorMsg];
    }
  },
};
