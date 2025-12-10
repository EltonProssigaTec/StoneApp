# ❌ ERRO: Produto não encontrado no Google Play

## 📊 Diagnóstico

O erro **"Produto não disponível"** ocorre porque o `fetchProducts` retorna um array vazio.

```
Resposta do fetchProducts: { tipo: 'array', length: 0, productIds: [] }
```

Isso significa que o Google Play não encontra os produtos com IDs:
- `com.stoneativos.monitoraapp.monitora`
- `com.stoneativos.monitoraapp.stoneupplus`

## ✅ Configuração Atual

**Package Name:** `com.stoneativos.monitoraapp` ✅ (correto)
**Version Code:** 70

**Product IDs esperados:**
1. `com.stoneativos.monitoraapp.monitora` (Mensal e Trimestral)
   - Base Plan: `monitora-01` (mensal)
   - Base Plan: `monitora-02` (trimestral)

2. `com.stoneativos.monitoraapp.stoneupplus` (Anual)
   - Base Plan: `monitora-anual-01`

---

## 🔍 CAUSA RAIZ

O problema está em **UMA** destas situações:

### 1️⃣ Produtos não criados no Google Play Console
Os produtos não existem ou não estão configurados corretamente.

### 2️⃣ App não publicado em Internal/Closed Testing
Para testar IAP, é OBRIGATÓRIO publicar em Internal ou Closed Testing.

### 3️⃣ Conta não é testadora
Sua conta precisa estar na lista de testadores licenciados.

### 4️⃣ App instalado via ADB (não pela Play Store)
Apps instalados via `adb install` não têm acesso ao Google Play Billing.

---

## 🛠️ SOLUÇÃO PASSO A PASSO

### PASSO 1: Verificar se os produtos existem

1. Acesse: https://play.google.com/console
2. Selecione seu app: **StoneUP** (com.stoneativos.monitoraapp)
3. Vá em: **Monetização → Produtos → Assinaturas**

**VERIFIQUE:**
- [ ] Existe o produto: `com.stoneativos.monitoraapp.monitora`?
- [ ] Existe o produto: `com.stoneativos.monitoraapp.stoneupplus`?
- [ ] Os produtos estão com status **"Ativo"** (não "Rascunho")?
- [ ] Os base plans estão criados e ativos?

#### ❌ Se os produtos NÃO existem:

Você precisa criar os produtos. Siga o guia: `CONFIGURAR_PRODUTOS_GOOGLE_PLAY.md`

#### ✅ Se os produtos existem:

Continue para o PASSO 2.

---

### PASSO 2: Verificar se o app está publicado em teste

1. No Google Play Console, vá em: **Testes → Internal testing** (ou Closed testing)
2. Verifique se há uma versão publicada

**VERIFIQUE:**
- [ ] Existe uma versão publicada? (não basta fazer upload, precisa PUBLICAR)
- [ ] A versão publicada é >= 70 (seu versionCode atual)?
- [ ] A versão está com status **"Disponível"** ou **"Em análise"**?

#### ❌ Se NÃO há versão publicada:

```bash
# Build da versão de produção
npm run build:android

# Ou com EAS Build:
npx eas build --platform android --profile production
```

Depois faça upload do AAB/APK no Internal Testing e **PUBLIQUE**.

#### ✅ Se há versão publicada:

Continue para o PASSO 3.

---

### PASSO 3: Adicionar sua conta como testadora

1. No Google Play Console, vá em: **Testes → Internal testing**
2. Vá na aba **"Testadores"**
3. Clique em **"Criar lista de e-mails"**
4. Adicione seu e-mail Google (o mesmo que você usa no dispositivo)

**IMPORTANTE:**
- Use o MESMO e-mail que está logado no dispositivo Android
- Aceite o convite de teste (você receberá um link)

---

### PASSO 4: Instalar o app PELA PLAY STORE

**⚠️ CRÍTICO:** Você DEVE instalar o app pela Play Store (versão de teste), NÃO via ADB!

1. Desinstale o app atual:
```bash
adb uninstall com.stoneativos.monitoraapp
```

2. Acesse o link de teste que você recebeu por e-mail

3. Instale o app pela Play Store

4. Abra o app e tente fazer a assinatura

---

### PASSO 5: Verificar package name

O package name precisa ser EXATAMENTE o mesmo em todos os lugares:

**app.json:**
```json
"android": {
  "package": "com.stoneativos.monitoraapp"
}
```

**Google Play Console:**
- Vá em: **Configuração → Detalhes do app**
- Verifique se o "ID do aplicativo" é: `com.stoneativos.monitoraapp`

**AndroidManifest.xml:**
```bash
# Verificar package name no manifest
cat android/app/src/main/AndroidManifest.xml | grep package
```

Deve retornar: `package="com.stoneativos.monitoraapp"`

---

## 🧪 TESTAR APÓS CORREÇÃO

Depois de seguir todos os passos:

1. Abra o app (instalado pela Play Store)
2. Vá em "Assinar Plano"
3. Tente assinar um plano
4. Monitore os logs:

```bash
.\ver-logs-billing.bat
```

**✅ SUCESSO:** Você verá a tela de pagamento do Google Play

**❌ AINDA COM ERRO:** Revise os passos anteriores ou entre em contato com o suporte do Google Play Console

---

## 📝 CHECKLIST FINAL

Antes de testar novamente, confirme:

- [ ] Produtos criados no Google Play Console com IDs corretos
- [ ] Produtos estão com status "Ativo"
- [ ] Base plans criados e ativos
- [ ] App publicado em Internal/Closed Testing
- [ ] Versão publicada >= versionCode 70
- [ ] Conta adicionada como testadora
- [ ] Convite de teste aceito
- [ ] App DESINSTALADO e REINSTALADO pela Play Store
- [ ] Package name correto em todos os lugares

---

## 🆘 PRECISA DE AJUDA?

Se após seguir todos os passos o erro persistir:

1. Execute o diagnóstico:
```bash
.\diagnostico-google-play.bat
```

2. Tire prints de:
   - Lista de produtos no Google Play Console
   - Versão publicada em Internal Testing
   - Lista de testadores
   - Output dos logs

3. Verifique a documentação oficial:
   - https://support.google.com/googleplay/android-developer/answer/140504
   - https://developer.android.com/google/play/billing/test
