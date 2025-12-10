/**
 * Serviço de Busca
 * Busca de CPF/CNPJ e empresas
 * Baseado nos endpoints do APK antigo
 */

import api from './api.config';

export interface BuscaEmpresaResult {
  id: string;
  razao_social?: string;
  nome_fantasia?: string;
  cnpj?: string;
  cpf?: string;
  dividas?: any[];
  [key: string]: any;
}

export interface BuscaDividaResult {
  id: string;
  valor: number;
  descricao?: string;
  empresa?: BuscaEmpresaResult;
  [key: string]: any;
}

export const BuscaService = {
  /**
   * ⭐ BUSCAR POR CPF/CNPJ - Busca negativados (empresas/pessoas com dívidas)
   * Endpoint: POST /monitora/searchNegativados/:cpfCnpj
   *
   * @param cpfCnpj - CPF ou CNPJ (apenas números)
   * @returns Lista de resultados encontrados
   */
  buscarPorCpfCnpj: async (cpfCnpj: string): Promise<BuscaEmpresaResult[]> => {
    try {
      // Remover formatação (pontos, traços, barras)
      const cpfCnpjLimpo = cpfCnpj.replace(/[^\d]/g, '');

      if (__DEV__) {
        console.log('[BuscaService] Buscando por CPF/CNPJ:', cpfCnpjLimpo);
      }

      const response = await api.post(`monitora/searchNegativados/${cpfCnpjLimpo}`);

      if (response.data && Array.isArray(response.data.data)) {
        if (__DEV__) {
          console.log('[BuscaService] ✅ Resultados encontrados:', response.data.data.length);
        }
        return response.data.data;
      }

      if (__DEV__) console.log('[BuscaService] ℹ️ Nenhum resultado encontrado');
      return [];
    } catch (error: any) {
      if (__DEV__) {
        console.error('[BuscaService] ❌ Erro ao buscar por CPF/CNPJ:', error.response?.data || error.message);
      }
      return [];
    }
  },

  /**
   * Buscar dívidas
   * Endpoint: POST /monitora/searchDividas
   *
   * @param filtros - Filtros de busca
   * @returns Lista de dívidas encontradas
   */
  buscarDividas: async (filtros: any): Promise<BuscaDividaResult[]> => {
    try {
      if (__DEV__) console.log('[BuscaService] Buscando dívidas com filtros:', filtros);

      const response = await api.post('monitora/searchDividas', filtros);

      if (response.data && Array.isArray(response.data.data)) {
        if (__DEV__) {
          console.log('[BuscaService] ✅ Dívidas encontradas:', response.data.data.length);
        }
        return response.data.data;
      }

      if (__DEV__) console.log('[BuscaService] ℹ️ Nenhuma dívida encontrada');
      return [];
    } catch (error: any) {
      if (__DEV__) {
        console.error('[BuscaService] ❌ Erro ao buscar dívidas:', error.response?.data || error.message);
      }
      return [];
    }
  },

  /**
   * Consultar empresas por CNPJ do credor
   * Endpoint: POST /monitora/consult_empresas_cnpjCredor
   *
   * @param cnpjCredor - CNPJ do credor
   * @returns Lista de empresas/pessoas que devem ao credor
   */
  consultarEmpresasPorCredor: async (cnpjCredor: string): Promise<BuscaEmpresaResult[]> => {
    try {
      const cnpjLimpo = cnpjCredor.replace(/[^\d]/g, '');

      if (__DEV__) {
        console.log('[BuscaService] Consultando empresas por credor:', cnpjLimpo);
      }

      const response = await api.post('monitora/consult_empresas_cnpjCredor', {
        cnpj_credor: cnpjLimpo
      });

      if (response.data && Array.isArray(response.data.data)) {
        if (__DEV__) {
          console.log('[BuscaService] ✅ Empresas encontradas:', response.data.data.length);
        }
        return response.data.data;
      }

      if (__DEV__) console.log('[BuscaService] ℹ️ Nenhuma empresa encontrada');
      return [];
    } catch (error: any) {
      if (__DEV__) {
        console.error('[BuscaService] ❌ Erro ao consultar empresas por credor:', error.response?.data || error.message);
      }
      return [];
    }
  },

  /**
   * Obter detalhes de uma dívida específica
   * Endpoint: POST /monitora/getDivida
   *
   * @param dividaId - ID da dívida
   * @returns Detalhes da dívida
   */
  getDivida: async (dividaId: string): Promise<BuscaDividaResult | undefined> => {
    try {
      if (__DEV__) console.log('[BuscaService] Obtendo detalhes da dívida:', dividaId);

      const response = await api.post('monitora/getDivida', {
        id: dividaId
      });

      if (response.data && response.data.data) {
        if (__DEV__) console.log('[BuscaService] ✅ Detalhes da dívida obtidos');
        return response.data.data;
      }

      if (__DEV__) console.log('[BuscaService] ℹ️ Dívida não encontrada');
      return undefined;
    } catch (error: any) {
      if (__DEV__) {
        console.error('[BuscaService] ❌ Erro ao obter dívida:', error.response?.data || error.message);
      }
      return undefined;
    }
  },

  /**
   * Obter detalhes de dívida de uma empresa específica
   * Endpoint: POST /monitora/getEmpresaDivida
   *
   * @param empresaId - ID da empresa
   * @returns Dívidas da empresa
   */
  getEmpresaDivida: async (empresaId: string): Promise<BuscaDividaResult[]> => {
    try {
      if (__DEV__) console.log('[BuscaService] Obtendo dívidas da empresa:', empresaId);

      const response = await api.post('monitora/getEmpresaDivida', {
        id: empresaId
      });

      if (response.data && Array.isArray(response.data.data)) {
        if (__DEV__) {
          console.log('[BuscaService] ✅ Dívidas da empresa obtidas:', response.data.data.length);
        }
        return response.data.data;
      }

      if (__DEV__) console.log('[BuscaService] ℹ️ Nenhuma dívida encontrada para a empresa');
      return [];
    } catch (error: any) {
      if (__DEV__) {
        console.error('[BuscaService] ❌ Erro ao obter dívidas da empresa:', error.response?.data || error.message);
      }
      return [];
    }
  },
};
