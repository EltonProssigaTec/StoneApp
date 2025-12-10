# 🎯 Guia de Teste - Google Play Billing

## 📋 Pré-requisitos

### 1. Configuração do Google Play Console

✅ **Você já fez:**
- [x] Criou o app no Google Play Console
- [x] Configurou os produtos/assinaturas na aba de monetização

✅ **Produtos configurados:**
- `br.com.stoneup.monitora.app.monitora` - Plano Mensal
- `br.com.stoneup.monitora.app.stoneupplus` - Plano Anual

### 2. Conta de Teste

Para testar assinaturas sem ser cobrado, você precisa:

1. **Adicionar contas de teste no Google Play Console:**
   - Vá em: `Google Play Console` → `Configuração` → `Testers de licença`
   - Adicione o email da sua conta Google do dispositivo de teste
   - Aguarde alguns minutos para a propagação

2. **Usar uma conta de teste no dispositivo:**
   - O dispositivo deve estar logado com a conta adicionada como testador
   - Você pode fazer compras sem ser cobrado

---

## 🔧 Como Testar

### Passo 1: Build do App

Como você já tem a versão em teste no Play Console, faça o build:

```bash
# Limpar build anterior
cd android
./gradlew clean
cd ..

# Fazer build de release (AAB para Play Store)
npx expo prebuild --platform android
cd android
./gradlew bundleRelease
cd ..

# OU build APK para teste direto
cd android
./gradlew assembleRelease
cd ..
```

### Passo 2: Instalar no Dispositivo via ADB

```bash
# Verificar se o dispositivo está conectado
adb devices

# Instalar o APK (se fez build APK)
adb install android/app/build/outputs/apk/release/app-release.apk

# OU enviar AAB para Play Console (Internal Testing ou Alpha)
# Fazer upload manual no Play Console
```

### Passo 3: Monitorar Logs via ADB

**IMPORTANTE**: Com seu dispositivo conectado via ADB Wireless, rode este comando para ver TODOS os logs:

```bash
# Ver logs em tempo real do app
adb logcat -s ReactNativeJS:* *:E

# OU filtrar apenas os logs do Google Play Billing
adb logcat | findstr /C:"[GooglePlayBilling]" /C:"[Checkout]"
```

**Para Windows PowerShell:**
```powershell
adb logcat | Select-String -Pattern "\[GooglePlayBilling\]|\[Checkout\]"
```

### Passo 4: Fluxo de Teste no App

1. **Abrir o app no dispositivo**
2. **Navegar para a tela de Planos** (`/planos`)
3. **Selecionar um plano** (ex: Anual)
4. **Clicar em "ASSINAR PLANO"**
5. **Na tela de checkout, selecionar "Google Play"**
6. **Clicar em "Comprar via Google Play"**

### O que deve acontecer:

✅ **Logs esperados no ADB:**

```
[GooglePlayBilling] 🔵 Tentando importar react-native-iap...
[GooglePlayBilling] ✅ react-native-iap importado com sucesso!

[Checkout] 🔵 Tela de checkout montada
[Checkout] 🔵 Plan ID recebido: annual
[Checkout] ✅ Plano encontrado: {...}
[Checkout] 🔵 Inicializando Google Play Billing...

[GooglePlayBilling] 🔵 === INICIANDO GOOGLE PLAY BILLING ===
[GooglePlayBilling] 🔵 Platform: android
[GooglePlayBilling] 🔵 Estabelecendo conexão com Google Play Billing...
[GooglePlayBilling] ✅ Conexão estabelecida com sucesso!
[GooglePlayBilling] 🔵 Configurando listeners de compra...
[GooglePlayBilling] ✅ Listeners configurados com sucesso

[Checkout] 🔵 === INICIANDO PAGAMENTO GOOGLE PLAY ===
[Checkout] 🔵 Plano selecionado: {id: 'annual', name: 'Monitora Ano', price: 59.99}
[Checkout] 🔵 Mapeamento de SKU: {planId: 'annual', sku: 'br.com.stoneup.monitora.app.stoneupplus'}
[Checkout] 🔵 Chamando purchaseSubscription com SKU: br.com.stoneup.monitora.app.stoneupplus

[GooglePlayBilling] 🔵 === INICIANDO COMPRA DE ASSINATURA ===
[GooglePlayBilling] 🔵 SKU solicitado: br.com.stoneup.monitora.app.stoneupplus
[GooglePlayBilling] 🔵 Abrindo tela de pagamento do Google Play...
[GooglePlayBilling] ✅ Fluxo de compra iniciado com sucesso!
```

✅ **Tela do Google Play deve abrir** mostrando:
- Nome do produto
- Preço (R$ 59,99/ano ou conforme configurado)
- Opções de pagamento
- Botão "Assinar"

### Passo 5: Completar a Compra (Teste)

1. **Na tela do Google Play**, clique em "Assinar"
2. **Como você é testador**, não será cobrado
3. **Aguarde a confirmação**

✅ **Logs após compra bem-sucedida:**

```
[GooglePlayBilling] 🔵 === COMPRA ATUALIZADA ===
[GooglePlayBilling] 🔵 Product ID: br.com.stoneup.monitora.app.stoneupplus
[GooglePlayBilling] 🔵 Transaction ID: GPA.1234...
[GooglePlayBilling] 🔵 Purchase Token: abcdef...
[GooglePlayBilling] 🔵 Receipt encontrado, processando compra...

[GooglePlayBilling] 🔵 Etapa 1: Validando compra no backend...
[GooglePlayBilling] ⚠️ Validação com backend (mock) - OK
[GooglePlayBilling] ⚠️ ⚠️ ATENÇÃO: Validação com backend não implementada!

[GooglePlayBilling] 🔵 Etapa 2: Ativando assinatura localmente...
[GooglePlayBilling] 🔵 Mapeamento SKU -> Plan ID: br.com.stoneup.monitora.app.stoneupplus -> annual
[GooglePlayBilling] ✅ Assinatura ativada localmente!

[GooglePlayBilling] 🔵 Etapa 3: Finalizando transação com Google Play...
[GooglePlayBilling] ✅ Transação finalizada com Google Play!
[GooglePlayBilling] ✅ === COMPRA PROCESSADA COM SUCESSO ===
```

✅ **Alert deve aparecer no app:**
> "Assinatura Ativada! 🎉"
> "Seu plano foi ativado com sucesso. Aproveite todos os recursos premium!"

---

## 🐛 Diagnóstico de Problemas

### Problema 1: "react-native-iap não disponível"

**Log:**
```
[GooglePlayBilling] ⚠️ react-native-iap não disponível (usando Expo Go)
```

**Solução:**
- Você está usando Expo Go
- Precisa fazer build nativo: `npx expo prebuild`
- Ou usar EAS Build: `eas build --platform android --profile preview`

---

### Problema 2: "Produto não encontrado"

**Log:**
```
[GooglePlayBilling] ❌ Erro ao buscar produtos
[GooglePlayBilling] ❌ Error: No products found
```

**Causas possíveis:**
1. **SKUs não configurados no Google Play Console**
   - Verifique em: `Monetização` → `Produtos in-app` → `Assinaturas`
   - Os SKUs devem ser EXATAMENTE: `br.com.stoneup.monitora.app.monitora` e `br.com.stoneup.monitora.app.stoneupplus`

2. **App não está publicado em teste**
   - Publique em `Internal Testing`, `Closed Testing` ou `Alpha`
   - Aguarde algumas horas para propagação

3. **Package name diferente**
   - Verifique se o `applicationId` em `android/app/build.gradle` é: `br.com.stoneup.monitora.app`

---

### Problema 3: "Compra cancelada pelo usuário"

**Log:**
```
[GooglePlayBilling] ⚠️ Usuário cancelou a compra
```

**Solução:**
- Normal, usuário clicou em "Cancelar" na tela do Google Play
- Não é um erro

---

### Problema 4: "Você já possui esta assinatura"

**Log:**
```
[GooglePlayBilling] ⚠️ Usuário já possui esta assinatura
```

**Solução:**
- Cancele a assinatura anterior no Google Play
- Vá em: `Google Play` → `Assinaturas` → Cancelar assinatura de teste
- Aguarde alguns minutos

---

## 📊 Comandos ADB Úteis

### Ver logs apenas do app:
```bash
adb logcat -s ReactNativeJS:*
```

### Limpar logs antes de testar:
```bash
adb logcat -c
```

### Salvar logs em arquivo:
```bash
adb logcat > logs_google_play.txt
```

### Verificar se o ADB está conectado:
```bash
adb devices
```

### Reconectar ADB Wireless:
```bash
adb connect <IP_DO_DISPOSITIVO>:5555
```

---

## ✅ Checklist de Teste

- [ ] App instalado no dispositivo de teste
- [ ] Dispositivo logado com conta de testador
- [ ] ADB conectado e logs visíveis
- [ ] Produtos criados no Google Play Console
- [ ] App publicado em teste (Internal/Alpha/Closed)
- [ ] Navegação até tela de checkout funcional
- [ ] Logs aparecem ao inicializar Google Play Billing
- [ ] Tela do Google Play abre ao clicar em "Comprar"
- [ ] Compra é processada sem cobrar
- [ ] Assinatura é ativada localmente
- [ ] Alert de sucesso aparece

---

## 🔗 Links Úteis

- [Google Play Console](https://play.google.com/console)
- [Documentação react-native-iap](https://github.com/dooboolab-community/react-native-iap)
- [Testar compras no app](https://developer.android.com/google/play/billing/test)

---

## 💡 Dicas Importantes

1. **Sempre teste com conta de testador** para não ser cobrado
2. **Aguarde propagação** após criar produtos (pode levar até 24h)
3. **Use Internal Testing** para testes rápidos
4. **Monitore os logs via ADB** para debugar problemas
5. **Em produção, SEMPRE valide compras no backend** para evitar fraudes

---

## 📝 Próximos Passos

Após testes bem-sucedidos:

1. **Implementar validação no backend**
   - Endpoint: `POST /monitora/assinaturas/validate-google-play`
   - Validar `purchaseToken` com Google Play Developer API

2. **Adicionar plano trimestral**
   - Criar SKU: `br.com.stoneup.monitora.app.quarterly`
   - Adicionar no mapeamento

3. **Implementar restauração de compras**
   - Permitir usuário restaurar assinatura ao fazer login

4. **Analytics**
   - Rastrear conversão de assinaturas
   - Monitorar cancelamentos
