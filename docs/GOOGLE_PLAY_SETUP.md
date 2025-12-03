# 🛒 Guia de Configuração - Google Play In-App Purchases

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Pré-requisitos](#-pré-requisitos)
3. [Configuração no Google Play Console](#-configuração-no-google-play-console)
4. [Configuração no App](#-configuração-no-app)
5. [Como Funciona](#-como-funciona)
6. [Teste em Produção](#-teste-em-produção)
7. [Troubleshooting](#-troubleshooting)
8. [Backend - Validação de Compras](#-backend---validação-de-compras)

---

## 🎯 Visão Geral

Este guia mostra como configurar **Google Play In-App Purchases** para vender assinaturas no seu app Android.

### ✅ O que já está implementado:

- ✅ Integração com `react-native-iap` v12.15.7
- ✅ Serviço `googlePlayBilling.ts` completo
- ✅ Tela de checkout com opção Google Play (apenas Android)
- ✅ Listeners para compras bem-sucedidas/falhas
- ✅ Ativação automática de assinatura após compra
- ✅ Finalização de transações (acknowledgement)

### ⏳ O que você precisa fazer:

1. Configurar produtos no Google Play Console
2. Gerar APK/AAB assinado
3. Fazer upload para Play Console (track interno/alpha/beta)
4. Configurar contas de teste
5. Implementar backend de validação (opcional, mas recomendado)

---

## 🔧 Pré-requisitos

Antes de começar, você precisa:

### 1. Conta Google Play Developer

- Custo: **US$ 25** (pagamento único)
- Link: [https://play.google.com/console/signup](https://play.google.com/console/signup)
- Processo de registro leva 1-2 dias para aprovação

### 2. App publicado (mínimo Internal Testing)

⚠️ **IMPORTANTE**: Você **NÃO PODE** testar Google Play IAP em modo desenvolvimento local!

- O app precisa estar no Play Console (mesmo que seja track interno)
- Precisa ser instalado via Google Play Store (não via `npm run android`)

### 3. Build assinado

Você precisa gerar um APK/AAB assinado. Veja: [BUILD_SETUP.md](./BUILD_SETUP.md)

---

## 🏪 Configuração no Google Play Console

### Passo 1: Acesse o Play Console

1. Acesse: [https://play.google.com/console](https://play.google.com/console)
2. Selecione seu app (ou crie um novo)

### Passo 2: Configure Produtos (Assinaturas)

1. No menu lateral, clique em **"Monetização" → "Produtos" → "Assinaturas"**
2. Clique em **"Criar assinatura"**

### Passo 3: Criar Assinatura Mensal

Preencha os campos:

| Campo | Valor |
|-------|-------|
| **ID do produto** | `monitora_mensal` |
| **Nome** | Monitora Mensal |
| **Descrição** | Acesso premium com consultas ilimitadas por 1 mês |
| **Preço** | R$ 15,00 |
| **Período de cobrança** | 1 mês |
| **Renovação automática** | ✅ Sim |

### Passo 4: Criar Assinatura Trimestral

| Campo | Valor |
|-------|-------|
| **ID do produto** | `monitora_trimestral` |
| **Nome** | Monitora Trimestral |
| **Descrição** | Acesso premium com consultas ilimitadas por 3 meses |
| **Preço** | R$ 35,00 |
| **Período de cobrança** | 3 meses |
| **Renovação automática** | ✅ Sim |

### Passo 5: Criar Assinatura Anual

| Campo | Valor |
|-------|-------|
| **ID do produto** | `monitora_anual` |
| **Nome** | Monitora Anual |
| **Descrição** | Acesso premium com consultas ilimitadas por 1 ano - Melhor desconto! |
| **Preço** | R$ 59,90 |
| **Período de cobrança** | 1 ano |
| **Renovação automática** | ✅ Sim |

### Passo 6: Ativar Produtos

Após criar, clique em **"Ativar"** em cada produto.

⚠️ **IMPORTANTE**: Produtos só ficam visíveis no app após o APK ser publicado (mesmo em track interno).

---

## 📱 Configuração no App

### 1. Verificar package.json

Confirme que `react-native-iap` está instalado:

```json
{
  "dependencies": {
    "react-native-iap": "^12.15.7"
  }
}
```

Se não estiver:

```bash
npm install react-native-iap
```

### 2. Verificar SKUs no código

Abra [services/googlePlayBilling.ts](../services/googlePlayBilling.ts:24) e confirme:

```typescript
export const SUBSCRIPTION_SKUS = Platform.select({
  android: [
    'monitora_mensal',      // ← Deve ser EXATAMENTE igual ao ID no Play Console
    'monitora_trimestral',  // ← Deve ser EXATAMENTE igual ao ID no Play Console
    'monitora_anual',       // ← Deve ser EXATAMENTE igual ao ID no Play Console
  ],
  default: [],
}) as string[];
```

### 3. Verificar package name

O **package name** do app deve ser o mesmo cadastrado no Play Console.

Verifique em `app.json`:

```json
{
  "expo": {
    "android": {
      "package": "com.stoneup.monitora"
    }
  }
}
```

⚠️ Se alterar o package name, os produtos não serão encontrados!

---

## 🔄 Como Funciona

### Fluxo de Compra

```
1. Usuário seleciona plano
   ↓
2. Usuário clica em "Comprar via Google Play"
   ↓
3. App chama googlePlayBilling.purchaseSubscription(sku)
   ↓
4. Google Play abre dialog nativo de pagamento
   ↓
5. Usuário confirma compra (senha, biometria, etc.)
   ↓
6. Google processa pagamento
   ↓
7. purchaseUpdatedListener recebe confirmação
   ↓
8. App valida com backend (opcional)
   ↓
9. App ativa assinatura local
   ↓
10. App chama finishTransaction() (acknowledgement)
   ↓
11. Assinatura ativada! 🎉
```

### Código Responsável

**Iniciar compra:**
```typescript
// app/checkout.tsx:164
const handleGooglePlayPayment = async () => {
  const result = await googlePlayBilling.purchaseSubscription(sku);
};
```

**Processar compra bem-sucedida:**
```typescript
// services/googlePlayBilling.ts:110
purchaseUpdatedListener(async (purchase) => {
  // 1. Valida com backend
  await validatePurchaseWithBackend(purchase);

  // 2. Ativa assinatura
  await subscriptionService.activateGooglePlaySubscription(...);

  // 3. Finaliza transação
  await finishTransaction({ purchase });
});
```

---

## 🧪 Teste em Produção

### 1. Gerar Build Assinado

```bash
# Android (AAB para Play Store)
eas build --platform android --profile production

# Ou APK local
cd android && ./gradlew assembleRelease
```

### 2. Fazer Upload para Play Console

1. Acesse **"Versão" → "Testes internos"**
2. Clique em **"Criar nova versão"**
3. Faça upload do APK/AAB
4. Salve e publique

### 3. Adicionar Testadores

1. Acesse **"Testes internos" → "Testadores"**
2. Clique em **"Criar lista de e-mails"**
3. Adicione os emails dos testadores (pode ser seu próprio email)
4. Copie o link de opt-in e envie para os testadores

### 4. Instalar via Play Store

⚠️ **CRÍTICO**: Você DEVE instalar via Play Store:

1. Testador acessa o link de opt-in
2. Aceita participar do teste
3. Instala o app pela Play Store
4. Agora pode testar compras!

### 5. Testar Compra

1. Abra o app
2. Vá em "Planos"
3. Selecione um plano
4. Clique em "Comprar via Google Play"
5. ✅ Se aparecer o dialog do Google Play → Configurado corretamente!
6. ❌ Se der erro → Veja [Troubleshooting](#-troubleshooting)

### 6. Testar sem Cobrar

Você pode adicionar contas de teste que NÃO são cobradas:

1. Play Console → **"Configuração" → "Testar licenças"**
2. Adicione emails de testadores
3. Essas contas podem fazer compras de teste GRATUITAS

---

## 🔧 Troubleshooting

### Erro: "Item not available for purchase"

**Causa:** Produto não ativado ou app não publicado

**Solução:**
1. Verifique se os produtos estão **ATIVOS** no Play Console
2. Verifique se fez upload de pelo menos uma versão (mesmo internal testing)
3. Aguarde 1-2 horas após ativar produtos (propagação)

### Erro: "This version of the application is not configured for billing through Google Play"

**Causa:** App não foi instalado via Play Store

**Solução:**
1. NÃO use `npm run android` ou `expo run:android`
2. Faça upload para Play Console (internal testing)
3. Instale via link de opt-in do Play Store

### Erro: "Product IDs not found"

**Causa:** SKUs no código diferem dos SKUs no Play Console

**Solução:**
1. Abra Play Console → Produtos
2. Copie os IDs EXATOS (case-sensitive!)
3. Cole em `services/googlePlayBilling.ts:24`
4. Rebuild o app

### Erro: "Package name mismatch"

**Causa:** Package name do app diferente do cadastrado no Play Console

**Solução:**
1. Verifique em `app.json` → `expo.android.package`
2. Deve ser EXATAMENTE igual ao Play Console
3. Se mudou, precisa criar novo app no Play Console

### Listener não dispara após compra

**Causa:** Transação anterior não foi finalizada

**Solução:**
```typescript
import { flushFailedPurchasesCachedAsPendingAndroid } from 'react-native-iap';

// Chame isso ao inicializar o app
await flushFailedPurchasesCachedAsPendingAndroid();
```

---

## 🔒 Backend - Validação de Compras

⚠️ **MUITO IMPORTANTE**: Em produção, SEMPRE valide compras no backend!

### Por que validar no backend?

Sem validação backend, usuários podem:
- Usar compras modificadas/hackeadas
- Resgatar compras sem pagar
- Compartilhar purchase tokens

### Como implementar

#### 1. Endpoint no Backend

Crie um endpoint que recebe o `purchaseToken`:

```typescript
// Backend (Node.js exemplo)
import { google } from 'googleapis';

app.post('/monitora/assinaturas/validate-google-play', async (req, res) => {
  const { productId, purchaseToken, packageName } = req.body;

  // Autentica com Google Play API
  const auth = new google.auth.GoogleAuth({
    keyFile: 'path/to/service-account.json',
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });

  const androidPublisher = google.androidpublisher({
    version: 'v3',
    auth,
  });

  try {
    // Valida a compra com Google
    const result = await androidPublisher.purchases.subscriptions.get({
      packageName,
      subscriptionId: productId,
      token: purchaseToken,
    });

    // Verifica se está ativa
    if (result.data.paymentState === 1) { // 1 = Paga
      // Salva no banco de dados
      await saveSubscription(userId, {
        productId,
        purchaseToken,
        expiryDate: result.data.expiryTimeMillis,
      });

      res.json({ valid: true });
    } else {
      res.json({ valid: false, error: 'Pagamento não confirmado' });
    }
  } catch (error) {
    res.status(500).json({ valid: false, error: error.message });
  }
});
```

#### 2. Chame do App

No app, já está preparado em [services/googlePlayBilling.ts:162](../services/googlePlayBilling.ts:162):

```typescript
private async validatePurchaseWithBackend(purchase: ProductPurchase): Promise<void> {
  // TODO: Descomente quando tiver backend

  const response = await api.post('/monitora/assinaturas/validate-google-play', {
    productId: purchase.productId,
    purchaseToken: purchase.purchaseToken,
    packageName: purchase.packageName,
    transactionId: purchase.transactionId,
  });

  if (!response.data.valid) {
    throw new Error('Compra inválida');
  }
}
```

#### 3. Configure Service Account

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um projeto (ou use existente)
3. Ative **Google Play Android Developer API**
4. Crie **Service Account**
5. Baixe JSON com credenciais
6. No Play Console, vá em **"Configuração" → "API access"**
7. Vincule o Service Account

---

## 📚 Recursos Adicionais

- [Documentação oficial react-native-iap](https://github.com/dooboolab-community/react-native-iap)
- [Google Play Billing Docs](https://developer.android.com/google/play/billing)
- [Google Play Developer API](https://developers.google.com/android-publisher)

---

## ✅ Checklist de Setup

Use este checklist para garantir que tudo está configurado:

### Play Console
- [ ] Conta Google Play Developer criada
- [ ] App criado no Play Console
- [ ] 3 produtos de assinatura criados (`monitora_mensal`, `monitora_trimestral`, `monitora_anual`)
- [ ] Produtos ativados
- [ ] APK/AAB enviado para internal testing
- [ ] Testadores adicionados
- [ ] Link de opt-in compartilhado

### Código
- [ ] `react-native-iap` instalado
- [ ] SKUs em `googlePlayBilling.ts` correspondem ao Play Console
- [ ] Package name correto em `app.json`
- [ ] Build assinado gerado

### Teste
- [ ] App instalado via Play Store (não via desenvolvimento)
- [ ] Dialog do Google Play aparece ao clicar em "Comprar"
- [ ] Compra é processada com sucesso
- [ ] Assinatura é ativada no app
- [ ] Listener `purchaseUpdatedListener` dispara

### Backend (Opcional mas Recomendado)
- [ ] Service Account criado no Google Cloud
- [ ] Google Play API ativada
- [ ] Endpoint de validação implementado
- [ ] Chamada de validação integrada no app

---

**Última atualização:** 2025-12-03
**Versão:** 1.0.0
**Autor:** Claude Code
