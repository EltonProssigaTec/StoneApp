# 🔧 Correções - react-native-iap no Expo

## ❌ Problema Original

```bash
ERROR  [Error: Failed to get NitroModules: The native "NitroModules"
Turbo/Native-Module could not be found.
```

**Causa:** `react-native-iap` usa módulos nativos que **NÃO funcionam no Expo Go**.

---

## ✅ Solução Implementada

### 1. Import Condicional

Modificado [services/googlePlayBilling.ts](../services/googlePlayBilling.ts) para fazer import condicional:

```typescript
// ❌ ANTES (quebrava no Expo Go)
import {
  initConnection,
  endConnection,
  // ...
} from 'react-native-iap';

// ✅ DEPOIS (funciona em Expo Go e em builds nativos)
let RNIap: any = null;
let initConnection: any = null;

try {
  RNIap = require('react-native-iap');
  initConnection = RNIap.initConnection;
  // ...
} catch (error) {
  console.warn('[GooglePlay] react-native-iap não disponível (Expo Go)');
}
```

### 2. Verificação Antes de Usar

```typescript
async initialize(): Promise<boolean> {
  if (!initConnection) {
    console.warn('[GooglePlay] react-native-iap não disponível');
    return false; // Retorna false, mas NÃO quebra o app
  }

  // Continua normalmente...
}
```

### 3. Rota "ofertas" Removida

Comentada a aba "OFERTAS" em [app/(tabs)/_layout.tsx](../app/(tabs)/_layout.tsx:57) porque o arquivo `ofertas.tsx` não existe.

---

## 🚀 Como Funciona Agora

### No Expo Go (Desenvolvimento)

- ✅ App **NÃO quebra**
- ⚠️ Google Play IAP **NÃO funciona** (esperado)
- ✅ Outros métodos funcionam (PIX, Cartão, Boleto)
- ✅ Aparece warning no console, mas não é erro

### Em Build Nativo (Produção)

- ✅ App funciona normalmente
- ✅ Google Play IAP **FUNCIONA** perfeitamente
- ✅ Todos os métodos disponíveis

---

## 📱 Como Testar Google Play IAP

### Opção 1: EAS Build (Recomendado)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Build para Android
eas build --platform android --profile preview

# Ou build local
eas build --platform android --profile preview --local
```

### Opção 2: Expo Prebuild

```bash
# Gera pasta android/ios nativas
npx expo prebuild

# Roda no Android
npx expo run:android

# Agora react-native-iap funciona!
```

### Opção 3: Development Build

```bash
# Build de desenvolvimento
eas build --platform android --profile development

# Instala no device
# Agora pode usar Expo CLI com módulos nativos
```

---

## 🎯 Quando Usar Cada Método

| Cenário | Método Recomendado |
|---------|-------------------|
| Desenvolvimento rápido | Expo Go (Google Play desabilitado) |
| Testar Google Play IAP | EAS Build ou Prebuild |
| Publicar na Play Store | EAS Build (production) |
| CI/CD | EAS Build |

---

## 📊 Status dos Métodos de Pagamento

### ✅ Funcionam no Expo Go

- ✅ **PIX Direto** - Gera QR Code com sua chave
- ✅ **Cartão de Crédito** - Simulação/integração com gateway
- ✅ **Boleto** - Geração via API

### ⚠️ Requer Build Nativo

- ⚠️ **Google Play IAP** - Só em build nativo Android
- ⚠️ **Apple IAP** - Só em build nativo iOS (quando implementado)

---

## 🐛 Troubleshooting

### Warning: "react-native-iap não disponível"

**Normal!** Isso aparece quando roda no Expo Go.

**Solução:** Ignore o warning ou faça build nativo para testar.

### Erro: "Module not found: react-native-iap"

**Causa:** Pacote não está instalado.

**Solução:**
```bash
npm install react-native-iap
```

### Google Play não aparece no checkout

**Causa:** Rodando no iOS ou Web

**Esperado:** Google Play só aparece em `Platform.OS === 'android'`

### Google Play aparece mas dá erro ao clicar

**Causa:** Rodando no Expo Go

**Solução:** Faça build nativo com `npx expo prebuild` ou `eas build`

---

## 📚 Referências

- [react-native-iap Docs](https://github.com/dooboolab-community/react-native-iap)
- [Expo Prebuild](https://docs.expo.dev/workflow/prebuild/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Google Play Setup](./GOOGLE_PLAY_SETUP.md)

---

**Última atualização:** 2025-12-03
**Status:** ✅ Corrigido
