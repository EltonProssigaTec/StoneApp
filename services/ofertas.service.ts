/**
 * Serviço de Ofertas/Promoções
 *
 * Este serviço gerencia ofertas e promoções relacionadas aos descontos de planos
 * e negociações de dívidas com descontos especiais.
 */

import api from './api.config';

export interface Oferta {
  id: string;
  empresa: string;
  desconto_percentual: number;
  valor_original: number;
  valor_com_desconto: number;
  credor?: string;
  divida_id?: string;
  validade?: string;
  tipo?: 'plano' | 'divida' | 'promocao';
}

export interface OfertaDivida {
  id: string;
  credor: string;
  valor_original: number;
  valor_desconto: number;
  desconto_percentual: number;
  condicoes?: string;
  prazo_validade?: string;
}

export const OfertasService = {
  /**
   * Lista ofertas de descontos disponíveis para o usuário
   * Baseado nos descontos do plano
   */
  listarOfertas: async (userId: string): Promise<Oferta[]> => {
    try {
      // Primeiro busca o plano do usuário
      const planoResponse = await api.post('monitora/listar_plano_user', { idUser: userId });

      if (!planoResponse.data?.data?.[0]) {
        if (__DEV__) console.log('[OfertasService] Usuário sem plano ativo');
        return [];
      }

      const plano = planoResponse.data.data[0];

      // Busca os descontos do plano
      const descontosResponse = await api.post('monitora/listar_descontos_plano_user', {
        id_plano: plano.id,
      });

      if (!descontosResponse.data?.data) {
        return [];
      }

      // Converte descontos para formato de ofertas
      const ofertas: Oferta[] = descontosResponse.data.data.map((desconto: any) => ({
        id: desconto.id,
        empresa: desconto.nome_parceiro || desconto.descricao || 'Parceiro',
        desconto_percentual: desconto.porcentagem || 0,
        valor_original: 0,
        valor_com_desconto: 0,
        tipo: 'plano',
        validade: desconto.validade,
      }));

      if (__DEV__) console.log('[OfertasService] Ofertas encontradas:', ofertas.length);

      return ofertas;
    } catch (error: any) {
      if (__DEV__) console.error('[OfertasService] Erro ao listar ofertas:', error.response?.data || error.message);
      return [];
    }
  },

  /**
   * Lista ofertas específicas para dívidas com descontos promocionais
   */
  listarOfertasDividas: async (cpf_cnpj: string): Promise<OfertaDivida[]> => {
    try {
      // Busca dívidas do usuário
      const response = await api.get(`monitora/dividas/${cpf_cnpj}`);
      const dividas = response.data.data || [];

      // Filtra dívidas que possuem ofertas de desconto
      const ofertasDividas: OfertaDivida[] = dividas
        .filter((divida: any) => divida.desconto_disponivel || divida.oferta_ativa)
        .map((divida: any) => {
          const valorDesconto = divida.valor_desconto || divida.valor * 0.3; // 30% padrão
          const descontoPercentual = ((valorDesconto / divida.valor) * 100).toFixed(0);

          return {
            id: divida.id,
            credor: divida.credor,
            valor_original: divida.valor,
            valor_desconto: divida.valor - valorDesconto,
            desconto_percentual: Number(descontoPercentual),
            condicoes: divida.condicoes_oferta || 'Desconto especial',
            prazo_validade: divida.prazo_oferta,
          };
        });

      if (__DEV__) console.log('[OfertasService] Ofertas de dívidas:', ofertasDividas.length);

      return ofertasDividas;
    } catch (error: any) {
      if (__DEV__) console.error('[OfertasService] Erro ao listar ofertas de dívidas:', error.response?.data || error.message);
      return [];
    }
  },

  /**
   * Busca detalhes de uma oferta específica
   */
  getOfertaDetalhes: async (ofertaId: string): Promise<any> => {
    try {
      const response = await api.get(`monitora/oferta/${ofertaId}`);

      if (__DEV__) console.log('[OfertasService] Detalhes da oferta:', ofertaId);

      return response.data;
    } catch (error: any) {
      if (__DEV__) console.error('[OfertasService] Erro ao buscar oferta:', error.response?.data || error.message);
      return null;
    }
  },

  /**
   * Aceita uma oferta de desconto
   */
  aceitarOferta: async (ofertaId: string, userId: string): Promise<boolean> => {
    try {
      const response = await api.post('monitora/aceitar_oferta', {
        id_oferta: ofertaId,
        id_usuario: userId,
      });

      if (__DEV__) console.log('[OfertasService] Oferta aceita com sucesso');

      return response.data?.success || true;
    } catch (error: any) {
      if (__DEV__) console.error('[OfertasService] Erro ao aceitar oferta:', error.response?.data || error.message);
      return false;
    }
  },

  /**
   * Calcula desconto a partir de valores
   */
  calcularDesconto: (valorOriginal: number, valorComDesconto: number): number => {
    if (valorOriginal <= 0) return 0;
    const desconto = ((valorOriginal - valorComDesconto) / valorOriginal) * 100;
    return Math.round(desconto);
  },

  /**
   * Formata oferta para exibição
   */
  formatarOferta: (oferta: Oferta): string => {
    return `${oferta.desconto_percentual}% OFF - ${oferta.empresa}`;
  },
};
