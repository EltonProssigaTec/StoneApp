/**
 * Export de todos os serviços da API
 */

export { default as api, apiFree, settings } from './api.config';
export { DividasService } from './dividas.service';
export type { Divida } from './dividas.service';
export { AuthService } from './auth.service';
export type { RegisterData, RegisterResponse } from './auth.service';
