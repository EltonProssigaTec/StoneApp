# 🔧 SOLUÇÕES POR CENÁRIO - Google Play Billing

Este documento contém soluções detalhadas para cada cenário possível.

---

## 🎯 CENÁRIO 1: Produtos não foram criados no Google Play Console

### Como identificar:
- Ao acessar **Monetização** → **Produtos** → **Assinaturas** no Google Play Console
- NÃO aparece nenhum produto OU
- Não aparecem os produtos com IDs: `com.stoneativos.monitoraapp.monitora` e `com.stoneativos.monitoraapp.stoneupplus`

### Solução: Criar os produtos

#### Produto 1: Monitora (Mensal + Trimestral)

1. Acesse: Google Play Console → **Monetização** → **Produtos** → **Assinaturas**
2. Clique em **"Criar assinatura"**
3. Preencha:
   ```
   Product ID: com.stoneativos.monitoraapp.monitora
   Nome: Monitora
   Descrição: Assinatura do aplicativo Monitora para monitoramento de CPF
   ```

4. Adicionar **Base Plan 1** (Mensal):
   ```
   Base Plan ID: monitora-01
   Período de cobrança: Mensal (1 mês)
   Preço: R$ 14,99
   ```

5. Adicionar **Base Plan 2** (Trimestral):
   ```
   Base Plan ID: monitora-02
   Período de cobrança: A cada 3 meses
   Preço: R$ 39,99
   ```

6. **Salvar** e **ATIVAR** o produto

#### Produto 2: StoneUP Plus (Anual)

1. Clique em **"Criar assinatura"** novamente
2. Preencha:
   ```
   Product ID: com.stoneativos.monitoraapp.stoneupplus
   Nome: StoneUP Plus
   Descrição: Assinatura premium anual do aplicativo Monitora
   ```

3. Adicionar **Base Plan**:
   ```
   Base Plan ID: monitora-anual-01
   Período de cobrança: Anual (12 meses)
   Preço: R$ 149,99
   ```

4. **Salvar** e **ATIVAR** o produto

### Tempo de propagação:
- **1 a 2 horas** após ativar os produtos

### Teste após criação:
```bash
# Limpar cache
adb shell pm clear com.android.vending

# Aguardar 1-2 horas, depois testar no app
```

---

## 🎯 CENÁRIO 2: Produtos existem mas estão em RASCUNHO

### Como identificar:
- Produtos aparecem no Google Play Console
- Status está como **"Rascunho"** ou **"Draft"**

### Por que isso é um problema:
- Produtos em rascunho **NÃO são retornados** pela API `fetchProducts()`
- Somente produtos **ATIVOS** aparecem para compra

### Solução: Ativar os produtos

1. Acesse: **Monetização** → **Produtos** → **Assinaturas**
2. Para cada produto:
   - Clique no produto
   - Verifique se todos os campos obrigatórios estão preenchidos:
     - Nome ✓
     - Descrição ✓
     - Base Plans configurados ✓
     - Preços definidos ✓
   - Clique em **"Ativar"** ou **"Publicar"**

### Tempo de propagação:
- **1 a 2 horas** após ativar

### Teste após ativação:
```bash
# Limpar cache
adb shell pm clear com.android.vending

# Aguardar 1-2 horas, depois testar
```

---

## 🎯 CENÁRIO 3: Package Name está diferente

### Como identificar:
Execute no terminal:
```bash
adb shell pm list packages | findstr stone
```

Se retornar algo diferente de `com.stoneativos.monitoraapp`, como:
- `br.com.stoneup.monitora.app`
- Ou qualquer outro package

### Por que isso é um problema:
- Os Product IDs devem começar com o package name do app
- Se o app é `br.com.stoneup.monitora.app`, os produtos devem ser:
  - `br.com.stoneup.monitora.app.monitora`
  - `br.com.stoneup.monitora.app.stoneupplus`

### Solução A: Corrigir package name no app (RECOMENDADO)

Se você quer manter `com.stoneativos.monitoraapp`:

1. Editar [app.json](app.json#L29):
   ```json
   "android": {
     "package": "com.stoneativos.monitoraapp",
     "versionCode": 71
   }
   ```

2. Rebuild:
   ```bash
   npx expo prebuild --clean
   .\gradlew clean
   .\gradlew assembleRelease
   ```

3. Reinstalar:
   ```bash
   adb uninstall com.stoneativos.monitoraapp
   adb install android\app\build\outputs\apk\release\app-release.apk
   ```

### Solução B: Atualizar Product IDs no código

Se o package correto for outro (ex: `br.com.stoneup.monitora.app`):

1. Editar [services/googlePlayBilling.ts](services/googlePlayBilling.ts#L91-L96):
   ```typescript
   export const SUBSCRIPTION_PRODUCT_IDS = Platform.select({
     android: [
       'br.com.stoneup.monitora.app.monitora',      // Package correto
       'br.com.stoneup.monitora.app.stoneupplus',
     ],
     default: [],
   }) as string[];
   ```

2. Atualizar mapeamentos (linha 102-115):
   ```typescript
   const PLAN_TO_GOOGLE_PLAY: Record<string, { productId: string; basePlanId: string }> = {
     'monthly': {
       productId: 'br.com.stoneup.monitora.app.monitora',
       basePlanId: 'monitora-01'
     },
     'quarterly': {
       productId: 'br.com.stoneup.monitora.app.monitora',
       basePlanId: 'monitora-02'
     },
     'annual': {
       productId: 'br.com.stoneup.monitora.app.stoneupplus',
       basePlanId: 'monitora-anual-01'
     },
   };
   ```

3. Atualizar mapeamento inverso (linha 121-124):
   ```typescript
   const PRODUCT_ID_TO_PLAN_ID: Record<string, string> = {
     'br.com.stoneup.monitora.app.monitora': 'monthly',
     'br.com.stoneup.monitora.app.stoneupplus': 'annual',
   };
   ```

4. Criar os produtos no Google Play Console com os novos IDs

5. Rebuild e testar

---

## 🎯 CENÁRIO 4: App não publicado em trilha de teste

### Como identificar:
- Acesse: **Testes** → **Teste interno**
- NÃO tem nenhuma versão publicada OU
- Tem versão mas status não é "Disponível para testadores"

### Por que isso é um problema:
- Produtos de assinatura só funcionam com apps publicados em teste ou produção
- Apps em debug/desenvolvimento não conseguem acessar produtos reais

### Solução: Publicar na trilha de teste

#### Se já fez upload mas não publicou:
1. **Testes** → **Teste interno**
2. Clique na versão (deve ter versionCode 70)
3. Clique em **"Revisar versão"**
4. Revise todas as informações
5. Clique em **"Iniciar lançamento para teste interno"**

#### Se ainda não fez upload:
1. Gerar o bundle:
   ```bash
   .\gradlew bundleRelease
   ```

2. Bundle estará em:
   ```
   android\app\build\outputs\bundle\release\app-release.aab
   ```

3. No Google Play Console:
   - **Testes** → **Teste interno** → **Criar nova versão**
   - Upload do `.aab` file
   - Preencher notas de versão
   - **"Revisar versão"** → **"Iniciar lançamento"**

### Tempo de propagação:
- **1 a 2 horas** após publicar

---

## 🎯 CENÁRIO 5: Conta não é testadora

### Como identificar:
- Acesse: **Testes** → **Teste interno** → **Testadores**
- Seu email **NÃO** está na lista

### Por que isso é um problema:
- Somente testadores autorizados podem comprar produtos em teste
- Usuários não autorizados não veem os produtos

### Solução: Adicionar como testador

#### Adicionar testador:
1. **Testes** → **Teste interno** → **Testadores**
2. Opção A - Email direto:
   - Cole seu email na caixa
   - Clique em **"Salvar alterações"**

3. Opção B - Google Groups:
   - Crie um grupo no Google Groups
   - Adicione seu email ao grupo
   - Adicione o grupo como testador

#### Aceitar convite (opt-in):
1. Copie o **"Link de opt-in"** que aparece na página de testadores
2. Abra o link no **navegador do dispositivo** (mesma conta Gmail)
3. Clique em **"Tornar-me testador"**
4. Aguarde alguns minutos

### Tempo de propagação:
- **5 a 10 minutos** após aceitar opt-in

### Verificar no dispositivo:
```bash
# Limpar cache
adb shell pm clear com.android.vending

# Abrir Play Store
adb shell am start -a android.intent.action.VIEW -d "market://details?id=com.stoneativos.monitoraapp"
```

Deve aparecer "Você é um testador beta" no topo.

---

## 🎯 CENÁRIO 6: Cache do Google Play Store

### Como identificar:
- Tudo configurado corretamente
- Mas ainda não encontra produtos

### Solução: Limpar cache completo

```bash
# Parar Play Store
adb shell am force-stop com.android.vending

# Limpar cache
adb shell pm clear com.android.vending

# Limpar dados do app
adb shell pm clear com.stoneativos.monitoraapp

# Reiniciar dispositivo (recomendado)
adb reboot
```

Aguarde o dispositivo reiniciar e teste novamente.

---

## 🎯 CENÁRIO 7: Base Plan IDs incorretos

### Como identificar:
- Produtos são encontrados no `fetchProducts()`
- Mas ao tentar comprar, erro: "Base plan não encontrado"

Nos logs:
```
[GooglePlayBilling] ❌ Base plan não encontrado: monitora-01
```

### Solução: Verificar e corrigir Base Plan IDs

1. No Google Play Console:
   - **Monetização** → **Produtos** → Clique no produto
   - Veja os **Base Plans** configurados
   - Anote os IDs exatos

2. No código, ajustar [services/googlePlayBilling.ts](services/googlePlayBilling.ts#L102-L115):
   ```typescript
   const PLAN_TO_GOOGLE_PLAY = {
     'monthly': {
       productId: 'com.stoneativos.monitoraapp.monitora',
       basePlanId: 'SEU_BASE_PLAN_ID_REAL'  // Usar o ID real do console
     },
     // ...
   };
   ```

---

## 📊 CHECKLIST de Verificação Completa

Antes de me reportar o problema, verifique:

### Google Play Console
- [ ] Package name = `com.stoneativos.monitoraapp`
- [ ] Produto 1 existe e está **ATIVO**
- [ ] Produto 2 existe e está **ATIVO**
- [ ] Base Plans configurados corretamente
- [ ] Trilha de teste tem versão **PUBLICADA**
- [ ] Versão publicada tem versionCode 70+
- [ ] Meu email está como testador
- [ ] Aceitei o convite de teste (opt-in)

### Dispositivo
- [ ] App instalado tem versionCode 70+
- [ ] Package name instalado está correto
- [ ] Usando mesma conta Gmail que é testadora
- [ ] Cache do Play Store foi limpo
- [ ] Aparece "testador beta" no Play Store

### Código
- [ ] Product IDs correspondem ao package name
- [ ] Base Plan IDs correspondem aos do console
- [ ] react-native-iap instalado (`node_modules` presente)

---

## 🚀 Script de Teste Completo

Execute este conjunto de comandos para verificar tudo:

```bash
# 1. Verificar configuração
.\diagnostico-completo.bat

# 2. Limpar cache
adb shell pm clear com.android.vending
adb shell pm clear com.stoneativos.monitoraapp

# 3. Abrir app e ver logs
start .\ver-logs-billing.bat

# 4. Abrir app no dispositivo
adb shell monkey -p com.stoneativos.monitoraapp -c android.intent.category.LAUNCHER 1

# 5. No app: Planos → Checkout → Google Play → Diagnóstico Completo
```

---

**💡 Dica Final:** 90% dos casos são **Cenário 1** (produtos não criados) ou **Cenário 2** (produtos em rascunho).

Verifique primeiro esses dois antes de tentar outras soluções!
