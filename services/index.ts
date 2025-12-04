/**
 * Export de todos os serviços da API
 */

// API Config
export { default as api, apiFree, settings } from './api.config';

// Dívidas
export { DividasService } from './dividas.service';
export type { Divida, ResumoFinanceiro } from './dividas.service';

// Autenticação
export { AuthService } from './auth.service';
export type { RegisterData, RegisterResponse } from './auth.service';

// Autenticação Biométrica
export { BiometricAuthService } from './biometric-auth.service';
export type { BiometricAuthResult, LastUserInfo } from './biometric-auth.service';

// Cartão de Crédito
export { CartaoCreditoService } from './cartaocredito.service';
export type { Cartao, CartaoInput, PlanoSelecionado, AssinaturaResponse } from './cartaocredito.service';

// Planos
export { PlanoService } from './plano.service';
export type { Plano, Desconto, PagamentoLojaBody } from './plano.service';

// Endereço
export { EnderecoService } from './endereco.service';
export type { Endereco } from './endereco.service';

// Juno (Pagamentos PIX)
export { JunoService, JunoURLs } from './juno.service';
export type { JunoQRCodeData, JunoConfig } from './juno.service';

// Acordos/Títulos
export { AcordosService } from './acordos.service';
export type { Titulo, CNPJTitulos, AcordoBody } from './acordos.service';

// Ofertas/Promoções
export { OfertasService } from './ofertas.service';
export type { Oferta, OfertaDivida } from './ofertas.service';
