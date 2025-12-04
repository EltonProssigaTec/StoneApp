/**
 * Serviço de Endereço (ViaCEP)
 * Baseado em: monitora_mobile/src/integrations/endereco.js
 */

import { apiFree } from './api.config';

export interface Endereco {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

export const EnderecoService = {
  /**
   * Busca endereço pelo CEP usando API ViaCEP
   * @param cep - CEP com 8 dígitos (apenas números)
   * @returns Dados do endereço ou undefined se não encontrado
   */
  getByCep: async (cep: string): Promise<Endereco | undefined> => {
    // Remove caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      if (__DEV__) console.warn('[EnderecoService] CEP inválido:', cep);
      return undefined;
    }

    try {
      const { data } = await apiFree.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);

      // ViaCEP retorna { erro: true } quando o CEP não existe
      if (data && !data.erro) {
        if (__DEV__) console.log('[EnderecoService] Endereço encontrado:', data.localidade);
        return data;
      }

      if (__DEV__) console.warn('[EnderecoService] CEP não encontrado:', cepLimpo);
      return undefined;
    } catch (error: any) {
      if (__DEV__) console.error('[EnderecoService] Erro ao buscar CEP:', error.message);
      return undefined;
    }
  },
};
