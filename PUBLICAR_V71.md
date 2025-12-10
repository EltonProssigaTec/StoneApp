# 🚀 PUBLICAR VERSÃO 71 - Google Play Console

## ✅ Confirmado:
- **Package name no console:** `br.com.stoneup.monitora.app` ✅
- **Código atualizado:** Usando produtos `br.com.stoneup.monitora.app.*` ✅
- **APK v71 gerado:** `android\app\build\outputs\apk\release\app-release.apk` ✅

## 🎯 O QUE FAZER AGORA

Os produtos "Real" que você criou estão corretos, mas precisam de uma **versão publicada na trilha de teste** para ficarem disponíveis.

### OPÇÃO 1: Publicar APK na Trilha de Teste (RECOMENDADO)

1. **Gerar Bundle (AAB)** - Mais recomendado que APK:
   ```bash
   cd android
   .\gradlew bundleRelease
   ```

   O arquivo estará em: `android\app\build\outputs\bundle\release\app-release.aab`

2. **Acessar Google Play Console:**
   https://play.google.com/console

3. **Selecionar o app:** StoneUp Monitora (`br.com.stoneup.monitora.app`)

4. **Criar nova versão de teste:**
   - Menu: **Testes** → **Teste interno**
   - Clique em **"Criar nova versão"**

5. **Fazer upload do AAB:**
   - Arraste o arquivo `app-release.aab` OU
   - Clique em "Upload" e selecione o arquivo

6. **Preencher notas da versão:**
   ```
   Versão 71:
   - Integração com Google Play Billing para assinaturas
   - Correção de package name
   - Melhorias de estabilidade
   ```

7. **Revisar e publicar:**
   - Clique em **"Revisar versão"**
   - Clique em **"Iniciar lançamento para teste interno"**

8. **Aguardar propagação:** 1-2 horas

### OPÇÃO 2: Instalar APK diretamente (TESTE RÁPIDO)

Enquanto aguarda a publicação, você pode testar localmente:

```bash
# Execute o script de instalação
.\install-v71.bat
```

**MAS ATENÇÃO:** Com APK local, os produtos podem não aparecer até que:
1. Uma versão seja publicada na trilha de teste, OU
2. Aguardar 1-2 horas para propagação dos produtos "Real"

## ⏰ TIMELINE ESPERADO

### Se publicar agora (Bundle AAB):
- **Upload:** 5 minutos
- **Processamento Google:** 10-30 minutos
- **Propagação produtos:** 1-2 horas após publicação
- **Total:** ~2-3 horas até funcionar

### Se apenas aguardar propagação:
- **Propagação produtos:** 1-2 horas após criação
- **Total:** Pode funcionar já, ou em até 2 horas

## 🎯 QUAL CAMINHO SEGUIR?

### Se você quer garantia:
→ **Publicar Bundle (AAB) na trilha de teste**
- Mais profissional
- Garante que vai funcionar
- Necessário para produção de qualquer forma

### Se você quer testar rápido:
→ **Instalar APK local e aguardar**
- Mais rápido (10 min)
- Pode não funcionar imediatamente
- Útil para testes locais

## 🚀 COMANDOS RÁPIDOS

### Para gerar Bundle (AAB):
```bash
cd android
.\gradlew bundleRelease
```

### Para instalar APK local:
```bash
.\install-v71.bat
```

### Para ver logs:
```bash
.\ver-logs-billing.bat
```

## ✅ CHECKLIST FINAL

Antes de testar a compra, certifique-se:

- [ ] Bundle (AAB) publicado em Teste Interno
- [ ] Versão 71 (versionCode 71) aparece no console
- [ ] Status: "Disponível para testadores"
- [ ] Seu email está como testador
- [ ] Aceitou o convite de teste (opt-in)
- [ ] Aguardou 1-2 horas após publicação
- [ ] Cache do Play Store limpo: `adb shell pm clear com.android.vending`
- [ ] App instalado do Play Store (ou APK v71 instalado)

## 🎉 QUANDO FUNCIONAR

Você verá nos logs:

```
[GooglePlayBilling] ✅ 2 produto(s) encontrado(s)!

Produto 1:
  - Product ID: br.com.stoneup.monitora.app.monitora
  - Title: Monitora Mensal Real
  - Price: R$ XX,XX
  - Base Plans: 2

Produto 2:
  - Product ID: br.com.stoneup.monitora.app.stoneupplus
  - Title: Monitora Anual Real
  - Price: R$ XX,XX
  - Base Plans: 1
```

---

**Quer que eu gere o Bundle (AAB) para você agora?**

Basta me confirmar e eu executo o comando `.\gradlew bundleRelease` 🚀
