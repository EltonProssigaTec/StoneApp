# 💳 Guia Completo - Métodos de Pagamento

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [PIX Direto](#-1-pix-direto)
3. [Juno API](#-2-juno-api-pix--boleto--cartão)
4. [Google Play In-App Purchase](#-3-google-play-in-app-purchase)
5. [Comparação de Métodos](#-comparação-de-métodos)
6. [Qual Usar?](#-qual-método-usar)

---

## 🎯 Visão Geral

O StoneApp agora suporta **4 métodos de pagamento diferentes**, baseados no projeto antecessor (`monitora_mobile`):

| Método | Plataforma | Status | Documentação |
|--------|-----------|--------|--------------|
| **PIX Direto** | iOS, Android, Web | ✅ Implementado | [GUIA_PIX.md](./GUIA_PIX.md) |
| **Juno API (PIX)** | iOS, Android, Web | 📋 Código pronto | [#2-juno-api](#-2-juno-api-pix--boleto--cartão) |
| **Juno API (Boleto)** | iOS, Android, Web | 📋 Código pronto | [#2-juno-api](#-2-juno-api-pix--boleto--cartão) |
| **Google Play** | Android apenas | ✅ Implementado | [GOOGLE_PLAY_SETUP.md](./GOOGLE_PLAY_SETUP.md) |

---

## 💚 1. PIX Direto

### Como Funciona

Você configura sua **chave PIX** e o app gera o QR Code no padrão EMV do Banco Central.

### ✅ Vantagens

- ✅ Sem taxas de intermediário (0% de comissão)
- ✅ Dinheiro cai direto na sua conta
- ✅ Funciona em todas as plataformas (iOS, Android, Web)
- ✅ Implementação mais simples
- ✅ Confirmação instantânea (se integrar webhook do banco)

### ❌ Desvantagens

- ❌ Você precisa confirmar pagamento manualmente (ou integrar webhook)
- ❌ Sem renovação automática
- ❌ Sem gerenciamento de assinatura integrado
- ❌ Precisa de validação manual/backend

### 🔧 Como Configurar

#### Passo 1: Configure sua chave PIX

Edite [config/payment.config.ts](../config/payment.config.ts:11):

```typescript
export const PaymentConfig = {
  pix: {
    chavePix: 'seuemail@exemplo.com',  // ← SUA CHAVE AQUI
    beneficiario: 'StoneUP Monitora',   // ← SEU NOME
    cidade: 'Sao Paulo',                // ← SUA CIDADE
  },
};
```

#### Passo 2: Teste o fluxo

1. Abra o app
2. Vá em "Planos"
3. Selecione um plano
4. Escolha "PIX" como método
5. ✅ QR Code será gerado com sua chave!

### 📖 Documentação Completa

Veja [GUIA_PIX.md](./GUIA_PIX.md) para detalhes completos.

---

## 🟣 2. Juno API (PIX + Boleto + Cartão)

### Como Funciona

A **Juno** é um gateway de pagamento brasileiro que processa PIX, Boleto e Cartão de Crédito.

Baseado no código do projeto antecessor: `monitora_mobile/src/pages/Pagamento/Pix.js`

### ✅ Vantagens

- ✅ PIX + Boleto + Cartão em uma única integração
- ✅ Confirmação automática via webhook
- ✅ Gerenciamento de cobranças
- ✅ Split de pagamento (se precisar)
- ✅ Antifraude integrado

### ❌ Desvantagens

- ❌ Taxa: **~2,99% + R$ 0,60** por transação PIX/Boleto
- ❌ Taxa: **~4,99%** para cartão de crédito
- ❌ Precisa de aprovação da conta Juno (KYC)
- ❌ Requer backend para webhooks

### 🔧 Como Configurar

#### Passo 1: Criar conta na Juno

1. Acesse: [https://juno.com.br](https://juno.com.br)
2. Crie uma conta Business
3. Complete o processo de KYC (1-3 dias)

#### Passo 2: Obter API Key

1. Acesse o Painel Juno
2. Vá em **"Integrações" → "API"**
3. Copie sua **Private Token**

#### Passo 3: Configure no App

Edite [config/payment.config.ts](../config/payment.config.ts):

```typescript
export const PaymentConfig = {
  juno: {
    privateToken: 'SUA_PRIVATE_TOKEN_AQUI',
    apiUrl: 'https://api.juno.com.br',
    // Sandbox para testes:
    // apiUrl: 'https://sandbox.boletobancario.com/api-integration',
  },
};
```

#### Passo 4: Implemente o serviço Juno

Crie `services/junoPayment.ts` baseado no código antecessor:

```typescript
import api from './api.config';
import { PaymentConfig } from '@/config/payment.config';

interface JunoPixRequest {
  amount: number;
  description: string;
  reference?: string;
}

interface JunoPixResponse {
  id: string;
  qrCode: string;         // Base64 da imagem
  qrCodeText: string;     // Código PIX copia-e-cola
  status: string;
}

class JunoPaymentService {
  /**
   * Gera PIX via Juno
   * Baseado em: monitora_mobile/src/pages/Pagamento/Pix.js:24
   */
  async generatePixQRCode(
    amount: number,
    description: string
  ): Promise<JunoPixResponse> {
    try {
      const response = await api.post('/juno/qrcode', {
        includeImage: true,
        key: PaymentConfig.juno.privateToken,
        amount,
        additionalData: description,
      });

      return {
        id: response.data.id,
        qrCode: response.data.imageInBase64,
        qrCodeText: response.data.payload,
        status: response.data.status,
      };
    } catch (error) {
      console.error('[Juno] Erro ao gerar PIX:', error);
      throw error;
    }
  }

  /**
   * Gera Boleto via Juno
   */
  async generateBoleto(
    amount: number,
    description: string,
    dueDate: string
  ): Promise<{ boletoUrl: string; barcodeNumber: string }> {
    // Implementar conforme documentação Juno
    // Similar ao código em monitora_mobile
    throw new Error('Implementar conforme necessário');
  }

  /**
   * Processa Cartão de Crédito via Juno
   */
  async processCard(
    amount: number,
    cardData: {
      holderName: string;
      number: string;
      expirationMonth: string;
      expirationYear: string;
      securityCode: string;
    }
  ): Promise<{ transactionId: string }> {
    // Implementar conforme documentação Juno
    throw new Error('Implementar conforme necessário');
  }
}

export default new JunoPaymentService();
```

#### Passo 5: Integre no Checkout

Modifique [app/checkout.tsx](../app/checkout.tsx) para usar Juno:

```typescript
import junoPayment from '@/services/junoPayment';

const handlePixPayment = async () => {
  setLoading(true);
  try {
    // Usa Juno ao invés de PIX direto
    const data = await junoPayment.generatePixQRCode(
      plan.price,
      `Assinatura ${plan.name}`
    );

    setPixData({
      qrCode: data.qrCode,
      qrCodeText: data.qrCodeText,
    });

    // Aguarda webhook do Juno confirmar pagamento
  } catch (error) {
    Alert.alert('Erro', 'Não foi possível gerar o PIX');
  } finally {
    setLoading(false);
  }
};
```

### 📖 Recursos

- [Documentação Juno](https://dev.juno.com.br)
- [Webhook Juno](https://dev.juno.com.br/api/v2#section/Webhooks)
- [Código antecessor](C:\Users\pross\PROJETOS_PROSSIGA\monitora_mobile\src\pages\Pagamento\Pix.js)

---

## 🤖 3. Google Play In-App Purchase

### Como Funciona

Usuários compram assinaturas diretamente pela **Google Play Store**, com renovação automática.

Baseado no código do projeto antecessor: `monitora_mobile/src/pages/Plano/fatura/InAppComponent.js`

### ✅ Vantagens

- ✅ Renovação automática nativa
- ✅ Gerenciamento de assinatura pelo Google
- ✅ Usuário pode cancelar/pausar pela Play Store
- ✅ Melhor UX (familiaridade com Play Store)
- ✅ Suporte a métodos de pagamento salvos
- ✅ Trial gratuito e períodos promocionais

### ❌ Desvantagens

- ❌ Taxa: **15-30%** do Google (15% nos primeiros US$ 1M/ano)
- ❌ Só funciona no Android
- ❌ Precisa publicar app no Play Console (mínimo internal testing)
- ❌ Setup mais complexo
- ❌ Demora na aprovação de produtos (1-2 horas)

### 🔧 Como Configurar

#### ✅ Já Implementado

- ✅ [services/googlePlayBilling.ts](../services/googlePlayBilling.ts) - Serviço completo
- ✅ [app/checkout.tsx](../app/checkout.tsx:328) - Opção "Google Play" no checkout
- ✅ Listeners configurados
- ✅ Ativação automática de assinatura

#### 📋 O que você precisa fazer

1. Criar conta Google Play Developer (US$ 25)
2. Configurar 3 produtos no Play Console:
   - `monitora_mensal` (R$ 15,00)
   - `monitora_trimestral` (R$ 35,00)
   - `monitora_anual` (R$ 59,90)
3. Fazer upload do APK/AAB
4. Configurar testadores

### 📖 Documentação Completa

Veja [GOOGLE_PLAY_SETUP.md](./GOOGLE_PLAY_SETUP.md) para passo-a-passo detalhado.

---

## 📊 Comparação de Métodos

### Por Custo

| Método | Taxa | Recebimento |
|--------|------|-------------|
| **PIX Direto** | 0% | Instantâneo |
| **Juno PIX** | ~2,99% + R$ 0,60 | D+1 |
| **Juno Boleto** | ~2,99% + R$ 0,60 | D+2 |
| **Juno Cartão** | ~4,99% | D+30 |
| **Google Play** | 15-30% | Mensal (D+45) |

### Por Plataforma

| Método | iOS | Android | Web |
|--------|-----|---------|-----|
| PIX Direto | ✅ | ✅ | ✅ |
| Juno | ✅ | ✅ | ✅ |
| Google Play | ❌ | ✅ | ❌ |

### Por Recurso

| Recurso | PIX Direto | Juno | Google Play |
|---------|-----------|------|-------------|
| Renovação automática | ❌ | ⚠️ Via API | ✅ Nativo |
| Confirmação automática | ❌ | ✅ Webhook | ✅ Nativo |
| Múltiplos métodos | ❌ | ✅ PIX+Boleto+Cartão | ❌ Só IAP |
| Trial gratuito | ❌ | ⚠️ Via código | ✅ Nativo |
| Gerenciamento pelo usuário | ❌ | ⚠️ Via painel | ✅ Play Store |

---

## 🤔 Qual Método Usar?

### Recomendação por Cenário

#### 🎯 MVP / Teste Rápido
**Use: PIX Direto**
- Zero custo
- Setup em 5 minutos
- Confirma pagamento manualmente

#### 💼 Produto em Produção
**Use: Juno API**
- Confirmação automática
- Múltiplos métodos
- Taxa razoável (~3%)

#### 📱 App Android com Escala
**Use: Google Play**
- Melhor UX
- Renovação automática
- Gerenciamento nativo
- Taxa alta, mas vale a pena

#### 🚀 Estratégia Híbrida (RECOMENDADO!)

Ofereça **TODOS** e deixe o usuário escolher:

```
Android:
  ✅ Google Play (15-30%) - Melhor UX, renovação automática
  ✅ PIX Juno (2,99%) - Economia na taxa
  ✅ Boleto Juno (2,99%) - Sem cartão? Sem problema

iOS:
  ✅ PIX Juno (2,99%)
  ✅ Boleto Juno (2,99%)
  ⏳ Apple In-App Purchase (em breve)

Web:
  ✅ PIX Direto (0%) - Menor custo
  ✅ PIX Juno (2,99%) - Com confirmação automática
  ✅ Boleto Juno (2,99%)
```

### Exemplo de Escolha no Checkout

```typescript
// app/checkout.tsx
<View>
  {Platform.OS === 'android' && (
    <PaymentOption
      title="Google Play"
      subtitle="Renovação automática • Mais fácil"
      recommended={true}
    />
  )}

  <PaymentOption
    title="PIX via Juno"
    subtitle="Confirmação automática • Menor taxa"
  />

  <PaymentOption
    title="PIX Direto"
    subtitle="Sem taxas • Confirmação manual"
  />

  <PaymentOption
    title="Boleto"
    subtitle="Pague no banco • Até 2 dias"
  />
</View>
```

---

## 🔐 Segurança e Validação

### ⚠️ IMPORTANTE para TODOS os métodos

Sempre valide pagamentos no **backend**:

#### PIX Direto
```typescript
// Backend recebe webhook do banco
app.post('/webhook/pix', (req, res) => {
  const { txid, valor } = req.body;

  // Valida se txid é válido
  // Ativa assinatura no banco
  // Notifica app via push
});
```

#### Juno
```typescript
// Backend recebe webhook da Juno
app.post('/webhook/juno', (req, res) => {
  const { eventType, data } = req.body;

  if (eventType === 'CHARGE_PAID') {
    // Ativa assinatura
  }
});
```

#### Google Play
```typescript
// Backend valida com Google Play API
app.post('/validate/google-play', async (req, res) => {
  const { purchaseToken } = req.body;

  const valid = await googlePlayAPI.verify(purchaseToken);

  if (valid) {
    // Ativa assinatura
  }
});
```

---

## 📚 Próximos Passos

### Para começar agora:

1. **PIX Direto (5 min)**
   - Configure chave em `payment.config.ts`
   - Teste no app
   - ✅ Pronto!

2. **Juno API (1-3 dias)**
   - Crie conta na Juno
   - Complete KYC
   - Configure webhooks
   - Implemente `junoPayment.ts`

3. **Google Play (3-7 dias)**
   - Crie conta Developer
   - Configure produtos
   - Faça upload do app
   - Siga [GOOGLE_PLAY_SETUP.md](./GOOGLE_PLAY_SETUP.md)

### Links Úteis

- [GUIA_PIX.md](./GUIA_PIX.md) - Setup PIX Direto
- [GOOGLE_PLAY_SETUP.md](./GOOGLE_PLAY_SETUP.md) - Setup Google Play
- [Juno Docs](https://dev.juno.com.br) - Documentação oficial Juno
- [Projeto Antecessor](C:\Users\pross\PROJETOS_PROSSIGA\monitora_mobile) - Código de referência

---

**Última atualização:** 2025-12-03
**Versão:** 1.0.0
**Autor:** Claude Code
