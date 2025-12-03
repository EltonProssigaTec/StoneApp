# Como Configurar sua Chave PIX

## Onde Configurar

Arquivo: **config/payment.config.ts**

## O Que Alterar:

```typescript
export const PaymentConfig = {
  pix: {
    chavePix: 'suachave@example.com',     // <- SUA CHAVE AQUI
    beneficiario: 'StoneUP Monitora',     // <- SEU NOME AQUI
    cidade: 'Sao Paulo',                  // <- SUA CIDADE AQUI
  },
}
```

## Exemplos de Chaves:

- CPF: '12345678900'
- CNPJ: '12345678000190'  
- Email: 'pagamentos@empresa.com'
- Telefone: '+5511999999999'
- Aleatoria: '123e4567-e89b-12d3-a456-426614174000'

## Como Funciona:

1. Cliente seleciona plano
2. Sistema gera QR Code com SUA chave
3. Cliente escaneia
4. Valor ja vem preenchido
5. Cliente paga

## O sistema gera um PIX no formato oficial do Banco Central (EMV)
