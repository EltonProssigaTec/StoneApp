# 🔧 Fix - API react-native-iap v14

## ❌ Erros Anteriores

### Erro 1: `undefined is not a function` (requestSubscription)
Resolvido com fallback: `RNIap.requestSubscription || RNIap.requestPurchase`

### Erro 2: `Missing purchase request configuration`
A API v14 requer `offerToken` em `subscriptionOffers`

### Erro 3: `undefined is not a function` (getSubscriptions)
A API v14 renomeou `getSubscriptions` para `getProducts`

## 🔍 Causa
O `react-native-iap` v14 mudou a API de compras de assinaturas no Android:

1. `getSubscriptions()` → renomeado para `getProducts()`
2. `requestSubscription()` → agora requer estrutura diferente com `offerToken`
3. Obrigatório extrair `offerToken` de `subscriptionOfferDetails`

## ✅ Solução Implementada

### Imports com fallback:
```typescript
// Suporte para API v14 e versões antigas
getProducts = RNIap.getProducts;
getSubscriptions = RNIap.getSubscriptions || RNIap.getProducts;
requestSubscription = RNIap.requestSubscription || RNIap.requestPurchase;
```

### Antes (API antiga):
```typescript
await requestSubscription({ sku });
```

### Depois (API v14+):
```typescript
// 1. Buscar produto (usa getProducts ou getSubscriptions)
const fetchProducts = getProducts || getSubscriptions;
const products = await fetchProducts({ skus: [sku] });
const product = products[0];

// 2. Extrair offerToken
const offerToken = product.subscriptionOfferDetails[0]?.offerToken || '';

// 3. Fazer compra com offerToken
await requestSubscription({
  sku,
  subscriptionOffers: [{
    sku,
    offerToken,
  }]
});
```

## 📋 Arquivo Modificado
- [services/googlePlayBilling.ts](services/googlePlayBilling.ts) - Método `purchaseSubscription()`

## 🚀 Como Testar

### 1. Rebuild do App
Execute o script de rebuild:
```bash
rebuild-android.bat
```

Ou manualmente:
```bash
cd android
gradlew clean
gradlew assembleRelease
cd ..
adb uninstall br.com.stoneup.monitora.app
adb install android\app\build\outputs\apk\release\app-release.apk
```

### 2. Monitorar Logs
```bash
ver-logs-billing.bat
```

### 3. Testar no App
1. Abrir app
2. Ir em **Planos**
3. Selecionar um plano
4. Clicar em **ASSINAR PLANO**
5. Selecionar **Google Play**
6. Clicar em **Comprar via Google Play**

## 📊 Logs Esperados

Agora você deve ver:
```
[GooglePlayBilling] 🔵 Buscando ofertas disponíveis para SKU: br.com.stoneup.monitora.app.monitora
[GooglePlayBilling] 🔵 Produtos encontrados: 1
[GooglePlayBilling] 🔵 Produto selecionado: { productId: ..., subscriptionOfferDetails: 1 }
[GooglePlayBilling] 🔵 Chamando requestSubscription com offerToken: ABC123...
[GooglePlayBilling] ✅ Fluxo de compra iniciado com sucesso!
```

E a **tela do Google Play deve abrir! 🎉**

## 🔗 Referências
- [react-native-iap v14 Changelog](https://github.com/dooboolab-community/react-native-iap/releases/tag/14.0.0)
- [Google Play Billing API v5+](https://developer.android.com/google/play/billing)
- [Subscription Offers Documentation](https://developer.android.com/google/play/billing/subscriptions#offers)

## ⚠️ Observações

1. **offerToken** é obrigatório na API v14+ para Android
2. Cada assinatura no Google Play Console pode ter múltiplas **ofertas** (base, trial, desconto, etc.)
3. Estamos usando a primeira oferta disponível (`[0]`), que geralmente é a oferta base
4. Se você criar ofertas especiais (ex: 7 dias grátis), precisará selecionar o `offerToken` correto

## 📝 Próximos Passos

Após este fix funcionar:
- [ ] Testar compra completa (confirmar pagamento)
- [ ] Verificar se `purchaseUpdatedListener` recebe callback
- [ ] Confirmar ativação da assinatura localmente
- [ ] Implementar validação com backend
- [ ] Adicionar seleção de ofertas múltiplas (se necessário)
