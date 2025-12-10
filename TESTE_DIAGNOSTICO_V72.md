# 🔬 TESTE DIAGNÓSTICO - Versão 72

## 🎯 Objetivo

Testar se os produtos ORIGINAIS (`com.stoneativos.monitoraapp.*`) funcionam, o que nos dirá se:
1. ✅ O sistema de billing está funcional
2. ❓ Os produtos "Real" (`br.com.stoneup.monitora.app.*`) precisam de mais tempo de propagação
3. ❓ Há algum problema de configuração com os produtos "Real"

## 📝 O Que Foi Feito

### Versão 71 (não funcionou)
- **Package name:** `br.com.stoneup.monitora.app`
- **Product IDs:** `br.com.stoneup.monitora.app.*`
- **Resultado:** ❌ fetchProducts() retornou array vazio
- **Status:** Produtos ATIVOS no console, mas não aparecem

### Versão 72 (teste diagnóstico)
- **Package name:** `com.stoneativos.monitoraapp`
- **Product IDs:** `com.stoneativos.monitoraapp.*`
- **Objetivo:** Verificar se estes produtos funcionam

## 🔧 Mudanças Aplicadas

### [services/googlePlayBilling.ts](services/googlePlayBilling.ts)

**Revertido para:**
```typescript
export const SUBSCRIPTION_PRODUCT_IDS = Platform.select({
  android: [
    'com.stoneativos.monitoraapp.monitora',      // ✅ Produtos originais
    'com.stoneativos.monitoraapp.stoneupplus',   // ✅ Produtos originais
  ],
  default: [],
}) as string[];

const PLAN_TO_GOOGLE_PLAY = {
  'monthly': {
    productId: 'com.stoneativos.monitoraapp.monitora',
    basePlanId: 'monitora-01'
  },
  'quarterly': {
    productId: 'com.stoneativos.monitoraapp.monitora',
    basePlanId: 'monitora-02'
  },
  'annual': {
    productId: 'com.stoneativos.monitoraapp.stoneupplus',
    basePlanId: 'monitora-anual-01'
  },
};

const PRODUCT_ID_TO_PLAN_ID = {
  'com.stoneativos.monitoraapp.monitora': 'monthly',
  'com.stoneativos.monitoraapp.stoneupplus': 'annual',
};
```

### [app.json](app.json)

**Revertido para:**
```json
"android": {
  "package": "com.stoneativos.monitoraapp",
  "versionCode": 72,
```

## 🚀 Como Testar

### 1. Build em andamento
```bash
# Build da v72 está sendo gerado agora
# Aguarde finalizar...
```

### 2. Instalar APK v72
```bash
# Desinstalar versão antiga
adb uninstall com.stoneativos.monitoraapp

# Instalar v72
adb install android\app\build\outputs\apk\release\app-release.apk

# Limpar cache do Play Store
adb shell pm clear com.android.vending
```

### 3. Testar Produtos
```bash
# Terminal 1 - Ver logs
.\ver-logs-billing.bat
```

No app:
1. Planos → Selecionar plano
2. Checkout → Google Play
3. Clique em "🔍 Executar Diagnóstico Completo"

## 📊 Resultados Esperados

### ✅ CENÁRIO 1: Produtos originais FUNCIONAM

**Logs esperados:**
```
[GooglePlayBilling] ✅ 2 produto(s) encontrado(s)!

Produto 1:
  - Product ID: com.stoneativos.monitoraapp.monitora
  - Title: Monitora Mensal
  - Price: R$ XX,XX
  - Base Plans: 2

Produto 2:
  - Product ID: com.stoneativos.monitoraapp.stoneupplus
  - Title: Monitora Anual
  - Price: R$ XX,XX
  - Base Plans: 1
```

**Conclusão:**
- ✅ Sistema de billing está OK
- ⚠️ Produtos "Real" (`br.com.stoneup.monitora.app.*`) têm problema:
  - Podem precisar de 1-2 horas para propagar, OU
  - Podem não estar salvos corretamente no console, OU
  - Podem ter um erro de configuração

**Próximos passos:**
1. Confirmar qual package name você quer usar definitivamente
2. Se for `br.com.stoneup.monitora.app`:
   - Aguardar mais 1-2 horas
   - Verificar configuração dos produtos "Real" no console
   - Republicar trilha de teste
3. Se for `com.stoneativos.monitoraapp`:
   - Manter v72 e publicar

---

### ❌ CENÁRIO 2: Produtos originais TAMBÉM NÃO FUNCIONAM

**Logs esperados:**
```
[GooglePlayBilling] ❌ 0 produto(s) encontrado(s)
```

**Conclusão:**
- ❌ Problema não é com os produtos específicos
- Possíveis causas:
  1. Package name do app no Google Play Console é diferente
  2. App não está publicado em trilha de teste
  3. Conta não é testadora
  4. Produtos não estão ATIVOS (estão em Rascunho)

**Próximos passos:**
1. Verificar package name no Google Play Console:
   - Configuração → Detalhes do app → ID do app
2. Verificar trilha de teste:
   - Testes → Teste interno → Verificar versão publicada
3. Verificar testador:
   - Testes → Teste interno → Testadores → Confirmar seu email
4. Verificar produtos:
   - Monetização → Produtos → Assinaturas → Verificar STATUS = ATIVO

## 🔍 Informações Importantes

### Produtos no Google Play Console

Você tem **2 conjuntos** de produtos:

#### Conjunto 1 - `com.stoneativos.monitoraapp.*` (TESTANDO AGORA)
1. `com.stoneativos.monitoraapp.monitora` ✅ ATIVO
   - Base Plans: `monitora-01`, `monitora-02`
2. `com.stoneativos.monitoraapp.stoneupplus` ✅ ATIVO
   - Base Plan: `monitora-anual-01`

#### Conjunto 2 - `br.com.stoneup.monitora.app.*` (NÃO FUNCIONOU)
1. `br.com.stoneup.monitora.app.monitora` ✅ ATIVO
   - Base Plans: `monitora-01`, `monitora-02`
2. `br.com.stoneup.monitora.app.stoneupplus` ✅ ATIVO
   - Base Plan: `monitora-anual-01`

### ⚠️ Qual Package Name Usar?

**Opção A: `com.stoneativos.monitoraapp`**
- ✅ Se os produtos deste package funcionarem no teste
- ✅ Mais rápido (sem espera de propagação)
- ❌ Nome do package é menos profissional

**Opção B: `br.com.stoneup.monitora.app`**
- ✅ Nome do package mais profissional
- ✅ Já foi publicado no Play Store (v71)
- ❌ Produtos não funcionaram ainda (pode ser propagação)
- ⚠️ Requer aguardar 1-2 horas + debug

## 📱 Compatibilidade

### Se mudar o package name:
- ❌ Usuários com v71 instalada NÃO receberão atualização automática
- ✅ Terão que desinstalar e instalar novamente
- ⚠️ Perderão dados locais (cache, configurações)

### Se manter o package name:
- ✅ Atualizações automáticas funcionam
- ✅ Dados preservados
- ✅ Melhor experiência para o usuário

## 🎯 Recomendação Final

**Depois do teste v72:**

1. **Se produtos originais funcionarem:**
   - Decida qual package name usar definitivamente
   - Publique apenas 1 versão com o package escolhido
   - Delete o conjunto de produtos não usado no console

2. **Se produtos originais NÃO funcionarem:**
   - Foque em resolver o problema no Google Play Console
   - Verifique: package name, trilha de teste, testadores, status dos produtos

---

**⏳ Status atual:** Aguardando build v72 finalizar
**📍 Próximo passo:** Instalar e testar APK v72
