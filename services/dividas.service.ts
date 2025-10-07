/**
 * Serviço de Dívidas
 * Baseado em: monitora_mobile/src/integrations/dividas.js
 */

import api from './api.config';

export interface Divida {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: string;
  credor: string;
  // Adicione outros campos conforme necessário
}

export interface ResumoFinanceiro {
  total_dividas: number;
  quantidade_dividas: number;
  dividas_ativas: number;
  dividas_quitadas: number;
}

export const DividasService = {
  /**
   * Busca resumo financeiro (total de dívidas)
   */
  resumo: async (cpf: string): Promise<ResumoFinanceiro> => {
    try {
      const dividas = await DividasService.listar(cpf);
      const total = dividas.reduce((acc, div) => acc + (div.valor || 0), 0);

      return {
        total_dividas: total,
        quantidade_dividas: dividas.length,
        dividas_ativas: dividas.filter(d => d.status !== 'quitado').length,
        dividas_quitadas: dividas.filter(d => d.status === 'quitado').length,
      };
    } catch (error: any) {
      console.log('Erro ao buscar resumo:', error);
      return {
        total_dividas: 0,
        quantidade_dividas: 0,
        dividas_ativas: 0,
        dividas_quitadas: 0,
      };
    }
  },

  /**
   * Lista todas as dívidas de um CPF
   */
  listar: async (cpf: string): Promise<Divida[]> => {
    console.log('\n\nListando dívidas:\n');
    const url = `monitora/dividas/${cpf}`;
    console.log('\n\nGET url =', url);

    try {
      const response = await api.get(url);
      const dividas = response.data.data || [];
      console.log('\nDividas, length =', dividas.length);
      return dividas;
    } catch (error: any) {
      console.log('\nErro ao buscar dívidas:', error.response?.data || error.message);
      return [];
    }
  },

  /**
   * Busca dívidas por texto
   */
  search: async (cpf: string, text: string): Promise<Divida[]> => {
    const url = `monitora/searchDividas/${cpf}/${text}`;
    console.log('\n\n--------\nGET url =', url);

    try {
      const { data } = await api.get(url);

      if (!data) {
        return [];
      }

      if (data && Array.isArray(data.data)) {
        return data.data;
      }

      return [];
    } catch (error: any) {
      console.log('Erro ao fazer busca:', error.response?.data || error.message);
      return [];
    }
  },

  /**
   * Lista pré-dívidas de um usuário
   */
  listarPreDividas: async (userId: string): Promise<Divida[]> => {
    try {
      const { data } = await api.post('monitora/listarPreDividas', { userId });

      if (data && Array.isArray(data.data)) {
        return data.data;
      }

      return [];
    } catch (error: any) {
      console.log('Erro ao listar pré-dívidas:', error.response?.data || error.message);
      return [];
    }
  },
};