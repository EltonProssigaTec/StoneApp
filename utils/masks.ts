/**
 * Máscaras de formatação para campos de formulário
 * Baseado em: monitora_mobile/src/helpers/MaskHelper.js
 */

/**
 * Máscara de CPF: 000.000.000-00
 */
export const cpfMask = (value: string): string => {
  if (!value) return '';

  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');

  // Limita a 11 dígitos
  const limited = numbers.slice(0, 11);

  // Aplica a máscara
  return limited
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

/**
 * Máscara de CNPJ: 00.000.000/0000-00
 */
export const cnpjMask = (value: string): string => {
  if (!value) return '';

  const numbers = value.replace(/\D/g, '');
  const limited = numbers.slice(0, 14);

  return limited
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

/**
 * Máscara de CPF ou CNPJ (detecta automaticamente)
 */
export const cpfCnpjMask = (value: string): string => {
  if (!value) return '';

  const numbers = value.replace(/\D/g, '');

  if (numbers.length <= 11) {
    return cpfMask(numbers);
  } else {
    return cnpjMask(numbers);
  }
};

/**
 * Máscara de telefone: (00) 00000-0000 ou (00) 0000-0000
 */
export const phoneMask = (value: string): string => {
  if (!value) return '';

  const numbers = value.replace(/\D/g, '');
  const limited = numbers.slice(0, 11);

  if (limited.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    return limited
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  } else {
    // Celular: (00) 00000-0000
    return limited
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  }
};

/**
 * Máscara de data: 00/00/0000
 */
export const dateMask = (value: string): string => {
  if (!value) return '';

  const numbers = value.replace(/\D/g, '');
  const limited = numbers.slice(0, 8);

  return limited
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2');
};

/**
 * Máscara de CEP: 00000-000
 */
export const cepMask = (value: string): string => {
  if (!value) return '';

  const numbers = value.replace(/\D/g, '');
  const limited = numbers.slice(0, 8);

  return limited.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
};

/**
 * Máscara de valor monetário: R$ 0.000,00
 */
export const moneyMask = (value: string): string => {
  if (!value) return 'R$ 0,00';

  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');

  // Converte para número e divide por 100 (centavos)
  const amount = parseFloat(numbers) / 100;

  // Formata como moeda brasileira
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

/**
 * Remove máscara (retorna apenas números)
 */
export const removeMask = (value: string): string => {
  return value ? value.replace(/\D/g, '') : '';
};

/**
 * Valida CPF
 */
export const validateCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, '');

  if (numbers.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(numbers)) return false;

  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.substring(10, 11))) return false;

  return true;
};

/**
 * Valida CNPJ
 */
export const validateCNPJ = (cnpj: string): boolean => {
  const numbers = cnpj.replace(/\D/g, '');

  if (numbers.length !== 14) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(numbers)) return false;

  // Validação dos dígitos verificadores
  let size = numbers.length - 2;
  let nums = numbers.substring(0, size);
  const digits = numbers.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(nums.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  size = size + 1;
  nums = numbers.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(nums.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
};

/**
 * Valida data no formato DD/MM/YYYY
 */
export const validateDate = (date: string): boolean => {
  if (!date) return false;

  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = date.match(regex);

  if (!match) return false;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const maxDays = new Date(year, month, 0).getDate();
  if (day > maxDays) return false;

  // Não permitir datas futuras
  const today = new Date();
  const inputDate = new Date(year, month - 1, day);

  return inputDate <= today;
};
