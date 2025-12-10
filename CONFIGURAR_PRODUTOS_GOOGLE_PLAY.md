# 📋 Como Configurar Produtos no Google Play Console

## ❌ Erro Atual
```
'Produtos encontrados:', 0
'Produto não encontrado no Google Play'
```

Isso significa que o **Google Play Billing está funcionando**, mas **não encontra os produtos** que você criou.

## ✅ Checklist de Verificação

### 1. Acesse o Google Play Console
https://play.google.com/console

### 2. Selecione seu App
- Encontre: **Monitora** ou **StoneUp Monitora**
- Package name deve ser: `br.com.stoneup.monitora.app`

### 3. Vá em Monetização → Produtos → Assinaturas
Menu lateral esquerdo:
- **Monetize** (ou **Monetização**)
- **Products** (ou **Produtos**)
- **Subscriptions** (ou **Assinaturas**)

### 4. Verifique se os 3 Produtos Existem

Você deve ver 3 assinaturas cadastradas:

| Nome | ID do Produto (SKU) | Status | Preço |
|------|---------------------|--------|-------|
| Plano Mensal | `br.com.stoneup.monitora.app.monitora` | **Ativo** | R$ 14,99/mês |
| Plano Trimestral | `monitora-02` | **Ativo** | R$ 34,99/3 meses |
| Plano Anual | `br.com.stoneup.monitora.app.stoneupplus` | **Ativo** | R$ 59,99/ano |

⚠️ **IMPORTANTE:**
- O **Status** deve estar como **"Ativo"** (Active)
- Se estiver como "Rascunho" (Draft), o produto NÃO aparecerá no app

### 5. Verifique o App em Teste

#### Opção A: Internal Testing (Recomendado)
1. Vá em: **Release** → **Testing** → **Internal testing**
2. Crie uma versão de teste (track)
3. Faça upload do APK/AAB ou use build do EAS
4. Adicione testadores (emails)
5. Publique a versão de teste

#### Opção B: Closed Testing
1. Vá em: **Release** → **Testing** → **Closed testing**
2. Siga os mesmos passos acima

#### Opção C: Open Testing / Production
- Só use se já quiser publicar o app

### 6. Adicione sua Conta como Testadora

1. Vá em: **Release** → **Testing** → **Internal testing**
2. Clique em **Testers** (ou **Testadores**)
3. Adicione seu email do Google (o mesmo do dispositivo)
4. Aceite o convite no email que você vai receber

### 7. Aguarde Propagação
⏱️ Após criar/ativar produtos: aguarde **algumas horas** (até 24h) para propagação

---

## 🔍 Como Verificar se Está Tudo OK

### No Google Play Console:

1. **Produtos estão Ativos?**
   - Monetização → Produtos → Assinaturas
   - Status: **Ativo** (verde) ✅

2. **App está em teste?**
   - Release → Testing → Internal testing
   - Deve ter uma versão publicada ✅

3. **Você é testador?**
   - Release → Testing → Internal testing → Testers
   - Seu email aparece na lista ✅

### No Dispositivo Android:

1. **Mesma conta Google**
   - Settings → Accounts
   - Deve ser a conta adicionada como testadora

2. **Google Play Store atualizado**
   - Abra Play Store
   - Vá em Settings → About
   - Verifique se está atualizado

---

## 🚀 Após Configurar Tudo

### Rebuild do App
```bash
.\rebuild-android.bat
```

### Teste Novamente
```bash
.\ver-logs-billing.bat
```

Agora você deve ver nos logs:
```
[GooglePlayBilling] 🔵 Produtos encontrados: 3
[GooglePlayBilling] 🔵 Produto selecionado: { productId: 'br.com.stoneup.monitora.app.monitora', ... }
```

E a **tela do Google Play deve abrir!** 🎉

---

## 📸 Screenshots Úteis

Se puder, tire prints de:
1. Lista de produtos (Monetização → Produtos → Assinaturas)
2. Versão em teste (Release → Testing → Internal testing)
3. Lista de testadores

E me envie para eu verificar se está tudo correto!

---

## ❓ Dúvidas Comuns

### "Meus produtos estão em Rascunho (Draft)"
- Ative os produtos clicando neles e mudando o status para **Ativo**

### "Não tenho versão em teste"
- Crie uma com: `eas build --platform android --profile preview`
- Ou faça upload manual do APK/AAB

### "Adicionei testador mas não recebi email"
- Verifique spam
- Copie o link de teste direto do Play Console

### "Já faz 24h e ainda não funciona"
- Verifique se o package name do app corresponde ao do Play Console
- Rode: `npx expo prebuild && findstr /C:"applicationId" android\\app\\build.gradle`
- Deve mostrar: `applicationId "br.com.stoneup.monitora.app"`

---

## 🔗 Links Úteis

- Google Play Console: https://play.google.com/console
- Documentação Billing: https://developer.android.com/google/play/billing
- SKU Format Guide: https://support.google.com/googleplay/android-developer/answer/1153481

---

**Aguardo seu feedback sobre o que você vê no Google Play Console! 📋**
