# 🔍 DIAGNÓSTICO - Google Play Billing não encontra produtos

## ❌ Problema Identificado

Nos logs:
```
[GooglePlayBilling] 🔵 Resposta do fetchProducts: { tipo: 'array', length: 0, productIds: [] }
[GooglePlayBilling] ❌ Produto não encontrado no Google Play
```

O Google Play Billing está conectando com sucesso, mas **não encontra nenhum produto**.

## 🔎 Causas Possíveis (em ordem de probabilidade)

### 1. ⚠️ PRODUTOS NÃO CRIADOS ou INATIVOS no Google Play Console
**Mais provável**

O Google Play Console precisa ter os produtos criados e **ATIVOS** (não em rascunho).

**Como verificar:**
1. Acesse: https://play.google.com/console
2. Selecione seu app "Monitora" ou "StoneUP"
3. Menu lateral: **Monetização** → **Produtos** → **Assinaturas**
4. Procure por:
   - `com.stoneativos.monitoraapp.monitora`
   - `com.stoneativos.monitoraapp.stoneupplus`

**O que verificar:**
- ✅ Status deve ser **ATIVO** (não "Rascunho" ou "Inativo")
- ✅ Product ID deve corresponder exatamente
- ✅ Deve ter pelo menos 1 Base Plan configurado
- ✅ Base Plan IDs devem ser: `monitora-01`, `monitora-02`, `monitora-anual-01`

### 2. ⚠️ APP NÃO PUBLICADO em trilha de TESTE
**Muito provável**

Mesmo que você tenha feito build com versionCode 70, é necessário **publicar na trilha de teste**.

**Como verificar:**
1. Google Play Console → **Testes** → **Teste interno** (ou Closed Testing)
2. Verifique se tem uma versão **PUBLICADA** (não apenas uploaded)
3. Status deve ser: **Disponível para testadores**

**IMPORTANTE:**
- Após fazer upload, clique em **"Revisar versão"** → **"Iniciar lançamento"**
- Pode levar até 1-2 horas para propagar

### 3. ⚠️ CONTA NÃO É TESTADORA

**Como verificar:**
1. Google Play Console → **Testes** → **Teste interno**
2. Aba **"Testadores"**
3. Verifique se seu email está na lista de testadores
4. Se usar lista do Google Groups, confirme que está no grupo

**No dispositivo:**
- Use a mesma conta Gmail que está na lista de testadores
- Aceite o convite de teste (link fornecido pelo Play Console)

### 4. ⚠️ PACKAGE NAME INCORRETO

**Configuração atual do app:**
```
android.package = "com.stoneativos.monitoraapp"
```

**Product IDs que estamos buscando:**
```
com.stoneativos.monitoraapp.monitora
com.stoneativos.monitoraapp.stoneupplus
```

**Como verificar no Google Play Console:**
1. **Configuração** → **Detalhes do app**
2. Verifique o **"ID do aplicativo"**
3. Deve ser: `com.stoneativos.monitoraapp`

**Se for diferente** (ex: `br.com.stoneup.monitora.app`):
- Os Product IDs devem começar com o package name correto
- Exemplo: `br.com.stoneup.monitora.app.monitora`

### 5. ⚠️ CACHE DO GOOGLE PLAY

Às vezes o Play Store mantém cache antigo.

**Solução:**
```bash
# Limpar cache do Play Store
adb shell pm clear com.android.vending

# Reinstalar o app
adb uninstall com.stoneativos.monitoraapp
# Depois instale o APK novamente
```

## 🛠️ PLANO DE AÇÃO - Passo a Passo

### Passo 1: Verificar Package Name Real do APK Instalado
Execute no terminal:
```bash
# Ver package name do app instalado
adb shell pm list packages | findstr stone

# Ver informações detalhadas
adb shell dumpsys package com.stoneativos.monitoraapp | findstr versionCode
```

### Passo 2: Executar Diagnóstico Completo no App

Já existe uma função de diagnóstico no código! Vamos ativá-la.

**Adicione no `app/checkout.tsx` (temporariamente para teste):**
```typescript
import googlePlayBilling from '@/services/googlePlayBilling';

// Adicione um botão de diagnóstico
useEffect(() => {
  // Execute diagnóstico automaticamente ao abrir a tela
  setTimeout(() => {
    googlePlayBilling.runCompleteDiagnostics();
  }, 2000);
}, []);
```

Isso vai gerar logs detalhados no logcat com todas as informações necessárias.

### Passo 3: Verificar Google Play Console

#### 3.1 Produtos
1. Acesse https://play.google.com/console
2. **Monetização** → **Produtos** → **Assinaturas**
3. Verifique:
   - [ ] Produtos existem?
   - [ ] Status = ATIVO?
   - [ ] Product IDs corretos?
   - [ ] Base Plans configurados?

#### 3.2 Trilha de Teste
1. **Testes** → **Teste interno**
2. Verifique:
   - [ ] Versão 70 publicada?
   - [ ] Status = "Disponível para testadores"?
   - [ ] Seu email está como testador?

#### 3.3 Package Name
1. **Configuração** → **Detalhes do app**
2. Confirme que ID do aplicativo = `com.stoneativos.monitoraapp`

### Passo 4: Limpar Cache e Testar
```bash
# Limpar cache do Play Store
adb shell pm clear com.android.vending

# Ver logs em tempo real
adb logcat | findstr GooglePlayBilling
```

## 📊 Checklist de Verificação

Marque cada item conforme verificar:

### Google Play Console
- [ ] Conta tem acesso ao app no Play Console
- [ ] Package name do app = `com.stoneativos.monitoraapp`
- [ ] Produto 1 (`com.stoneativos.monitoraapp.monitora`) existe e está ATIVO
- [ ] Produto 2 (`com.stoneativos.monitoraapp.stoneupplus`) existe e está ATIVO
- [ ] Base Plans configurados: `monitora-01`, `monitora-02`, `monitora-anual-01`
- [ ] App publicado em Teste Interno com versionCode 70+
- [ ] Email do testador está na lista de testadores
- [ ] Link de teste aceito (opt-in feito)

### Dispositivo/App
- [ ] App instalado tem package name `com.stoneativos.monitoraapp`
- [ ] App tem versionCode 70+
- [ ] Usando mesma conta Gmail que é testadora
- [ ] Cache do Play Store limpo
- [ ] Permissão BILLING concedida no AndroidManifest
- [ ] react-native-iap instalado e funcionando

## 🎯 Próximos Passos

1. **Execute o diagnóstico completo** no app (função `runCompleteDiagnostics()`)
2. **Capture os logs** completos
3. **Verifique cada item do checklist** acima
4. **Me envie:**
   - Screenshots do Google Play Console (produtos e trilha de teste)
   - Logs completos do diagnóstico
   - Resultado dos comandos adb do Passo 1

Com essas informações, conseguiremos identificar exatamente onde está o problema.

## 💡 Dicas Importantes

- **Produtos em rascunho NÃO aparecem no fetchProducts!** Eles devem estar ATIVOS.
- **Trilha de teste deve estar publicada**, não apenas com build feito upload.
- **Pode levar 1-2 horas** após publicar para os produtos ficarem disponíveis.
- **Testadores precisam aceitar o convite** através do link fornecido.
- **Use a mesma conta Gmail** no dispositivo e na lista de testadores.

## 🔗 Links Úteis

- Google Play Console: https://play.google.com/console
- Documentação IAP: https://developer.android.com/google/play/billing
- react-native-iap: https://github.com/dooboolab/react-native-iap
