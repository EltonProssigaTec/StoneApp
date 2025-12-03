/**
 * Configurações de Pagamento
 * Configure suas chaves PIX e credenciais de pagamento aqui
 */

export const PaymentConfig = {
  /**
   * CONFIGURAÇÃO PIX
   * Substitua pelos seus dados reais
   */
  pix: {
    // Sua chave PIX (pode ser CPF, CNPJ, email, telefone ou chave aleatória)
    chavePix: 'suachave@example.com', // ← ALTERE AQUI!

    // Nome do beneficiário (seu nome ou empresa)
    beneficiario: 'StoneUP Monitora', // ← ALTERE AQUI!

    // Cidade do beneficiário
    cidade: 'Sao Paulo', // ← ALTERE AQUI!

    // Identificador do recebedor (txid - opcional)
    // Usado para rastreamento interno
    merchantAccountInfo: '0014br.gov.bcb.pix', // Padrão do Banco Central
  },

  /**
   * MERCADO PAGO (Opcional - para produção)
   * https://www.mercadopago.com.br/developers
   */
  mercadoPago: {
    publicKey: 'SUA_PUBLIC_KEY_AQUI',
    accessToken: 'SUA_ACCESS_TOKEN_AQUI',
  },

  /**
   * STRIPE (Opcional - para produção)
   * https://stripe.com/docs
   */
  stripe: {
    publishableKey: 'SUA_PUBLISHABLE_KEY_AQUI',
  },
};

/**
 * Gera o payload do PIX no formato EMV (padrão do Banco Central)
 *
 * Formato: https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf
 */
export function generatePixPayload(
  chavePix: string,
  beneficiario: string,
  cidade: string,
  valor: number,
  txid?: string
): string {
  // Remove acentos e caracteres especiais
  const cleanString = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .toUpperCase();
  };

  const beneficiarioClean = cleanString(beneficiario);
  const cidadeClean = cleanString(cidade);
  const valorFormatado = valor.toFixed(2);

  // ID da transação (opcional)
  const transactionId = txid || `MON${Date.now()}`;

  // Monta o payload EMV do PIX
  let payload = '';

  // [00] Payload Format Indicator
  payload += '000201';

  // [26] Merchant Account Information
  const merchantInfo = `0014br.gov.bcb.pix01${chavePix.length.toString().padStart(2, '0')}${chavePix}`;
  payload += `26${merchantInfo.length.toString().padStart(2, '0')}${merchantInfo}`;

  // [52] Merchant Category Code
  payload += '52040000';

  // [53] Transaction Currency (986 = BRL)
  payload += '5303986';

  // [54] Transaction Amount
  payload += `54${valorFormatado.length.toString().padStart(2, '0')}${valorFormatado}`;

  // [58] Country Code
  payload += '5802BR';

  // [59] Merchant Name
  payload += `59${beneficiarioClean.length.toString().padStart(2, '0')}${beneficiarioClean}`;

  // [60] Merchant City
  payload += `60${cidadeClean.length.toString().padStart(2, '0')}${cidadeClean}`;

  // [62] Additional Data Field Template
  const additionalData = `05${transactionId.length.toString().padStart(2, '0')}${transactionId}`;
  payload += `62${additionalData.length.toString().padStart(2, '0')}${additionalData}`;

  // [63] CRC16
  payload += '6304';

  // Calcula o CRC16
  const crc16 = calculateCRC16(payload);
  payload += crc16;

  return payload;
}

/**
 * Calcula o CRC16-CCITT para validação do PIX
 */
function calculateCRC16(str: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;

  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc = crc << 1;
      }
    }
  }

  crc = crc & 0xFFFF;
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
