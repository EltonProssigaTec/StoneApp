/**
 * Serviço de Pagamentos Juno (PIX)
 * Baseado em: monitora_mobile/src/integrations/index.js
 */

import { apiFree } from './api.config';

const URL_JUNO_TOKEN = 'https://api.stoneup.com.br/gerartokenjuno';
const URL_BASE_API_JUNO = 'https://api.juno.com.br';
const URL_QR_CODE = `${URL_BASE_API_JUNO}/pix/qrcodes/static`;
const URL_GET_STATUS_PAGAMENTO = `${URL_BASE_API_JUNO}/charges/`;

// Token fixo para API Juno (X-Resource-Token)
const JUNO_RESOURCE_TOKEN = '8F25D14E08018EB979ACF26222890B4FBD48D47DC2EB603B3E3A83EC9A74654D';

export interface JunoQRCodeData {
  amount: number;
  description?: string;
  reference?: string;
  [key: string]: any;
}

export interface JunoConfig {
  headers: {
    Authorization: string;
    'X-Resource-Token': string;
    'X-API-Version': string;
    'Content-Type': string;
  };
}

export const JunoService = {
  /**
   * Obtém token de autenticação da API Juno
   */
  getToken: async (): Promise<string> => {
    try {
      const response = await apiFree.get(URL_JUNO_TOKEN);

      if (__DEV__) console.log('[JunoService] Token obtido com sucesso');

      return response.data;
    } catch (error: any) {
      if (__DEV__) console.error('[JunoService] Erro ao obter token:', error.message);
      throw error;
    }
  },

  /**
   * Monta configuração de headers para requisições Juno
   */
  getConfig: async (): Promise<JunoConfig> => {
    const token = await JunoService.getToken();

    const config: JunoConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Resource-Token': JUNO_RESOURCE_TOKEN,
        'X-API-Version': '2',
        'Content-Type': 'application/json',
      },
    };

    return config;
  },

  /**
   * Gera QR Code PIX para pagamento
   */
  getResponseQRCode: async (data: JunoQRCodeData): Promise<any> => {
    try {
      const config = await JunoService.getConfig();

      if (__DEV__) console.log('[JunoService] Gerando QR Code PIX...');

      const response = await apiFree.post(URL_QR_CODE, data, config);

      if (__DEV__) console.log('[JunoService] QR Code gerado com sucesso');

      return response.data;
    } catch (error: any) {
      if (__DEV__) console.error('[JunoService] Erro ao gerar QR Code:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Verifica status do pagamento
   */
  postStatusPagamento: async (chargeId: string): Promise<any> => {
    try {
      const config = await JunoService.getConfig();
      const url = `${URL_GET_STATUS_PAGAMENTO}${chargeId}`;

      if (__DEV__) console.log('[JunoService] Verificando status do pagamento:', chargeId);

      const response = await apiFree.get(url, config);

      if (__DEV__) console.log('[JunoService] Status obtido:', response.data);

      return response.data;
    } catch (error: any) {
      if (__DEV__) console.error('[JunoService] Erro ao verificar status:', error.response?.data || error.message);
      throw error;
    }
  },
};

// Exporta URLs para uso externo se necessário
export const JunoURLs = {
  URL_JUNO_TOKEN,
  URL_BASE_API_JUNO,
  URL_QR_CODE,
  URL_GET_STATUS_PAGAMENTO,
};
