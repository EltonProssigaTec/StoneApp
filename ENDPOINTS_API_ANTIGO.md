# 📋 Endpoints da API - Projeto Antecessor

## Endpoints Principais Encontrados no APK Antigo

### 🔍 Busca e Consulta

#### Buscar Empresas/Dividas
```
POST /monitora/searchDividas
POST /monitora/searchNegativados/
POST /monitora/getDivida
POST /monitora/getEmpresaDivida
POST /monitora/listarPreDividasAPI
POST /monitora/negativados
POST /monitora/dividas
POST /monitora/consultar_titulos_monitora
POST /monitora/atualizar_titulos_monitora
POST /monitora/consult_empresas_cnpjCredor
```

### 👤 Usuário e Perfil
```
POST /monitora/editar_usuarios
POST /monitora/endereco_usuarios
POST /monitora/consultar_usuario_endereco
POST /monitora/editar_endereco_cobranca
POST /monitora/editar_senha
POST /monitora/editar_notificacoes_usuarios
POST /monitora/save_notificacoes_usuarios
POST /monitora/load_notificacoes_usuarios
POST /monitora/naolidas_notificacoes_usuarios
POST /monitora/registrar_visualizacao_notificacoes
POST /monitora/anexar_foto_perfil
```

### 💳 Planos e Assinaturas (IMPORTANTE!)
```
POST /monitora/listar_planos
POST /monitora/listar_plano_user           ⭐ VERIFICA PLANO ATIVO
POST /monitora/inser_plano_user            ⭐ CRIAR ASSINATURA
POST /monitora/alterar_plano               ⭐ MUDAR PLANO
POST /monitora/remover_plano_user
POST /monitora/assinar_plano_fluxo_full
POST /monitora/listar_descontos_plano_user
POST /monitora/usarCupom
```

### 💰 Pagamentos
```
POST /monitora/gravarpagamentoloja
POST /monitora/cadastrarCartao
POST /monitora/buscarCartao
POST /monitora/listarEspecies
```

### 📝 Negociações
```
POST /monitora/negociacoes
POST /monitora/termos_negociacao
POST /monitora/storeCliente
POST /monitora/contestar
POST /monitora/registrarPreDivida
POST /monitora/anexar_doc
```

### 💬 Chat e Notificações
```
POST /monitora/load_chat_monitora
POST /monitora/save_chat_monitora
POST /monitora/registrar_visualizacao_chat
POST /monitora/monitoramento
POST /monitora/register_token_firebase
```

### 🏢 Cadastro de Empresas
```
POST /monitora/register_empresa
```

### 🗑️ Exclusão de Conta
```
POST /monitora/user/motivosexclusao
POST /monitora/user/solictarexlusao
```

## 🎯 Endpoints Críticos para Implementar

### 1. Verificar se Usuário Tem Plano Ativo
```typescript
// Endpoint: POST /monitora/listar_plano_user
// Deve retornar o plano ativo do usuário (se houver)

const verificarPlanoAtivo = async (userId: number) => {
  const response = await api.post('/monitora/listar_plano_user', { userId });
  return response.data;
};
```

### 2. Buscar Empresa por CPF/CNPJ
```typescript
// Endpoint: POST /monitora/searchNegativados/
// ou
// Endpoint: POST /monitora/consult_empresas_cnpjCredor

const buscarEmpresaPorCpfCnpj = async (cpfCnpj: string) => {
  const response = await api.post('/monitora/searchNegativados/' + cpfCnpj);
  return response.data;
};
```

### 3. Listar Todos os Planos Disponíveis
```typescript
// Endpoint: POST /monitora/listar_planos

const listarPlanos = async () => {
  const response = await api.post('/monitora/listar_planos');
  return response.data;
};
```

### 4. Criar Assinatura (Após Pagamento)
```typescript
// Endpoint: POST /monitora/inser_plano_user

const criarAssinatura = async (userId: number, planoId: number, metodoPagamento: string) => {
  const response = await api.post('/monitora/inser_plano_user', {
    userId,
    planoId,
    metodoPagamento,
    // outros dados...
  });
  return response.data;
};
```

## 🔧 Como Usar no Projeto Atual

### Estrutura do Serviço de API

O projeto antigo usa a seguinte estrutura:

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.exemplo.com',  // URL base da API
  timeout: 30000,
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Exemplo de Uso em Tela

```typescript
// Em uma tela, por exemplo, na tela de planos

import api from '@/services/api';

const verificarPlanoAtivo = async () => {
  try {
    const response = await api.post('/monitora/listar_plano_user', {
      userId: user.id
    });

    if (response.data && response.data.plano_ativo) {
      // Usuário já tem plano ativo
      setPlanoAtivo(response.data);
    } else {
      // Usuário não tem plano ativo
      setPlanoAtivo(null);
    }
  } catch (error) {
    console.error('Erro ao verificar plano:', error);
  }
};
```

## 📊 Fluxo de Assinatura Completo

### 1. Ao abrir a tela de planos:
```typescript
useEffect(() => {
  // Verificar se usuário já tem plano ativo
  verificarPlanoAtivo();

  // Carregar lista de planos disponíveis
  carregarPlanos();
}, []);
```

### 2. Ao selecionar um plano:
```typescript
const handleSelecionarPlano = async (plano: Plan) => {
  // Verificar novamente se não tem plano ativo
  const planoAtivo = await verificarPlanoAtivo();

  if (planoAtivo) {
    // Mostrar opção de alterar plano
    showAlert('Você já tem um plano ativo', 'Deseja alterar para este plano?');
  } else {
    // Ir para checkout
    router.push({ pathname: '/checkout', params: { planId: plano.id } });
  }
};
```

### 3. Após pagamento bem-sucedido:
```typescript
const confirmarPagamento = async () => {
  try {
    // 1. Criar assinatura na API
    await api.post('/monitora/inser_plano_user', {
      userId: user.id,
      planoId: plan.id,
      metodoPagamento: 'google_play',
      transactionId: purchase.transactionId,
    });

    // 2. Atualizar contexto local
    await updateUser({ plano: plan.name });

    // 3. Redirecionar
    router.replace('/minha-assinatura');
  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
  }
};
```

## 🔑 Pontos Importantes

### Autenticação
- Todos os endpoints requerem autenticação
- Token JWT deve ser enviado no header `Authorization: Bearer {token}`

### IDs de Usuário
- O `userId` deve ser obtido do contexto de autenticação
- Nunca confiar apenas no ID do cliente, sempre validar no backend

### Verificação de Plano
- **SEMPRE** verificar se o usuário tem plano ativo antes de criar novo
- Se já tem plano, usar endpoint `/monitora/alterar_plano` em vez de `/monitora/inser_plano_user`

### CPF/CNPJ
- Formatar antes de enviar (remover pontos, traços, barras)
- Validar formato antes de fazer requisição

## 🚨 Endpoints que Precisam ser Integrados AGORA

1. ✅ `/monitora/listar_plano_user` - Verificar plano ativo
2. ✅ `/monitora/inser_plano_user` - Criar assinatura
3. ✅ `/monitora/alterar_plano` - Alterar assinatura
4. ✅ `/monitora/searchNegativados/` - Buscar por CPF/CNPJ
5. ✅ `/monitora/listar_planos` - Listar planos disponíveis

## 📝 Próximos Passos

1. Criar/atualizar `services/api.ts` com configuração base
2. Criar `services/planos.ts` com funções para gerenciar planos
3. Atualizar tela de planos para verificar plano ativo
4. Atualizar tela de checkout para criar assinatura
5. Implementar busca de CPF/CNPJ nas telas relevantes
