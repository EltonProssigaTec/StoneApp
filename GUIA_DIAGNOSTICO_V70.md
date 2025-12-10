# 🔍 Guia Completo - Build Versão 70 e Diagnóstico

## 📋 O Que Foi Feito

### 1. Atualizado versionCode para 70
- [app.json](app.json:30) - `versionCode: 70`

### 2. Adicionado Sistema de Diagnóstico Completo
- [googlePlayBilling.ts](services/googlePlayBilling.ts:593-847) - Nova função `runCompleteDiagnostics()`
- [checkout.tsx](app/checkout.tsx:485-504) - Botão de diagnóstico na tela

### 3. O Que o Diagnóstico Faz

O sistema de diagnóstico executa **10 testes diferentes** para identificar exatamente onde está o problema:

1. **Informações do Ambiente** - Versões do Expo, react-native-iap, etc.
2. **Disponibilidade da API** - Verifica se todos os métodos estão disponíveis
3. **Teste de Conexão** - Testa `initConnection` com Google Play Billing
4. **Configuração do App** - Mostra package name e version code
5. **Product IDs Configurados** - Lista os IDs que serão buscados
6. **Teste 1: Nossos Produtos** - Busca `com.stoneativos.monitoraapp.*`
7. **Teste 2: Produtos de Teste do Google** - Testa com `android.test.purchased`
8. **Teste 3: Produtos Individualmente** - Busca cada produto separadamente
9. **Teste 4: Package Name Alternativo** - Busca `br.com.stoneup.monitora.app.*`
10. **Resumo e Recomendações** - Checklist do que verificar no Console

## 🚀 Como Construir e Testar

### Passo 1: Preparar o Build

```bash
# 1. Limpar cache e builds anteriores
cd android
.\gradlew.bat clean
cd ..

# 2. Reconstruir estrutura nativa (se necessário)
# NOTA: Só rode isso se você fez mudanças em plugins nativos
# npx expo prebuild --platform android --clean

# 3. Gerar APK release
cd android
.\gradlew.bat assembleRelease
cd ..
```

### Passo 2: Desinstalar Versão Antiga

```bash
# Desinstalar ambos os package names possíveis
adb uninstall com.stoneativos.monitoraapp
adb uninstall br.com.stoneup.monitora.app

# Limpar cache do Google Play Store
adb shell pm clear com.android.vending
```

### Passo 3: Instalar Nova Versão

```bash
# Instalar o APK
adb install android\app\build\outputs\apk\release\app-release.apk
```

### Passo 4: Verificar Instalação

```bash
# Verificar se o app foi instalado com o package name correto
adb shell pm list packages | findstr monitora
```

**Resultado esperado:**
```
package:com.stoneativos.monitoraapp
```

### Passo 5: Executar o App e Logs

```bash
# Em um terminal, rode o app
npm start

# Em OUTRO terminal, monitore os logs
adb logcat | findstr -i "GooglePlay Billing Checkout ReactNativeJS"
```

## 🔍 Como Usar o Diagnóstico

### 1. No App

1. Abra o app
2. Vá para a tela de **Planos/Assinaturas**
3. Selecione qualquer plano
4. Na tela de Checkout, selecione método de pagamento: **Google Play**
5. Um botão azul aparecerá: **"🔍 Executar Diagnóstico Completo"**
6. Clique no botão

### 2. Verificar os Logs

O diagnóstico vai gerar um relatório COMPLETO nos logs do ADB. Procure por:

```
[GooglePlayBilling] 🔵 ╔════════════════════════════════════════════════════════════╗
[GooglePlayBilling] 🔵 ║     🔍 DIAGNÓSTICO COMPLETO - GOOGLE PLAY BILLING         ║
[GooglePlayBilling] 🔵 ╚════════════════════════════════════════════════════════════╝
```

### 3. O Que Procurar nos Logs

#### ✅ Se os produtos forem encontrados:

```
[GooglePlayBilling] 🔵 ═══ 6. TESTE 1: BUSCAR NOSSOS PRODUTOS ═══
[GooglePlayBilling] ✅ 2 produto(s) encontrado(s)!
[GooglePlayBilling] ✅ Produto 1:
[GooglePlayBilling] 🔵   - Product ID: com.stoneativos.monitoraapp.monitora
[GooglePlayBilling] 🔵   - Title: Monitora
[GooglePlayBilling] 🔵   - Price: R$ 29,90
[GooglePlayBilling] 🔵   - Base Plans: 2
```

**Resultado:** Problema resolvido! Os produtos estão disponíveis e a compra deve funcionar.

#### ❌ Se os produtos NÃO forem encontrados (cenário atual):

```
[GooglePlayBilling] 🔵 ═══ 6. TESTE 1: BUSCAR NOSSOS PRODUTOS ═══
[GooglePlayBilling] ❌ NENHUM PRODUTO ENCONTRADO!
```

Continue lendo os logs para descobrir a causa:

#### 🔍 Se o Teste 4 encontrar produtos alternativos:

```
[GooglePlayBilling] 🔵 ═══ 9. TESTE 4: PACKAGE NAME ALTERNATIVO ═══
[GooglePlayBilling] ✅ 2 produto(s) ALTERNATIVO(S) encontrado(s)!
[GooglePlayBilling] ⚠️ ATENÇÃO: Os produtos do package name ALTERNATIVO foram encontrados!
```

**Diagnóstico:** O app instalado ainda tem o package name `br.com.stoneup.monitora.app`, OU os produtos com `com.stoneativos.*` não existem/estão inativos no Console.

**Solução:**
- Verifique no Google Play Console qual é o VERDADEIRO package name do app
- Verifique se os produtos `com.stoneativos.monitoraapp.*` realmente existem e estão ATIVOS

## 📊 Interpretando os Resultados

### Cenário 1: Produtos Encontrados no Teste 1
✅ **SUCESSO!** - O problema estava no build anterior. Use este build.

### Cenário 2: Produtos Encontrados no Teste 4 (alternativos)
⚠️ **Package Name Incorreto**
- O app tem um package name diferente dos produtos
- **Ação:** Verificar qual é o package name real no Console

### Cenário 3: Nenhum Produto Encontrado
❌ **Problema mais grave**

Possíveis causas (em ordem de probabilidade):

1. **Produtos em Rascunho** (MAIS PROVÁVEL)
   - No Console: Monetização → Produtos → Assinaturas
   - Status deve ser: **ATIVO** (não Rascunho)
   - Se estiver Rascunho, clique em "Ativar"
   - Aguarde até 24h para propagação

2. **App Não Publicado em Teste**
   - No Console: Testes → Teste interno
   - Deve ter uma versão publicada
   - Faça upload do AAB da versão 70

3. **Package Name no Console é Outro**
   - No Console: Configuração → Detalhes do app
   - Verifique o "ID do app"
   - Deve corresponder ao usado no código

4. **Conta Não é Testadora**
   - No Console: Testes → Teste interno → Testadores
   - Seu email deve estar na lista
   - Você deve ter aceitado o convite

## 📋 Checklist Pós-Diagnóstico

Após executar o diagnóstico, use este checklist:

### No Google Play Console

```
[ ] Verificar ID do app em Configuração → Detalhes do app
    ID encontrado: _____________________
    Corresponde a com.stoneativos.monitoraapp? [ ] Sim [ ] Não

[ ] Verificar produtos em Monetização → Produtos → Assinaturas
    [ ] com.stoneativos.monitoraapp.monitora existe?
        Status: [ ] Ativo [ ] Rascunho [ ] Não existe
    [ ] com.stoneativos.monitoraapp.stoneupplus existe?
        Status: [ ] Ativo [ ] Rascunho [ ] Não existe

[ ] Verificar trilha de teste em Testes → Teste interno
    [ ] Versão publicada: _____
    [ ] Status: [ ] Disponível [ ] Em revisão [ ] Rascunho

[ ] Verificar testadores em Testes → Teste interno → Testadores
    [ ] Email ______________ está na lista?
    [ ] Convite foi aceito?
```

### No Dispositivo

```
[ ] Package name instalado: _____________________
[ ] Usando mesma conta Gmail do Console?
[ ] Cache do Play Store foi limpo?
[ ] Conectado à internet?
```

## 🎯 Próximos Passos Baseados no Diagnóstico

### Se Produtos Foram Encontrados
1. ✅ Teste a compra normalmente
2. ✅ O botão "Comprar via Google Play" deve abrir a tela do Google Play
3. ✅ Complete a compra de teste

### Se Produtos NÃO Foram Encontrados

#### Opção A: Produtos com `com.stoneativos.*` estão inativos
1. Ative-os no Google Play Console
2. Aguarde até 24h
3. Limpe cache do Play Store: `adb shell pm clear com.android.vending`
4. Teste novamente

#### Opção B: Package name do app no Console é `br.com.stoneup.monitora.app`
1. Opção 1 (RECOMENDADO): Mudar código para usar `br.com.stoneup.monitora.app`
2. Opção 2: Criar produtos novos com prefix `com.stoneativos.monitoraapp.*`

#### Opção C: App não está em teste interno
1. Build do AAB: `cd android && .\gradlew.bat bundleRelease`
2. Upload no Console: Testes → Teste interno → Nova versão
3. Aguarde aprovação (geralmente minutos)
4. Teste novamente

## 🛠️ Comandos Úteis

### Rebuild Completo (se necessário)
```bash
# Limpar tudo
cd android
.\gradlew.bat clean
cd ..
rm -rf android/app/build

# Rebuild completo
npx expo prebuild --platform android --clean
cd android
.\gradlew.bat assembleRelease
cd ..

# Reinstalar
adb uninstall com.stoneativos.monitoraapp
adb install android\app\build\outputs\apk\release\app-release.apk
```

### Ver Logs Filtrados
```bash
# Apenas Google Play Billing
adb logcat | findstr -i "GooglePlayBilling"

# Diagnóstico completo
adb logcat | findstr -i "GooglePlay Billing Checkout"

# Salvar logs em arquivo
adb logcat | findstr -i "GooglePlay Billing" > logs-billing.txt
```

### Verificar Package Name do App Instalado
```bash
# Ver todos os packages instalados com "monitora"
adb shell pm list packages | findstr monitora

# Ver detalhes do package
adb shell dumpsys package com.stoneativos.monitoraapp | findstr -i "version"
```

## 📸 Screenshots Importantes

Para análise mais profunda, tire screenshots de:

1. **Google Play Console → Monetização → Produtos → Assinaturas**
   - Mostrando lista completa de produtos e STATUS

2. **Google Play Console → Configuração → Detalhes do app**
   - Mostrando o "ID do app" (package name oficial)

3. **Google Play Console → Testes → Teste interno**
   - Mostrando versão publicada e status

4. **Logs do Diagnóstico Completo**
   - Todo o output do diagnóstico (do início ao fim)

## 💡 Dicas

- Execute o diagnóstico TODA VEZ que reconstruir o app
- Os logs são sua melhor ferramenta de debug
- Se produtos alternativos forem encontrados, é sinal de package name incompatível
- Aguarde SEMPRE 24h após ativar produtos no Console
- Limpe o cache do Play Store entre testes

## ✨ Resumo

1. ✅ Build versão 70 criado
2. ✅ Sistema de diagnóstico implementado
3. ✅ Botão de diagnóstico disponível no app (modo dev)
4. ✅ 10 testes diferentes para identificar o problema
5. ✅ Logs detalhados com todas as informações

**Agora você tem todas as ferramentas para descobrir EXATAMENTE por que os produtos não estão sendo encontrados!** 🎯
