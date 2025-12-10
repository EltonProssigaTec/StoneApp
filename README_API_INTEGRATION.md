# 🎯 Integração de APIs - Guia Completo

## 📚 Documentação Criada

### 1. Análise do APK Antigo
- **[ENDPOINTS_API_ANTIGO.md](ENDPOINTS_API_ANTIGO.md)** - Lista de 50+ endpoints encontrados no APK
- **[ANALISE_APK_CONCLUIDA.md](ANALISE_APK_CONCLUIDA.md)** - Resumo executivo da análise

### 2. Serviços TypeScript Criados
- **[services/plano.service.extended.ts](services/plano.service.extended.ts)** - Gestão de planos e assinaturas
- **[services/busca.service.ts](services/busca.service.ts)** - Busca por CPF/CNPJ e dívidas

### 3. Guias de Integração
- **[INTEGRACAO_API_EXEMPLOS.md](INTEGRACAO_API_EXEMPLOS.md)** - 5 exemplos práticos completos
- **[TESTE_ENDPOINTS_GUIA.md](TESTE_ENDPOINTS_GUIA.md)** - Como testar os endpoints

### 4. Scripts de Teste
- **[test-endpoints.js](test-endpoints.js)** - Teste automático (Node.js)
- **[test-endpoints.py](test-endpoints.py)** - Teste automático (Python)

## 🚀 Início Rápido

### Passo 1: Testar os Endpoints

Antes de integrar, descubra quais endpoints ainda funcionam:

```bash
# Editar test-endpoints.js ou test-endpoints.py
# Substituir: AUTH_TOKEN = 'seu_token_aqui'

# Executar
node test-endpoints.js
# OU
python test-endpoints.py

# Ver relatório
cat endpoint-test-report.json
```

**Por quê?** Alguns endpoints do APK antigo podem ter sido removidos ou alterados.

### Passo 2: Importar os Serviços

Nos seus componentes:

```typescript
import { PlanoServiceExtended } from '@/services/plano.service.extended';
import { BuscaService } from '@/services/busca.service';
```

### Passo 3: Usar nos Componentes

Consulte [INTEGRACAO_API_EXEMPLOS.md](INTEGRACAO_API_EXEMPLOS.md) para exemplos completos.

## 🎯 Endpoints Mais Importantes

### ⭐ Para Assinaturas (Críticos)

#### 1. Verificar Plano Ativo
```typescript
const plano = await PlanoServiceExtended.verificarPlanoAtivo(userId);

if (plano) {
  console.log('Usuário tem plano:', plano.nome);
  // Mostrar opção de alterar plano
} else {
  console.log('Usuário pode assinar qualquer plano');
  // Permitir escolher plano
}
```

**Quando usar:** Sempre antes de permitir nova assinatura.

#### 2. Criar Assinatura
```typescript
await PlanoServiceExtended.inserirPlanoUser({
  idUser: user.id,
  idPlano: plan.id,
  metodoPagamento: 'google_play',
  transactionId: purchase.transactionId,
  purchaseToken: purchase.purchaseToken,
  productId: purchase.productId,
});
```

**Quando usar:** Após pagamento bem-sucedido via Google Play (ou outro método).

#### 3. Alterar Plano
```typescript
await PlanoService.alterarPlano(userId, novoPlanoId);
```

**Quando usar:** Se usuário já tem plano ativo e quer mudar.

### ⭐ Para Busca

#### 1. Buscar por CPF/CNPJ
```typescript
const cpfCnpjLimpo = cpfCnpj.replace(/[^\d]/g, '');
const resultados = await BuscaService.buscarPorCpfCnpj(cpfCnpjLimpo);

if (resultados.length > 0) {
  // Mostrar resultados
  resultados.forEach(empresa => {
    console.log(empresa.razao_social);
    console.log('Dívidas:', empresa.dividas.length);
  });
} else {
  // Nenhum resultado
  showAlert('Nenhum resultado encontrado');
}
```

**Quando usar:** Em telas de busca/consulta.

## 📋 Checklist de Implementação

### Na Tela de Planos
- [ ] Importar `PlanoServiceExtended`
- [ ] Chamar `verificarPlanoAtivo()` no `useEffect`
- [ ] Mostrar plano atual se houver
- [ ] Implementar lógica: alterar vs novo plano

### Na Tela de Checkout
- [ ] Importar `PlanoServiceExtended`
- [ ] Verificar plano ativo antes de pagamento
- [ ] Após pagamento bem-sucedido, chamar `inserirPlanoUser()`
- [ ] Atualizar contexto do usuário
- [ ] Redirecionar para "Minha Assinatura"

### No Google Play Billing Listener
- [ ] Importar `PlanoServiceExtended`
- [ ] No `purchaseUpdatedListener`, após validação:
  - [ ] Obter user ID do AsyncStorage
  - [ ] Mapear Product ID para Plan ID
  - [ ] Chamar `inserirPlanoUser()`
  - [ ] Finalizar transação com Google Play

### Na Tela de Busca (se aplicável)
- [ ] Importar `BuscaService`
- [ ] Campo de CPF/CNPJ com formatação
- [ ] Validar antes de buscar
- [ ] Chamar `buscarPorCpfCnpj()`
- [ ] Mostrar resultados

## 🔥 Integração Mais Importante Agora

**Para resolver o problema do Google Play Billing:**

Edite [services/googlePlayBilling.ts](services/googlePlayBilling.ts#L418) no listener `purchaseUpdatedListener`:

```typescript
import { PlanoServiceExtended } from './plano.service.extended';

// Dentro do purchaseUpdatedListener:
private setupPurchaseListeners(): void {
  this.purchaseUpdateSubscription = purchaseUpdatedListener(
    async (purchase: ProductPurchase) => {
      logInfo('=== COMPRA ATUALIZADA ===');

      if (purchase.transactionReceipt) {
        try {
          // 1. Obter user ID
          const AsyncStorage = await import('@react-native-async-storage/async-storage').then(m => m.default);
          const userJson = await AsyncStorage.getItem('@Auth:user');
          const user = userJson ? JSON.parse(userJson) : null;

          if (!user) throw new Error('Usuário não encontrado');

          // 2. Mapear Product ID para Plan ID
          const planId = PRODUCT_ID_TO_PLAN_ID[purchase.productId];
          if (!planId) throw new Error('Plano não encontrado');

          // 3. ⭐ CRIAR ASSINATURA NO BACKEND
          await PlanoServiceExtended.inserirPlanoUser({
            idUser: user.id,
            idPlano: planId,
            metodoPagamento: 'google_play',
            transactionId: purchase.transactionId || '',
            purchaseToken: purchase.purchaseToken || '',
            productId: purchase.productId,
          });

          logSuccess('✅ Assinatura criada no backend!');

          // 4. Finalizar transação
          await finishTransaction({ purchase, isConsumable: false });

          Alert.alert('Assinatura Ativada! 🎉', 'Seu plano foi ativado com sucesso!');

        } catch (error: any) {
          logError('Erro ao processar compra:', error);
          Alert.alert('Erro', 'Entre em contato com o suporte.');
        }
      }
    }
  );
}
```

**Isso resolve o problema principal!** ⭐

## 📖 Ordem de Leitura Recomendada

1. **[TESTE_ENDPOINTS_GUIA.md](TESTE_ENDPOINTS_GUIA.md)** - Execute os testes primeiro
2. **[ENDPOINTS_API_ANTIGO.md](ENDPOINTS_API_ANTIGO.md)** - Veja quais endpoints existem
3. **[INTEGRACAO_API_EXEMPLOS.md](INTEGRACAO_API_EXEMPLOS.md)** - Veja como integrar
4. **[ANALISE_APK_CONCLUIDA.md](ANALISE_APK_CONCLUIDA.md)** - Resumo executivo

## ⚠️ Avisos Importantes

### 1. SEMPRE verificar plano ativo antes
```typescript
// ❌ ERRADO
await PlanoServiceExtended.inserirPlanoUser(...);

// ✅ CORRETO
const planoAtivo = await PlanoServiceExtended.verificarPlanoAtivo(userId);
if (planoAtivo) {
  // Usar alterarPlano
} else {
  // Usar inserirPlanoUser
}
```

### 2. Validar CPF/CNPJ antes de enviar
```typescript
const cpfCnpjLimpo = cpfCnpj.replace(/[^\d]/g, '');

if (cpfCnpjLimpo.length !== 11 && cpfCnpjLimpo.length !== 14) {
  showAlert('CPF/CNPJ inválido');
  return;
}
```

### 3. Tratar erros de forma amigável
```typescript
try {
  await PlanoServiceExtended.inserirPlanoUser(...);
} catch (error) {
  showAlert('Erro', 'Não foi possível ativar. Entre em contato com o suporte.');
}
```

### 4. Fazer log das operações
```typescript
if (__DEV__) {
  console.log('[Checkout] Criando assinatura:', { userId, planoId });
}
```

## 🎓 Estrutura da API

### Base URL
```
https://api.stoneup.com.br/api/v1.0
```

### Headers Necessários
```typescript
{
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {token}'
}
```

### Formato de Resposta
```typescript
// Sucesso
{
  success: true,
  data: [...] ou {},
  message: "Operação realizada com sucesso"
}

// Erro
{
  success: false,
  error: {
    message: "Mensagem de erro",
    code: "ERROR_CODE"
  }
}
```

## 📞 Suporte

### Problemas Comuns

**1. Token inválido (401)**
- Faça login novamente para obter novo token
- Tokens geralmente expiram em 24h

**2. Endpoint não existe (404)**
- Execute os testes para verificar quais endpoints funcionam
- Atualize para usar endpoints válidos

**3. Erro no servidor (500)**
- Tente novamente mais tarde
- Verifique se os parâmetros estão corretos

**4. Dados não retornados**
- Pode ser normal (ex: usuário sem plano, sem notificações)
- Verifique se o userId/outros IDs estão corretos

## ✨ Próximos Passos

1. **Execute os testes de endpoints**
   ```bash
   node test-endpoints.js
   ```

2. **Veja quais endpoints funcionam**
   ```bash
   cat endpoint-test-report.json | jq .working
   ```

3. **Implemente verificação de plano**
   - Siga [Exemplo 1](INTEGRACAO_API_EXEMPLOS.md#exemplo-1)

4. **Implemente criação de assinatura**
   - Siga [Exemplo 2](INTEGRACAO_API_EXEMPLOS.md#exemplo-2)

5. **Atualize listener do Google Play**
   - Siga [Exemplo 3](INTEGRACAO_API_EXEMPLOS.md#exemplo-3)

6. **Teste o fluxo completo**
   - Faça um teste end-to-end da assinatura

---

**Tudo pronto para integrar! 🚀**

Qualquer dúvida, consulte os documentos específicos ou execute os testes para verificar os endpoints.
