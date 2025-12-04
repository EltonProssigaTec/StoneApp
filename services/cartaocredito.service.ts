/**
 * Serviço de Cartão de Crédito
 * Baseado em: monitora_mobile/src/integrations/cartaocredito.js
 */

import api from './api.config';

export interface Cartao {
  expiration_month: number;
  expiration_year: number;
  first_six_digits: string;
  last_four_digits: string;
  issuer: {
    id: number;
    name: string;
  };
  payment_method: {
    thumbnail: string;
    secure_thumbnail: string;
  };
  expiration: string; // Formato: MM/YY
}

export interface CartaoInput {
  numeroCartao: string;
  mesExpiracao: string;
  anoExpiracao: string;
  nomeTitular: string;
  cvv: string;
  cpf_cnpj?: string;
}

export interface PlanoSelecionado {
  id: string;
  nome: string;
  valor: number;
}

export interface AssinaturaResponse {
  message: string;
  card_token?: string;
  error?: string;
}

/**
 * Formata a resposta do backend para o formato de Cartao
 */
const formatarBuscarCartao = (response: any[]): Cartao | undefined => {
  if (response[0]) {
    const data = response[0];
    const {
      expiration_month,
      expiration_year,
      first_six_digits,
      last_four_digits,
      issuer,
      payment_method,
    } = data;

    const month = (expiration_month + '').padStart(2, '0');
    const cartao: Cartao = {
      expiration_month,
      expiration_year,
      first_six_digits,
      last_four_digits,
      issuer,
      payment_method,
      expiration: `${month}/${(expiration_year + '').substr(2)}`,
    };

    return cartao;
  }

  return undefined;
};

export const CartaoCreditoService = {
  /**
   * Busca cartão cadastrado do usuário
   */
  buscarCartao: async (userId: string): Promise<Cartao | undefined> => {
    try {
      const urlPost = 'monitora/buscarCartao';
      const body = { userId };

      if (__DEV__) console.log('[CartaoService] Buscando cartão...');

      const response = await api.post(urlPost, body);

      if (__DEV__) console.log('[CartaoService] Cartão encontrado:', response.data);

      const cartaoFormatado = formatarBuscarCartao(response.data);
      return cartaoFormatado;
    } catch (error: any) {
      if (__DEV__) console.error('[CartaoService] Erro ao buscar cartão:', error.response?.data || error.message);
      return undefined;
    }
  },

  /**
   * Escolhe plano e cadastra cartão (fluxo completo)
   */
  escolherPlano: async (
    userId: string,
    planoSelected: PlanoSelecionado,
    cartao: CartaoInput
  ): Promise<[AssinaturaResponse | undefined, string | undefined]> => {
    const body = {
      idUser: userId,
      numero_cartao: cartao.numeroCartao,
      data_expiracao_mes: cartao.mesExpiracao,
      data_expiracao_ano: cartao.anoExpiracao,
      nome_titular: cartao.nomeTitular,
      codigo_seguranca: cartao.cvv,
      idPlano: planoSelected.id,
      cpf_cnpj: cartao.cpf_cnpj,
    };

    if (__DEV__) console.log('[CartaoService] Escolher plano, body:', body);

    try {
      const response = await api.post('monitora/assinar_plano_fluxo_full', body);

      if (__DEV__) console.log('[CartaoService] Resposta assinar_plano_fluxo_full:', response.data);

      return [response.data, undefined];
    } catch (error: any) {
      if (__DEV__) console.error('[CartaoService] Erro ao escolher plano:', error.response?.data || error.message);

      const errorData = error?.response?.data;
      const errorMsg =
        errorData?.body || errorData?.error?.message || errorData?.error ||
        'Falha na atualização. Verifique a permissão de uso virtual do cartão.';

      return [undefined, errorMsg];
    }
  },

  /**
   * Assina plano quando já tem cartão cadastrado
   */
  inserirPlano: async (userId: string, planoSelected: PlanoSelecionado): Promise<any> => {
    const body = {
      idUser: userId,
      idPlano: planoSelected.id,
    };

    try {
      const response = await api.post('monitora/assinar_plano', body);

      if (__DEV__) console.log('[CartaoService] Resposta assinar_plano:', response.data);

      return response.data;
    } catch (error: any) {
      if (__DEV__) console.error('[CartaoService] Erro ao inserir plano:', error.response?.data || error.message);

      const errorData = error?.response?.data;
      const errorMsg = errorData?.error || 'Erro ao assinar plano';

      return {
        status: 400,
        message: errorMsg,
      };
    }
  },

  /**
   * Altera cartão de crédito cadastrado
   */
  alterarCartao: async (userId: string, cartao: CartaoInput): Promise<any> => {
    const body = {
      idUser: userId,
      numero_cartao: cartao.numeroCartao,
      data_expiracao_mes: cartao.mesExpiracao,
      data_expiracao_ano: cartao.anoExpiracao,
      nome_titular: cartao.nomeTitular,
      codigo_seguranca: cartao.cvv,
    };

    try {
      const response = await api.post('monitora/alterar-cartao', body);

      if (__DEV__) console.log('[CartaoService] Cartão alterado com sucesso');

      return response.data;
    } catch (error: any) {
      if (__DEV__) console.error('[CartaoService] Erro ao alterar cartão:', error.response?.data || error.message);
      throw error;
    }
  },
};
