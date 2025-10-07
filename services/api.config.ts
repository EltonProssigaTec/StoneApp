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
  },
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
    const errorMsg = error.response?.data?.message || error.message;

    // Ignorar erros de SQL do backend (problema no servidor)
    if (errorMsg && errorMsg.includes('SQLSTATE')) {
      console.warn('[API] Erro de SQL no backend (ignorado):', errorMsg);
      // Se houve resposta mesmo com erro, retornar a resposta
      if (error.response) {
        return error.response;
      }
    }

    console.log('[API Response Error]', error.response?.data || error.message);
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