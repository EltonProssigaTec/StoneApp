/**
 * Serviço de Autenticação
 * Endpoints de registro, login e recuperação de senha
 */

import api from './api.config';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  cpf_cnpj: string;
  data_nascimento: string; // formato: YYYY-MM-DD HH:mm:ss
  telefone: string;
  cnh?: string;
  rgFrente?: string;
  rgVerso?: string;
  residencia?: string;
  origem?: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  // Adicione outros campos conforme necessário
}

export const AuthService = {
  /**
   * Pré-registro de usuário (envia código de verificação por email)
   */
  preRegister: async (data: RegisterData): Promise<RegisterResponse> => {
    if (__DEV__) console.log('[AuthService] Pré-registro:', data.email);

    const body = {
      ...data,
      origem: data.origem || 'mobile',
      cnh: data.cnh || '',
      rgFrente: data.rgFrente || '',
      rgVerso: data.rgVerso || '',
      residencia: data.residencia || '',
    };

    try {
      const response = await api.post('/pre_register_monitora', body);

      if (__DEV__) console.log('[AuthService] Resposta pré-registro:', response.data);

      if (!response.data?.id) {
        throw new Error('ID de cadastro não retornado');
      }

      return response.data;
    } catch (error: any) {
      if (__DEV__) console.error('[AuthService] Erro no pré-registro:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Verifica código de segurança enviado por email
   */
  verifySecureCode: async (idCadastro: string, code: string): Promise<boolean> => {
    try {
      const response = await api.post('/verify_secure_code', {
        id: idCadastro,
        code,
      });

      return response.data?.success || false;
    } catch (error: any) {
      if (__DEV__) console.error('[AuthService] Erro ao verificar código:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Consulta termos de uso
   */
  consultarTermos: async (tipo: 'cadastro' | 'politica') => {
    try {
      const response = await api.post('/consultar_termos', { tipo });

      if (response.data?.data && response.data.data.length > 0) {
        return response.data.data[0];
      }

      return null;
    } catch (error: any) {
      if (__DEV__) console.error('[AuthService] Erro ao consultar termos:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Recuperação de senha
   */
  recoverPassword: async (email: string): Promise<boolean> => {
    try {
      const response = await api.post('/recover_password', { email });
      return response.data?.success || false;
    } catch (error: any) {
      if (__DEV__) console.error('[AuthService] Erro ao recuperar senha:', error.response?.data || error.message);
      throw error;
    }
  },
};
