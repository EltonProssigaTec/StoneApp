# 🎯 GUIA DE TESTE FINAL - Google Play Billing

## 📋 O Problema

Seu app está retornando **array vazio** ao buscar produtos do Google Play:
```
[GooglePlayBilling] Resposta do fetchProducts: { length: 0, productIds: [] }
```

Isso significa que a **conexão com Google Play funciona**, mas os **produtos não foram encontrados**.

## 🔍 PASSO 1: Executar Diagnóstico Completo

### 1.1 Execute o script de diagnóstico
```bash
.\diagnostico-completo.bat
```

Anote os resultados:
- [ ] Package name instalado
- [ ] Version code instalado
- [ ] Permissão BILLING está presente

### 1.2 Abra o app e execute diagnóstico in-app
1. Abra o app no dispositivo
2. Vá para a tela de **Planos**
3. Selecione qualquer plano (ex: Mensal)
4. Na tela de **Checkout**, selecione **"Google Play"**
5. Clique no botão azul: **"🔍 Executar Diagnóstico Completo"**

### 1.3 Capture os logs completos
Em outro terminal:
```bash
.\ver-logs-billing.bat
```

Deixe rodando e execute o diagnóstico. Copie TODOS os logs.

## ✅ PASSO 2: Verificar Google Play Console

### 2.1 Acessar Console
1. Acesse: https://play.google.com/console
2. Selecione o app **"Monitora"** ou **"StoneUP"**

### 2.2 Verificar Package Name
1. Menu: **Configuração** → **Detalhes do app**
2. Procure: **"ID do aplicativo"**
3. **Deve ser:** `com.stoneativos.monitoraapp`

**❓ Se for diferente:**
- Anote qual é o package name real
- Os Product IDs precisam começar com esse package name

### 2.3 Verificar Produtos (CRÍTICO!)
1. Menu: **Monetização** → **Produtos** → **Assinaturas**
2. Procure pelos produtos:

#### Produto 1: Monitora
- **Product ID esperado:** `com.stoneativos.monitoraapp.monitora`
- **Status:** Deve estar **ATIVO** (não "Rascunho" ou "Inativo")
- **Base Plans:** Deve ter 2 planos
  - `monitora-01` (mensal)
  - `monitora-02` (trimestral)

#### Produto 2: StoneUP Plus
- **Product ID esperado:** `com.stoneativos.monitoraapp.stoneupplus`
- **Status:** Deve estar **ATIVO**
- **Base Plans:** Deve ter 1 plano
  - `monitora-anual-01` (anual)

**🚨 IMPORTANTE:**
- Produtos em **"Rascunho"** NÃO aparecem no `fetchProducts`!
- Eles precisam estar **ATIVOS**

### 2.4 Verificar Trilha de Teste
1. Menu: **Testes** → **Teste interno** (ou Closed Testing)
2. Verifique:
   - [ ] Existe uma versão publicada?
   - [ ] Qual é o **versionCode** da versão publicada?
   - [ ] Status é **"Disponível para testadores"**?

**❓ Se não tem versão publicada:**
1. Faça upload do APK/AAB (já foi feito - versionCode 70)
2. Clique em **"Revisar versão"**
3. Clique em **"Iniciar lançamento para teste interno"**
4. Aguarde 1-2 horas para propagar

### 2.5 Verificar Testadores
1. Menu: **Testes** → **Teste interno** → Aba **"Testadores"**
2. Verifique:
   - [ ] Seu email está na lista?
   - [ ] Se usar Google Groups, você está no grupo?

3. **Link de opt-in:**
   - Copie o link de opt-in (aparece na página)
   - Abra no navegador do dispositivo (mesma conta Gmail)
   - Clique em **"Tornar-me testador"**

## 🔧 PASSO 3: Cenários e Soluções

### Cenário A: Produtos NÃO EXISTEM no Console
**Sintoma:** Não encontrou os produtos na seção Monetização

**Solução:** Criar os produtos
1. **Monetização** → **Produtos** → **Assinaturas** → **"Criar assinatura"**
2. Produto 1:
   - Product ID: `com.stoneativos.monitoraapp.monitora`
   - Nome: "Monitora"
   - Descrição: "Assinatura do Monitora"

3. Adicionar Base Plans:
   - Base Plan 1:
     - ID: `monitora-01`
     - Período: Mensal
     - Preço: R$ 14,99
   - Base Plan 2:
     - ID: `monitora-02`
     - Período: Trimestral
     - Preço: R$ 39,99

4. Produto 2:
   - Product ID: `com.stoneativos.monitoraapp.stoneupplus`
   - Nome: "StoneUP Plus"
   - Base Plan ID: `monitora-anual-01`
   - Período: Anual
   - Preço: R$ 149,99

5. **ATIVAR** os produtos (não deixar em rascunho)

### Cenário B: Produtos EXISTEM mas estão em RASCUNHO
**Sintoma:** Produtos aparecem no console mas com status "Rascunho"

**Solução:**
1. Abra cada produto
2. Clique em **"Ativar"** ou **"Publicar"**
3. Aguarde até 1 hora para propagar

### Cenário C: Package Name DIFERENTE
**Sintoma:** O ID do app no console é `br.com.stoneup.monitora.app` (ou outro)

**Solução:** Atualizar Product IDs no código

Se o package name real for `br.com.stoneup.monitora.app`, precisa alterar o código:

```typescript
// Em services/googlePlayBilling.ts, linha 91
export const SUBSCRIPTION_PRODUCT_IDS = Platform.select({
  android: [
    'br.com.stoneup.monitora.app.monitora',      // Use o package correto!
    'br.com.stoneup.monitora.app.stoneupplus',
  ],
  default: [],
}) as string[];
```

E também atualizar os mapeamentos (linha 103-115).

### Cenário D: App NÃO PUBLICADO em trilha de teste
**Sintoma:** Não tem versão disponível em Teste Interno

**Solução:**
1. Teste Interno → Criar nova versão
2. Upload do APK (versionCode 70)
3. **"Revisar versão"** → **"Iniciar lançamento"**
4. Aguardar 1-2 horas

### Cenário E: Conta NÃO É TESTADORA
**Sintoma:** Não está na lista de testadores

**Solução:**
1. Adicionar email na lista de testadores
2. Abrir link de opt-in no dispositivo
3. Aceitar ser testador
4. Aguardar alguns minutos

## 🎬 PASSO 4: Testar Novamente

Após fazer as correções:

### 4.1 Limpar cache
```bash
# Limpar cache do Play Store
adb shell pm clear com.android.vending

# Reiniciar o app
adb shell am force-stop com.stoneativos.monitoraapp
```

### 4.2 Aguardar propagação
- Produtos novos/ativados: 1-2 horas
- Trilha de teste publicada: 1-2 horas
- Testador adicionado: 5-10 minutos

### 4.3 Testar compra
1. Abra o app
2. Vá para Planos → Selecione um plano
3. Checkout → Google Play
4. Clique em **"🔍 Executar Diagnóstico Completo"**
5. Verifique os logs

**Espera-se ver:**
```
[GooglePlayBilling] ✅ 2 produto(s) encontrado(s)!
Produto 1:
  - Product ID: com.stoneativos.monitoraapp.monitora
  - Title: Monitora
  - Price: R$ 14,99
```

## 📊 CHECKLIST FINAL

Antes de me enviar os resultados, verifique:

### Google Play Console
- [ ] Package name = `com.stoneativos.monitoraapp` (ou anotou o correto)
- [ ] Produto `monitora` existe e está ATIVO
- [ ] Produto `stoneupplus` existe e está ATIVO
- [ ] Base Plans estão configurados
- [ ] Trilha de teste tem versão publicada (versionCode 70+)
- [ ] Sua conta está como testadora
- [ ] Aceitou o convite de teste (opt-in)

### App / Dispositivo
- [ ] APK instalado tem versionCode 70+
- [ ] Package name correto instalado
- [ ] Usando mesma conta Gmail que é testadora
- [ ] Cache do Play Store foi limpo
- [ ] Executou diagnóstico completo no app

## 📤 O QUE ME ENVIAR

Para eu ajudar, preciso de:

1. **Logs completos do diagnóstico**
   - Execute o botão de diagnóstico no app
   - Copie TODOS os logs do `ver-logs-billing.bat`

2. **Screenshots do Google Play Console:**
   - Tela de produtos (Monetização → Produtos → Assinaturas)
   - Status de cada produto (ATIVO/RASCUNHO)
   - Trilha de teste (Testes → Teste interno)
   - Lista de testadores

3. **Resultado dos comandos:**
   ```bash
   adb shell pm list packages | findstr stone
   adb shell dumpsys package com.stoneativos.monitoraapp | findstr versionCode | findstr /v "targetSdk"
   ```

4. **Confirmações:**
   - Qual é o package name real do app no console?
   - Os produtos existem no console?
   - Estão ATIVOS ou em RASCUNHO?
   - Tem trilha de teste publicada?
   - É testador oficial?

## 🔮 Possíveis Resultados

### ✅ Caso 1: Produtos não foram criados
- **Solução:** Criar produtos no Google Play Console
- **Tempo:** Imediato após ativar + 1h propagação

### ✅ Caso 2: Produtos em rascunho
- **Solução:** Ativar produtos
- **Tempo:** 1-2 horas para propagar

### ✅ Caso 3: App não publicado em teste
- **Solução:** Publicar na trilha de teste interno
- **Tempo:** 1-2 horas para propagar

### ✅ Caso 4: Package name diferente
- **Solução:** Atualizar Product IDs no código
- **Tempo:** Imediato após rebuild

### ✅ Caso 5: Conta não é testadora
- **Solução:** Adicionar na lista + aceitar opt-in
- **Tempo:** 5-10 minutos

---

**💪 Vamos resolver isso juntos!**

Execute os passos acima e me envie os resultados. Com as informações corretas, vamos identificar exatamente o problema e corrigi-lo.
