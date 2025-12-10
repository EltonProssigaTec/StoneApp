# Produtos Não Encontrados - Diagnóstico e Solução

## Status Atual

✅ **O que está funcionando:**
- Conexão com Google Play Billing estabelecida
- Product IDs corretos identificados:
  - `br.com.stoneup.monitora.app.monitora` (mensal e trimestral)
  - `br.com.stoneup.monitora.app.stoneupplus` (anual)
- Base Plan IDs corretos:
  - `monitora-01` (mensal)
  - `monitora-02` (trimestral)
  - `monitora-anual-01` (anual)

❌ **O que NÃO está funcionando:**
- `fetchProducts()` retorna array vazio para todos os Product IDs
- Erro: "Produto não encontrado no Google Play"

## Causas Mais Prováveis

### 1. Status dos Produtos no Google Play Console ⚠️ MAIS PROVÁVEL

Os produtos podem estar em status **"Rascunho"** (Draft) em vez de **"Ativo"** (Active).

**Como verificar:**
1. Acesse: [Google Play Console](https://play.google.com/console)
2. Selecione seu app: **Monitora**
3. Vá em: **Monetização → Produtos → Assinaturas**
4. Verifique a coluna **"Status"** de cada produto:
   - ❌ Se aparecer "Rascunho" ou "Inativo" → Produtos não estão disponíveis
   - ✅ Se aparecer "Ativo" → Produtos disponíveis

**Como ativar produtos:**
1. Clique em cada produto
2. Verifique se todos os campos obrigatórios estão preenchidos:
   - Nome e descrição
   - Preço em cada país
   - Planos base (Base Plans) configurados
3. Clique em **"Ativar"** ou **"Salvar e ativar"**
4. **IMPORTANTE:** Aguarde até 24 horas para propagação

### 2. App não está publicado em trilha de teste

**Verificar:**
1. Google Play Console → **Testes → Teste interno**
2. Confirme que a versão **69** (ou superior) está **ativa**
3. Status deve ser: **"Disponível para testadores"**

### 3. Conta de teste não adicionada corretamente

**Verificar:**
1. Google Play Console → **Testes → Teste interno**
2. Vá em **"Testadores"**
3. Confirme que seu email está na lista
4. Verifique se aceitou o convite (link no email)
5. **Importante:** Use a MESMA conta Gmail no dispositivo Android

### 4. Cache do Google Play Store

**Solução:**
```bash
# No seu dispositivo Android
adb shell pm clear com.android.vending
```

Ou manualmente no dispositivo:
1. Configurações → Apps → Google Play Store
2. Armazenamento → Limpar cache
3. Limpar dados
4. Reiniciar dispositivo

## Checklist de Verificação

Execute na ordem:

- [ ] **Passo 1:** Verificar status dos produtos no Console (Rascunho vs Ativo)
- [ ] **Passo 2:** Se em Rascunho, ativar produtos e aguardar propagação
- [ ] **Passo 3:** Confirmar trilha de teste interna está ativa
- [ ] **Passo 4:** Confirmar conta de teste está adicionada e convite aceito
- [ ] **Passo 5:** Limpar cache do Google Play Store no dispositivo
- [ ] **Passo 6:** Reinstalar o app: `adb uninstall br.com.stoneup.monitora.app`
- [ ] **Passo 7:** Instalar novamente e testar

## Teste Alternativo: Verificar produtos disponíveis

Adicione este código temporário para listar TODOS os produtos:

```typescript
// No googlePlayBilling.ts, método initialize():
const allProducts = await fetchProducts({ skus: [] }); // Array vazio = todos
console.log('Todos os produtos disponíveis:', allProducts);
```

Se retornar vazio também, confirma que:
- Produtos não estão ativos, OU
- App não está na trilha de teste, OU
- Conta não é testadora

## Solução Temporária para Desenvolvimento

Se os produtos ainda não estiverem prontos no Google Play Console, você pode:

1. **Simular respostas localmente** (apenas para desenvolvimento)
2. **Usar produtos de teste do Google Play**
3. **Pedir ao administrador** para ativar os produtos

## Próximos Passos

### Se produtos estiverem em "Rascunho":
1. Ativar produtos no Google Play Console
2. Aguardar até 24 horas
3. Testar novamente

### Se produtos estiverem "Ativos":
1. Tirar screenshot da tela de produtos (mostrando status)
2. Verificar se package name no app.json corresponde ao do Console:
   - App: `br.com.stoneup.monitora.app`
   - Console: (verificar)
3. Confirmar versão do app no dispositivo corresponde à versão na trilha de teste

## Comandos Úteis

```bash
# Ver package name do app instalado
adb shell pm list packages | findstr monitora

# Ver versão do app instalado
adb shell dumpsys package br.com.stoneup.monitora.app | findstr versionName

# Limpar cache do Play Store
adb shell pm clear com.android.vending

# Reinstalar app
adb uninstall br.com.stoneup.monitora.app
adb install android/app/build/outputs/apk/release/app-release.apk
```

## Referências

- [Google Play Billing: Configurar produtos](https://developer.android.com/google/play/billing/getting-ready#products)
- [Testar compras no app](https://developer.android.com/google/play/billing/test)
- [react-native-iap: Troubleshooting](https://github.com/dooboolab-community/react-native-iap#troubleshooting)
