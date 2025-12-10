# 🚀 COMO TESTAR V74 - Google Play Billing CORRIGIDO

**Versão 74** - Implementação corrigida pronta para teste

---

## ⚡ TESTE RÁPIDO (5 minutos)

### Opção A: Build Rápido (se o código foi apenas atualizado)

```bash
# 1. Gerar APK
cd android
.\gradlew assembleRelease
cd ..

# 2. Instalar
.\install-v74.bat

# 3. Monitorar logs
.\ver-logs-billing.bat
```

### Opção B: Build Completo (se teve erros ou mudanças grandes)

```bash
# 1. Build completo com limpeza
.\build-v74-fixed.bat

# 2. Instalar
.\install-v74.bat

# 3. Monitorar logs
.\ver-logs-billing.bat
```

---

## 📱 PASSO A PASSO NO APP

### 1. Abrir App
- O app deve abrir sem erros
- Fazer login se necessário

### 2. Navegar para Planos
- Ir em **Menu** → **Planos** (ou **Assinar**)
- Ver lista de planos

### 3. Selecionar Plano
- Clicar em qualquer plano (Mensal, Trimestral ou Anual)

### 4. Ir para Checkout
- Clicar em **"Assinar"** ou **"Comprar"**
- Deve abrir tela de checkout

### 5. Testar Google Play Billing
- Selecionar método: **"Google Play"**
- Clicar em **"Comprar via Google Play"**

### 6. Verificar Logs (Terminal)

**✅ SUCESSO - Logs esperados:**
```
[GooglePlayBilling] 🔵 Iniciando conexão...
[GooglePlayBilling] ✅ Conexão estabelecida
[GooglePlayBilling] 🔍 Buscando assinaturas...
[GooglePlayBilling] ✅ 2 produto(s) encontrado(s)!

📦 Produto 1:
   Product ID: br.com.stoneup.monitora.app.monitora
   Título: Monitora Mensal Real
   Base Plans: 2
      1. monitora-01 (token: ✅)
      2. monitora-02 (token: ✅)

📦 Produto 2:
   Product ID: br.com.stoneup.monitora.app.stoneupplus
   Título: Monitora Anual Real
   Base Plans: 1
      1. monitora-anual-01 (token: ✅)

[GooglePlayBilling] 🛒 Iniciando compra...
[GooglePlayBilling] ✅ Compra solicitada com sucesso!
```

**Depois disso:**
- Tela de pagamento do Google Play deve abrir
- Mostrar produto e preço
- Permitir completar compra

---

## ❌ SE DER ERRO

### Erro: "0 produto(s) encontrado(s)"

**Verificar:**
1. App está instalado com package correto?
   ```bash
   adb shell pm list packages | findstr stoneup
   # Deve retornar: br.com.stoneup.monitora.app
   ```

2. Produtos existem no Google Play Console?
   - Acessar: https://play.google.com/console
   - Monetização → Produtos → Assinaturas
   - Verificar se existem e estão **ATIVOS**

3. App está em trilha de teste?
   - Testes → Teste interno
   - Deve ter versão publicada

4. Usuário é testador?
   - Testes → Teste interno → Testadores
   - Seu email deve estar na lista

### Erro: "Tela do Google Play não abre"

**Executar diagnóstico:**
```bash
# No app, ir para checkout e clicar em:
🔍 Executar Diagnóstico Completo
```

**Ou executar programaticamente:**
```typescript
await googlePlayBilling.runDiagnostics();
```

### Erro: "react-native-iap não disponível"

**Fazer build nativo:**
```bash
npx expo prebuild --clean
cd android
.\gradlew assembleRelease
```

---

## 🔍 COMANDOS ÚTEIS

### Ver logs em tempo real:
```bash
.\ver-logs-billing.bat
```

### Limpar cache do Play Store:
```bash
adb shell pm clear com.android.vending
```

### Desinstalar app:
```bash
adb uninstall br.com.stoneup.monitora.app
```

### Reinstalar:
```bash
.\install-v74.bat
```

### Ver package instalado:
```bash
adb shell pm list packages | findstr stoneup
```

### Ver versão instalada:
```bash
adb shell dumpsys package br.com.stoneup.monitora.app | findstr versionCode
```

---

## 📊 CHECKLIST DE TESTE

### Antes de Testar:
- [ ] Dispositivo Android conectado via ADB
- [ ] Google Play Store atualizado
- [ ] Conta Google configurada no dispositivo
- [ ] Terminal aberto com `.\ver-logs-billing.bat`

### Durante o Teste:
- [ ] App abre sem erros
- [ ] Tela de planos carrega
- [ ] Tela de checkout abre
- [ ] Botão "Google Play" visível
- [ ] Logs mostram "Conexão estabelecida"
- [ ] Logs mostram "2 produto(s) encontrado(s)"
- [ ] Logs mostram offerTokens com ✅
- [ ] Clicar em "Comprar via Google Play"
- [ ] Logs mostram "Iniciando compra"
- [ ] Tela do Google Play abre
- [ ] Produto e preço corretos mostrados

### Resultado Esperado:
- [ ] ✅ Tela de pagamento do Google Play abre
- [ ] ✅ Produto correto mostrado
- [ ] ✅ Preço correto mostrado
- [ ] ✅ Pode completar compra (teste sandbox)

---

## 🎯 O QUE FOI CORRIGIDO NA V74

### ✅ Correções Implementadas:

1. **Usa `getSubscriptions()` (não `fetchProducts()`)**
   - Método correto para assinaturas

2. **Extrai `offerToken` de `subscriptionOfferDetails`**
   - Crucial para compra funcionar

3. **Passa offerToken para `requestSubscription()`**
   - Estrutura correta com subscriptionOffers

4. **Logs claros em todas as etapas**
   - Fácil identificar problemas

5. **Tratamento completo de erros**
   - Mensagens úteis para cada tipo de erro

6. **Cache de assinaturas**
   - Melhor performance

7. **Listeners automáticos**
   - Captura compra automaticamente

---

## 📞 SE PRECISAR DE AJUDA

### Me envie:

1. **Logs completos** do `.\ver-logs-billing.bat`

2. **Screenshots:**
   - Tela de planos
   - Tela de checkout
   - Erro (se houver)

3. **Informações do Google Play Console:**
   - Package name do app
   - Status dos produtos (ATIVO?)
   - Trilha de teste (publicada?)
   - Você é testador?

4. **Comando e resultado:**
   ```bash
   adb shell pm list packages | findstr stoneup
   adb shell dumpsys package br.com.stoneup.monitora.app | findstr versionCode
   ```

---

## 🎉 SUCESSO!

Se você ver nos logs:

```
[GooglePlayBilling] ✅ 2 produto(s) encontrado(s)!
[GooglePlayBilling] 🛒 Iniciando compra...
[GooglePlayBilling] ✅ Compra solicitada com sucesso!
```

**E a tela do Google Play abrir:**

# 🎊 PARABÉNS! A INTEGRAÇÃO ESTÁ FUNCIONANDO! 🎊

Agora você pode:
- Implementar validação backend
- Testar compra completa
- Publicar no Play Store

---

**Boa sorte! 🚀**
