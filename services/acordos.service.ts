/**
 * Serviço de Acordos/Títulos
 * Baseado em: monitora_mobile/src/pages/acordos/MeusAcordos/helper_acordo.js
 */

import api from './api.config';

export interface Titulo {
  id: string;
  name: string;
  cpf_cnpj: string;
  valor: number;
  data_vencimento: string;
  status: string; // '0' = Pendente, '10' = Processando, '1' = Pago
  juno_checkout?: string;
  documento?: string;
  protocolo?: string;
  valor_juros__app?: number;
  valor_multa__app?: number;
  valor_honorario?: number;
  valor_outros?: number;
  valor_monetario_diff_app?: number;
}

export interface CNPJTitulos {
  name: string;
  cpf_cnpj: string;
  opened: boolean;
  titulos: Titulo[];
}

export interface AcordoBody {
  cabecalho_acordo: any;
  negativacoes: any[];
  senha: string;
}

export const AcordosService = {
  /**
   * Consulta todos os títulos/acordos do usuário agrupados por CPF/CNPJ
   */
  getTitulos: async (cpf_cnpj: string): Promise<[CNPJTitulos[], null] | [null, string]> => {
    const url = 'monitora/consultar_titulos_monitora';

    try {
      const response = await api.post(url, { cpf_cnpj });

      if (response?.status === 200) {
        let CNPJs: CNPJTitulos[] = [];
        const { data } = response.data;

        data?.forEach((v: any, indice: number, dividas: any[]) => {
          if (CNPJs.length === 0) {
            const value: CNPJTitulos = {
              name: v.name,
              cpf_cnpj: v.cpf_cnpj,
              opened: false,
              titulos: dividas.filter((divida) => divida.cpf_cnpj === v.cpf_cnpj),
            };
            CNPJs.push(value);
          } else {
            const exists = CNPJs.find((e) => e.cpf_cnpj === v.cpf_cnpj);
            if (!exists) {
              const value: CNPJTitulos = {
                name: v.name,
                cpf_cnpj: v.cpf_cnpj,
                opened: false,
                titulos: dividas.filter((divida) => divida.cpf_cnpj === v.cpf_cnpj),
              };
              CNPJs.push(value);
            }
          }
        });

        if (__DEV__) console.log('[AcordosService] Títulos encontrados:', CNPJs.length);

        return [CNPJs, null];
      }

      return [null, 'Erro status'];
    } catch (err: any) {
      if (__DEV__) console.error('[AcordosService] Erro ao buscar títulos:', err.response?.data || err.message);
      return [null, err.message || 'Erro ao buscar títulos'];
    }
  },

  /**
   * Atualiza status de um título
   * @param id_titulo - ID do título
   * @param status_novo - 0=aberto, 1=pago, 10=em processamento
   */
  atualizarStatus: async (id_titulo: string, status_novo: number): Promise<any> => {
    const body = {
      id: id_titulo,
      status: status_novo,
    };

    try {
      const response = await api.post('monitora/atualizar_titulos_monitora', body);

      if (__DEV__) console.log('[AcordosService] Status atualizado:', status_novo);

      return response.data;
    } catch (error: any) {
      if (__DEV__) console.error('[AcordosService] Erro ao atualizar status:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Verifica status do pagamento Juno
   */
  getStatusJuno: async (documento: string): Promise<string | null> => {
    try {
      const response = await api.get(`negociacoes/titulos/statusjuno/${documento}`);

      if (__DEV__) console.log('[AcordosService] Status Juno:', response.data.status);

      return response.data.status; // 'PAID', 'PENDING', etc
    } catch (error: any) {
      if (__DEV__) console.error('[AcordosService] Erro ao verificar status Juno:', error.response?.data || error.message);
      return null;
    }
  },

  /**
   * Gera body para salvar acordo
   */
  gerarBodyToSave: (cabecalho_acordo: any, dividas: any[], senha: string): AcordoBody => {
    const negativacoes = dividas.map((item) => ({
      ...item,
      index: item.id,
      protocolo: item.protocolo,
      juros: item.valor_juros__app,
      multa: item.valor_multa__app,
      honorario: item.valor_honorario,
      outros: item.valor_outros,
      indice: item.valor_monetario_diff_app,
    }));

    const body: AcordoBody = {
      cabecalho_acordo,
      negativacoes,
      senha,
    };

    return body;
  },

  /**
   * Retorna descrição do intervalo de pagamento
   */
  getIntervalo: (selectedInterval: number): string => {
    switch (selectedInterval) {
      case 30:
        return 'Mensal';
      case 15:
        return 'Quinzenal';
      case 1:
        return 'Diário';
      case 7:
        return 'Semanal';
      case 2:
        return 'Mensal (Escolher dia)';
      default:
        return 'X quantidade de dias';
    }
  },

  /**
   * Retorna status legível do título
   */
  getStatusTexto: (status: string): string => {
    switch (status) {
      case '0':
        return 'Pendente';
      case '10':
        return 'Processando';
      case '1':
        return 'Pago';
      default:
        return 'Desconhecido';
    }
  },
};
