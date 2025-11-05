/**
 * Configuração da API - StoneUP Monitora
 * Baseado em: monitora_mobile/src/settings/config.js
 */

import axios from 'axios';

// Configurações da API
const BASE_URL = 'https://api.stoneup.com.br/';

export const settings = {
  API_URL: BASE_URL + 'api/v1.0',
  FILES_URL: BASE_URL + 'storage/',
  BASE_URL,
};

// Instância principal da API (com autenticação)
const api = axios.create({
  baseURL: settings.API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

// Interceptor de requisição
api.interceptors.request.use(
  async (config) => {
    // Buscar token do AsyncStorage se não estiver no header
    if (!config.headers.Authorization) {
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage').then(m => m.default);
        const token = await AsyncStorage.getItem('@Auth:token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        if (__DEV__) console.warn('[API] Erro ao buscar token:', error);
      }
    }

    if (__DEV__) {
      console.log('[API Request]', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    if (__DEV__) {
      console.log('[API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

// Interceptor de resposta
api.interceptors.response.use(
  async (response) => {
    if (__DEV__) {
      console.log('[API Response Success]', response.status, response.config.url);
    }
    return response;
  },
  async (error) => {
    if (__DEV__) {
      console.error('[API Response Error]', {
        url: error.config?.url,
        status: error.response?.status,
        code: error.code,
        message: error.message,
      });
    }

    // Tratar erros de rede
    if (error.code === 'ECONNABORTED') {
      if (__DEV__) console.error('[API] Timeout na requisição');
      error.userMessage = 'Tempo de espera esgotado. Verifique sua conexão.';
      return Promise.reject(error);
    }

    if (error.code === 'ERR_NETWORK' || !error.response) {
      if (__DEV__) console.error('[API] Erro de rede - sem conexão com o servidor');
      error.userMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
      return Promise.reject(error);
    }

    // Tratar erro 401 Unauthorized
    if (error.response?.status === 401) {
      const url = error.config?.url || '';

      // Se for erro em rota de login, apenas retorna erro
      if (url.includes('/login')) {
        error.userMessage = 'Email ou senha incorretos.';
      } else {
        // Se for erro 401 em outras rotas = sessão inválida/expirada
        // Fazer logout automático apenas em produção
        if (!__DEV__) {
          if (__DEV__) console.warn('[API] Token inválido ou sessão expirada. Fazendo logout...');

          try {
            const AsyncStorage = await import('@react-native-async-storage/async-storage').then(m => m.default);
            await AsyncStorage.multiRemove(['@Auth:user', '@Auth:token', '@Auth:keepLoggedIn']);

            // Limpar header de autorização
            delete api.defaults.headers.common['Authorization'];

            // Notificar sobre sessão expirada
            error.sessionExpired = true;
            error.userMessage = 'Sua sessão expirou ou você fez login em outro dispositivo. Por favor, faça login novamente.';
          } catch (logoutError) {
            if (__DEV__) console.error('[API] Erro ao fazer logout automático:', logoutError);
          }
        } else {
          // Em modo dev, apenas avisa mas não desconecta
          if (__DEV__) console.warn('[API] Token inválido (não desconectando pois está em DEV mode)');
          error.userMessage = 'Sessão inválida. Em produção, você seria desconectado automaticamente.';
        }
      }
    } else if (error.response?.status === 403) {
      error.userMessage = 'Acesso negado.';
    } else if (error.response?.status >= 500) {
      error.userMessage = 'Erro no servidor. Tente novamente mais tarde.';
    }

    return Promise.reject(error);
  }
);

// Instância da API sem autenticação (livre)
export const apiFree = axios.create({
  baseURL: settings.API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

apiFree.interceptors.request.use(
  async (config) => {
    if (__DEV__) {
      console.log('[API Free Request]', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    if (__DEV__) {
      console.log('[API Free Request Error]', error);
    }
    return Promise.reject(error);
  }
);

apiFree.interceptors.response.use(
  async (response) => {
    if (__DEV__) {
      console.log('[API Free Response Success]', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    if (__DEV__) {
      console.error('[API Free Response Error]', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }
    return Promise.reject(error);
  }
);

export default api;