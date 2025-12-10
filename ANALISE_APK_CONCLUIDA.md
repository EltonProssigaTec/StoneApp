# ✅ Análise do APK Antigo - Concluída

## 📋 Resumo da Análise

Analisei o APK antigo (`stone antigo.apk`) e extraí **todos os endpoints da API** que eram usados no projeto antecessor.
Baseado nessa análise, criei **serviços completos** com os endpoints corretos e **exemplos práticos de integração**.

## 📁 Arquivos Criados

### 1. Documentação

| Arquivo | Descrição |
|---------|-----------|
| [ENDPOINTS_API_ANTIGO.md](ENDPOINTS_API_ANTIGO.md) | Lista completa de endpoints encontrados no APK com descrições |
| [INTEGRACAO_API_EXEMPLOS.md](INTEGRACAO_API_EXEMPLOS.md) | Guia completo com 5 exemplos práticos de integração |
| [ANALISE_APK_CONCLUIDA.md](ANALISE_APK_CONCLUIDA.md) | Este arquivo - resumo da análise |

### 2. Serviços TypeScript

| Arquivo | Descrição |
|---------|-----------|
| [services/plano.service.extended.ts](services/plano.service.extended.ts) | Extensão do serviço de planos com endpoints críticos |
| [services/busca.service.ts](services/busca.service.ts) | Serviço completo de busca (CPF/CNPJ, dívidas, empresas) |

## 🎯 Endpoints Críticos Implementados

### ⭐ Planos e Assinaturas

#### 1. **Criar Assinatura** (CRÍTICO)
```typescript
// Endpoint: POST /monitora/inser_plano_user
PlanoServiceExtended.inserirPlanoUser({
  idUser: '123',
  idPlano: '1',
  metodoPagamento: 'google_play',
  transactionId: 'GPA.1234',
  purchaseToken: 'token...',
  productId: 'com.stoneativos.monitoraapp.monitora'
});
```

**Quando usar**: Após o pagamento bem-sucedido via Google Play (ou outro método), este endpoint registra a assinatura no backend.

#### 2. **Verificar Plano Ativo** (IMPORTANTE)
```typescript
// Endpoint: POST /monitora/listar_plano_user
const plano = await PlanoServiceExtended.verificarPlanoAtivo(userId);

if (plano) {
  console.log('Usuário tem plano ativo:', plano.nome);
} else {
  console.log('Usuário não tem plano ativo');
}
```

**Quando usar**: Sempre antes de permitir que o usuário contrate um novo plano. Se já tiver plano, usar endpoint de alteração.

#### 3. **Alterar Plano**
```typescript
// Endpoint: POST /monitora/alterar_plano
// Já existe no plano.service.ts original
PlanoService.alterarPlano(userId, novoPlanoId);
```

#### 4. **Aplicar Cupom de Desconto**
```typescript
// Endpoint: POST /monitora/usarCupom
const result = await PlanoServiceExtended.usarCupom(userId, 'CUPOM2024');
```

### ⭐ Busca

#### 1. **Buscar por CPF/CNPJ** (CRÍTICO)
```typescript
// Endpoint: POST /monitora/searchNegativados/:cpfCnpj
const resultados = await BuscaService.buscarPorCpfCnpj('12345678901');

resultados.forEach(empresa => {
  console.log('Empresa:', empresa.razao_social);
  console.log('Dívidas:', empresa.dividas.length);
});
```

**Quando usar**: Em telas de busca onde o usuário precisa consultar se uma pessoa/empresa tem dívidas.

#### 2. **Buscar Dívidas**
```typescript
// Endpoint: POST /monitora/searchDividas
const dividas = await BuscaService.buscarDividas({
  filtro1: 'valor',
  filtro2: 'valor',
});
```

#### 3. **Consultar Empresas por CNPJ do Credor**
```typescript
// Endpoint: POST /monitora/consult_empresas_cnpjCredor
const empresas = await BuscaService.consultarEmpresasPorCredor('12345678000190');
```

## 🔧 Como Integrar

### Passo 1: Importar os Serviços

```typescript
// No topo do seu componente
import { PlanoServiceExtended } from '@/services/plano.service.extended';
import { BuscaService } from '@/services/busca.service';
```

### Passo 2: Usar nos Componentes

Consulte o arquivo [INTEGRACAO_API_EXEMPLOS.md](INTEGRACAO_API_EXEMPLOS.md) para exemplos completos de:

1. ✅ Verificar plano ativo na tela de planos
2. ✅ Criar assinatura no checkout após pagamento
3. ✅ Atualizar listener do Google Play Billing
4. ✅ Buscar por CPF/CNPJ em tela de pesquisa
5. ✅ Aplicar cupom de desconto no checkout

## 📊 Fluxo Completo de Assinatura

### Cenário: Usuário Quer Assinar um Plano

```
1. Usuário abre tela de planos
   └─> Verificar se tem plano ativo (verificarPlanoAtivo)
       ├─> TEM plano: Mostrar opção de alterar
       └─> NÃO TEM: Permitir escolher qualquer plano

2. Usuário seleciona um plano
   └─> Redirecionar para /checkout?planId=X

3. Usuário escolhe método de pagamento
   └─> Exemplo: Google Play

4. Usuário clica em "Comprar"
   └─> Iniciar fluxo do Google Play (googlePlayBilling.purchaseSubscription)

5. Google Play abre tela de pagamento
   └─> Usuário confirma pagamento

6. Google Play retorna sucesso
   └─> Listener purchaseUpdatedListener é chamado

7. No listener:
   ├─> Validar recibo (opcional)
   ├─> CRIAR ASSINATURA NO BACKEND (inserirPlanoUser) ⭐
   ├─> Atualizar contexto do usuário
   ├─> Finalizar transação com Google Play
   └─> Mostrar mensagem de sucesso

8. Usuário é redirecionado para /minha-assinatura
   └─> Assinatura ativa e funcionando! ✅
```

## 🚨 Pontos Críticos de Atenção

### 1. **SEMPRE verificar plano ativo ANTES de criar novo**
```typescript
// ❌ ERRADO
await PlanoServiceExtended.inserirPlanoUser(...);

// ✅ CORRETO
const planoAtivo = await PlanoServiceExtended.verificarPlanoAtivo(userId);
if (planoAtivo) {
  // Usar alterarPlano ao invés de inserirPlanoUser
  await PlanoService.alterarPlano(userId, novoPlanoId);
} else {
  // Criar novo plano
  await PlanoServiceExtended.inserirPlanoUser(...);
}
```

### 2. **Validar CPF/CNPJ antes de enviar**
```typescript
// Remover formatação
const cpfCnpjLimpo = cpfCnpj.replace(/[^\d]/g, '');

// Validar tamanho
if (cpfCnpjLimpo.length !== 11 && cpfCnpjLimpo.length !== 14) {
  showAlert('Erro', 'CPF/CNPJ inválido');
  return;
}

// Buscar
await BuscaService.buscarPorCpfCnpj(cpfCnpjLimpo);
```

### 3. **Tratar erros de forma amigável**
```typescript
try {
  await PlanoServiceExtended.inserirPlanoUser(...);
} catch (error) {
  // Não mostrar erro técnico para o usuário
  showAlert(
    'Erro na Ativação',
    'Não foi possível ativar sua assinatura. Entre em contato com o suporte.',
    undefined,
    'error'
  );
}
```

### 4. **Fazer log das operações críticas**
```typescript
if (__DEV__) {
  console.log('[Checkout] Criando assinatura:', {
    userId,
    planoId,
    metodoPagamento,
  });
}

await PlanoServiceExtended.inserirPlanoUser(...);

if (__DEV__) {
  console.log('[Checkout] ✅ Assinatura criada com sucesso');
}
```

## 📱 Onde Usar Cada Endpoint

### Tela de Planos (`app/(tabs)/planos.tsx`)
- ✅ `verificarPlanoAtivo()` - No `useEffect` ao carregar
- ✅ `PlanoService.listarPlanos()` - Carregar lista de planos

### Tela de Checkout (`app/checkout.tsx`)
- ✅ `verificarPlanoAtivo()` - Antes de permitir pagamento
- ✅ `inserirPlanoUser()` - Após pagamento bem-sucedido
- ✅ `usarCupom()` - Quando usuário aplicar cupom

### Listener do Google Play (`services/googlePlayBilling.ts`)
- ✅ `inserirPlanoUser()` - No `purchaseUpdatedListener` após validação

### Tela de Busca (`app/(tabs)/busca.tsx`)
- ✅ `buscarPorCpfCnpj()` - Ao submeter busca
- ✅ `getDivida()` - Ao clicar em detalhes de dívida
- ✅ `getEmpresaDivida()` - Ao clicar em empresa

### Tela "Minha Assinatura" (`app/minha-assinatura.tsx`)
- ✅ `verificarPlanoAtivo()` - No `useEffect` ao carregar
- ✅ `PlanoService.removerPlanoUser()` - Ao cancelar

## 🎓 Entendendo a Estrutura da API

### Formato de Resposta Padrão
```typescript
{
  success: true,
  data: [...],  // ou {} para objetos únicos
  message: "Operação realizada com sucesso"
}
```

### Formato de Erro Padrão
```typescript
{
  success: false,
  error: {
    message: "Mensagem de erro",
    code: "ERROR_CODE"
  }
}
```

### Headers Necessários
```typescript
{
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {token}'  // Adicionado automaticamente pelo interceptor
}
```

## 📝 Checklist Final de Implementação

### Configuração Base
- [x] Serviços criados (`plano.service.extended.ts`, `busca.service.ts`)
- [x] Documentação completa criada
- [x] Exemplos práticos fornecidos
- [ ] Importar serviços nas telas
- [ ] Adicionar chamadas nos componentes

### Fluxo de Assinatura
- [ ] Verificar plano ativo na tela de planos
- [ ] Atualizar checkout para criar assinatura após pagamento
- [ ] Atualizar listener do Google Play Billing
- [ ] Testar fluxo completo end-to-end

### Busca (se aplicável)
- [ ] Implementar tela de busca
- [ ] Adicionar campo de CPF/CNPJ com formatação
- [ ] Chamar `buscarPorCpfCnpj()` ao submeter
- [ ] Mostrar resultados

### Testes
- [ ] Testar verificação de plano ativo
- [ ] Testar criação de assinatura
- [ ] Testar alteração de plano
- [ ] Testar cancelamento
- [ ] Testar busca por CPF/CNPJ (se aplicável)

## 🔗 Próximos Passos

1. **Implementar verificação de plano na tela de planos**
   - Seguir exemplo em [INTEGRACAO_API_EXEMPLOS.md](INTEGRACAO_API_EXEMPLOS.md#exemplo-1)

2. **Atualizar checkout para criar assinatura**
   - Seguir exemplo em [INTEGRACAO_API_EXEMPLOS.md](INTEGRACAO_API_EXEMPLOS.md#exemplo-2)

3. **Atualizar listener do Google Play Billing**
   - Seguir exemplo em [INTEGRACAO_API_EXEMPLOS.md](INTEGRACAO_API_EXEMPLOS.md#exemplo-3)

4. **Implementar busca por CPF/CNPJ (se aplicável)**
   - Seguir exemplo em [INTEGRACAO_API_EXEMPLOS.md](INTEGRACAO_API_EXEMPLOS.md#exemplo-4)

5. **Testar fluxo completo**
   - Seguir checklist acima

## ✨ Resultado Final

Com esta análise e implementação, você agora tem:

✅ **Todos os endpoints do projeto antigo** identificados e documentados
✅ **Serviços TypeScript completos** prontos para uso
✅ **Exemplos práticos** de como integrar em cada tela
✅ **Fluxo de assinatura completo** documentado
✅ **Busca de CPF/CNPJ** implementada e pronta
✅ **Verificação de plano ativo** para evitar duplicação

**Agora é só seguir os exemplos e integrar nas telas! 🚀**

