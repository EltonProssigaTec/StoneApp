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
    console.log('[API Request]', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.log('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Interceptor de resposta
api.interceptors.response.use(
  async (response) => {
    console.log('[API Response Success]', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('[API Response Error]', {
      url: error.config?.url,
      status: error.response?.status,
      code: error.code,
      message: error.message,
    });

    // Tratar erros de rede
    if (error.code === 'ECONNABORTED') {
      console.error('[API] Timeout na requisição');
      error.userMessage = 'Tempo de espera esgotado. Verifique sua conexão.';
      return Promise.reject(error);
    }

    if (error.code === 'ERR_NETWORK' || !error.response) {
      console.error('[API] Erro de rede - sem conexão com o servidor');
      error.userMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
      return Promise.reject(error);
    }

    // Para erros 401, 403, etc
    if (error.response?.status === 401) {
      error.userMessage = 'Email ou senha incorretos.';
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
  headers: {
    'Content-Type': 'application/json',
  },
});

apiFree.interceptors.request.use(
  async (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiFree.interceptors.response.use(
  async (response) => {
    return response;
  },
  (error) => {
    console.log('[API Free Error]', error);
    return Promise.reject(error);
  }
);

export default api;