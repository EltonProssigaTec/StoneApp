# 🚨 CRASH FIX URGENTE - Checkout

**Problema:** App crashando ao entrar na tela de checkout

---

## ⚡ SOLUÇÃO RÁPIDA (5 min)

### 1. Rebuild e Reinstalar
```bash
.\quick-test-v74.bat
```

### 2. Testar Tela Simples

**No app:**
1. Abra o app
2. Digite na barra de navegação: `/test-checkout-simple`
3. OU adicione rota temporária no menu

**Você deve ver:**
- Tela com título "🧪 Teste Google Play Billing"
- Botões de teste

### 3. Clicar em "🔍 Executar Diagnóstico"

**Logs esperados:**
```
[TestCheckout] 🔵 Tela de teste carregada
[TestCheckout] 🔵 Tentando importar googlePlayBilling...
[TestCheckout] ✅ googlePlayBilling importado!
[TestCheckout] 🔵 Inicializando...
[GooglePlayBilling] 🔵 Iniciando conexão...
[GooglePlayBilling] ✅ Conexão estabelecida!
```

---

## 🔍 DIAGNÓSTICO DO CRASH

O erro "property is not configurable" geralmente é causado por:

1. **Problema com React Navigation/Expo Router**
   - Algum componente está tentando modificar property não configurável

2. **Problema com import circular**
   - googlePlayBilling pode estar causando import circular

3. **Problema com algum hook**
   - useAlert, useAuth, etc

---

## 🛠️ CORREÇÕES POSSÍVEIS

### Opção A: Usar Tela Simples (RECOMENDADO para teste)

1. **Adicionar rota no app/**
   ```bash
   # Mover arquivo
   move test-checkout-simple.tsx app\test-checkout-simple.tsx
   ```

2. **Acessar no app:**
   - Navegar para `/test-checkout-simple`

3. **Testar diagnóstico**

### Opção B: Corrigir Checkout Original

O problema pode estar em:

```typescript
// app/checkout.tsx linha 13
import googlePlayBilling from '@/services/googlePlayBilling';
```

**Solução:** Import condicional

```typescript
let googlePlayBilling: any = null;

useEffect(() => {
  // Import dinâmico
  if (Platform.OS === 'android') {
    try {
      googlePlayBilling = require('@/services/googlePlayBilling').default;
    } catch (error) {
      console.error('Erro ao importar googlePlayBilling:', error);
    }
  }
}, []);
```

### Opção C: Simplificar GooglePlayBilling

O problema pode ser no próprio arquivo `googlePlayBilling.ts`.

**Testar:**
1. Comentar todo conteúdo da classe
2. Exportar objeto vazio
3. Ver se checkout abre

---

## 📱 TESTE PASSO A PASSO

### 1. Verificar se app abre
```bash
.\quick-test-v74.bat
```

### 2. Testar tela simples

**Criar link temporário:**
Adicione no menu ou home:
```typescript
<Button onPress={() => router.push('/test-checkout-simple')}>
  Testar Billing
</Button>
```

### 3. Ver logs
```bash
.\ver-logs-billing.bat
```

### 4. Executar diagnóstico

No app, clicar em "🔍 Executar Diagnóstico"

**Sucesso esperado:**
```
[GooglePlayBilling] ✅ 2 produto(s) encontrado(s)!
```

---

## 🔧 DEBUG AVANÇADO

### Ver stack trace completo:
```bash
adb logcat | grep -A 50 "TypeError"
```

### Ver erro específico do checkout:
```bash
adb logcat | grep -E "(Checkout|checkout)"
```

### Limpar tudo e rebuild:
```bash
# 1. Limpar cache
npm start -- --clear

# 2. Limpar build
cd android
.\gradlew clean
cd ..

# 3. Rebuild completo
.\build-v74-fixed.bat
```

---

## ⚠️ SE NADA FUNCIONAR

### Criar versão mínima do checkout:

```typescript
// app/checkout-minimal.tsx
import React from 'react';
import { View, Text, Button, Alert } from 'react-native';

export default function MinimalCheckout() {
  const testBilling = async () => {
    try {
      // Import dinâmico
      const billing = require('@/services/googlePlayBilling').default;

      await billing.initBilling();
      const products = await billing.getAllSubscriptions();

      Alert.alert('Sucesso', `${products.length} produtos encontrados`);
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Checkout Mínimo</Text>
      <Button title="Testar Billing" onPress={testBilling} />
    </View>
  );
}
```

---

## 📊 CHECKLIST

### Antes de Testar:
- [ ] Rebuild feito: `.\quick-test-v74.bat`
- [ ] App instalado no dispositivo
- [ ] Logs rodando: `.\ver-logs-billing.bat`

### Durante Teste:
- [ ] App abre sem crash
- [ ] Navegar para tela de teste
- [ ] Clicar em diagnóstico
- [ ] Ver logs no terminal

### Resultado Esperado:
- [ ] ✅ App não crasha
- [ ] ✅ Logs mostram GooglePlayBilling
- [ ] ✅ Produtos encontrados (2)
- [ ] ✅ Compra abre tela Google Play

---

## 🆘 ÚLTIMA OPÇÃO

Se NADA funcionar:

1. **Desabilitar Google Play Billing temporariamente**

```typescript
// services/googlePlayBilling.ts
// Comentar TUDO e exportar mock:

export default {
  initBilling: async () => false,
  getAllSubscriptions: async () => [],
  getSubscriptionProduct: async () => null,
  purchaseSubscription: async () => ({ success: false, error: 'Not implemented' }),
  disconnect: async () => {},
  runDiagnostics: async () => {},
  get available() { return false; },
  get initialized() { return false; },
};
```

2. **Testar se checkout abre**

3. **Reativar billing aos poucos**

---

## 💡 PRÓXIMOS PASSOS

1. ✅ Execute `.\quick-test-v74.bat`
2. ✅ Navegue para `/test-checkout-simple`
3. ✅ Clique em "Executar Diagnóstico"
4. ✅ Me envie os logs completos

**Com os logs, vou identificar o problema exato! 🔍**

---

**Criado em:** 08/12/2025
**Versão:** 74
**Status:** Debugging crash no checkout
