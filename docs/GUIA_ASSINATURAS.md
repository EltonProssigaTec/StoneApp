# Guia de Uso - Sistema de Assinaturas StoneApp

## 📖 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Arquivos](#estrutura-de-arquivos)
3. [Como Usar](#como-usar)
4. [Exemplos Práticos](#exemplos-práticos)
5. [Modo Desenvolvimento](#modo-desenvolvimento)
6. [Integração Backend](#integração-backend)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O sistema de assinaturas do StoneApp permite:

- ✅ Gerenciar múltiplos planos (Gratuito, Mensal, Trimestral, Anual)
- ✅ Controlar acesso a recursos premium
- ✅ Simular assinaturas em modo desenvolvimento
- ✅ Bloquear features com Paywall
- ✅ Gerenciar histórico de pagamentos
- ✅ Cancelar e reativar assinaturas

---

## 📁 Estrutura de Arquivos

```
StoneApp/
├── services/
│   └── subscription.service.ts      # Serviço principal de assinaturas
├── hooks/
│   └── useSubscription.ts           # Hook para gerenciar assinaturas
├── components/
│   ├── ui/
│   │   └── Paywall.tsx              # Modal de bloqueio premium
│   └── hoc/
│       └── withPremium.tsx          # HOC para proteger telas
├── utils/
│   └── feature-limits.ts            # Gerenciador de limites por plano
├── app/
│   ├── planos.tsx                   # Tela de seleção de planos
│   └── gerenciar-assinatura.tsx    # Tela de gerenciamento
└── docs/
    ├── API_ENDPOINTS_ASSINATURAS.md # Documentação da API
    └── GUIA_ASSINATURAS.md          # Este arquivo
```

---

## 🚀 Como Usar

### 1. Hook `useSubscription`

O hook principal para acessar informações da assinatura:

```tsx
import { useSubscription } from '@/hooks/useSubscription';

function MyComponent() {
  const {
    subscription,        // Dados da assinatura
    currentPlan,        // Plano atual do usuário
    isPremium,          // Boolean: é usuário premium?
    isFreePlan,         // Boolean: está no plano gratuito?
    loading,            // Boolean: carregando dados?

    // Funções
    subscribe,          // Criar nova assinatura
    cancelSubscription, // Cancelar assinatura
    hasAccess,          // Verificar acesso a feature
    canAccessFeature,   // Verificar acesso por tipo de plano

    // Utilitários
    formatPrice,        // Formatar preço em BRL
    getRemainingDays,   // Dias restantes da assinatura
    isExpiringSoon,     // Expira em < 7 dias?
  } = useSubscription();

  // Usar...
}
```

### 2. Verificar Acesso a Recursos

#### Método 1: Por nome da feature

```tsx
const { hasAccess } = useSubscription();

if (hasAccess('Consultas ilimitadas')) {
  // Permitir acesso
} else {
  // Mostrar paywall
}
```

#### Método 2: Por tipo de plano mínimo

```tsx
const { canAccessFeature } = useSubscription();

if (canAccessFeature('monthly')) {
  // Usuário tem plano monthly, quarterly ou annual
} else {
  // Usuário é free
}
```

#### Método 3: Hook simplificado

```tsx
import { useIsPremium } from '@/hooks/useSubscription';

function PremiumFeature() {
  const isPremium = useIsPremium();

  if (!isPremium) {
    return <Text>Assine para acessar</Text>;
  }

  return <AdvancedReport />;
}
```

### 3. Proteger Telas Inteiras

Use o HOC `withPremium`:

```tsx
import { withPremium } from '@/components/hoc/withPremium';

function AdvancedReportsScreen() {
  return (
    <View>
      <Text>Relatórios Avançados</Text>
      {/* Conteúdo premium */}
    </View>
  );
}

export default withPremium(AdvancedReportsScreen, {
  feature: 'Relatórios Avançados',
  description: 'Acesse relatórios detalhados da sua saúde financeira',
  requiredPlan: 'Plano Premium'
});
```

### 4. Paywall Manual

Para bloquear partes específicas de uma tela:

```tsx
import { Paywall } from '@/components/ui/Paywall';
import { useIsPremium } from '@/hooks/useSubscription';

function MyScreen() {
  const isPremium = useIsPremium();
  const [showPaywall, setShowPaywall] = useState(false);

  const handlePremiumAction = () => {
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }

    // Executar ação premium
  };

  return (
    <View>
      <Button onPress={handlePremiumAction} title="Recurso Premium" />

      <Paywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="Nome do Recurso"
        description="Descrição do benefício"
        requiredPlan="Plano Mensal"
      />
    </View>
  );
}
```

### 5. Implementar Limites de Uso

Para recursos com limite (ex: 3 consultas/mês no plano free):

```tsx
import { featureUsageManager, getFeatureLimitMessage } from '@/utils/feature-limits';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';

function SearchScreen() {
  const { user } = useAuth();
  const { currentPlan } = useSubscription();

  const handleSearch = async () => {
    if (!user || !currentPlan) return;

    // Verifica se pode usar
    const { canUse, used, limit } = await featureUsageManager.canUseFeature(
      user.id,
      'cpfQueries',
      currentPlan.type
    );

    if (!canUse) {
      Alert.alert(
        'Limite Atingido',
        getFeatureLimitMessage('cpfQueries', used, limit) +
        '\n\nFaça upgrade para consultas ilimitadas!',
        [
          { text: 'Cancelar' },
          { text: 'Ver Planos', onPress: () => router.push('/planos') }
        ]
      );
      return;
    }

    // Realiza a busca
    await performSearch();

    // Incrementa contador
    await featureUsageManager.updateUsage(user.id, 'cpfQueries');
  };

  return (
    <Button onPress={handleSearch} title="Buscar" />
  );
}
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Botão que requer Premium

```tsx
import { useIsPremium } from '@/hooks/useSubscription';
import { useState } from 'react';
import { Paywall } from '@/components/ui/Paywall';

function ExportButton() {
  const isPremium = useIsPremium();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleExport = () => {
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }

    // Exportar relatório
    exportReport();
  };

  return (
    <>
      <Button onPress={handleExport}>
        Exportar Relatório {!isPremium && '🔒'}
      </Button>

      <Paywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="Exportação de Relatórios"
        description="Exporte seus relatórios em PDF e Excel"
      />
    </>
  );
}
```

### Exemplo 2: Menu com Item Premium

```tsx
function SettingsMenu() {
  const { canAccessFeature } = useSubscription();
  const hasAdvanced = canAccessFeature('monthly');

  return (
    <View>
      <MenuItem title="Configurações Básicas" onPress={...} />

      <MenuItem
        title="Configurações Avançadas"
        disabled={!hasAdvanced}
        icon={!hasAdvanced ? 'lock' : undefined}
        onPress={hasAdvanced ? navigateToAdvanced : showUpgradeModal}
      />
    </View>
  );
}
```

### Exemplo 3: Card com Badge Premium

```tsx
function FeatureCard({ feature, isPremium }) {
  return (
    <Card>
      {isPremium && (
        <Badge text="PREMIUM" color="#FFD700" />
      )}
      <Text>{feature.name}</Text>
    </Card>
  );
}
```

---

## 🧪 Modo Desenvolvimento

### Simular Assinatura

Em modo desenvolvimento (`__DEV__ === true`), você pode simular assinaturas sem integração real:

```tsx
const { subscribe } = useSubscription();

// Simula assinatura Premium
await subscribe('monthly', {
  simulate: true,  // ⚠️ Importante!
  payment_method: 'credit_card',
  auto_renew: true,
});
```

Isso cria uma assinatura fake que:
- ✅ É salva no AsyncStorage
- ✅ Persiste entre reloads
- ✅ Ativa todos os recursos premium
- ✅ Pode ser cancelada normalmente

### Limpar Simulação

```tsx
import subscriptionService from '@/services/subscription.service';

// Limpa assinatura simulada
await subscriptionService.clearSimulation();
```

### Resetar Limites de Uso

```tsx
import { featureUsageManager } from '@/utils/feature-limits';

// Reseta contadores do usuário
await featureUsageManager.resetUsage(user.id);
```

### Desabilitar Modo DEV

Para testar o comportamento de produção localmente:

```tsx
// Temporariamente altere no código:
if (false) { // ao invés de: if (__DEV__)
  // lógica de simulação
}
```

---

## 🔌 Integração Backend

### Configurar URL da API

Já está configurado em [services/api.config.ts](../services/api.config.ts:9):

```ts
const BASE_URL = 'https://api.stoneup.com.br/';
```

### Endpoints Esperados

Veja documentação completa em [API_ENDPOINTS_ASSINATURAS.md](./API_ENDPOINTS_ASSINATURAS.md).

Resumo dos endpoints essenciais:

```
GET  /monitora/planos                         # Listar planos
GET  /monitora/assinaturas/{user_id}          # Buscar assinatura
POST /monitora/assinaturas/criar              # Criar assinatura
POST /monitora/assinaturas/{id}/cancelar      # Cancelar
POST /monitora/assinaturas/{id}/reativar      # Reativar
GET  /monitora/assinaturas/{user_id}/pagamentos # Histórico
```

### Adicionar Novo Endpoint

1. Abra [services/subscription.service.ts](../services/subscription.service.ts)
2. Adicione método na classe `SubscriptionService`:

```ts
async getInvoice(invoiceId: string): Promise<Invoice> {
  const response = await api.get(`/monitora/faturas/${invoiceId}`);
  return response.data;
}
```

3. Use no hook ou componente:

```tsx
import subscriptionService from '@/services/subscription.service';

const invoice = await subscriptionService.getInvoice('inv_123');
```

---

## 🔧 Troubleshooting

### Problema: Hook retorna sempre `loading: true`

**Causa:** AuthContext não está inicializado ou usuário não está logado.

**Solução:**
```tsx
const { user, isLogged } = useAuth();

if (!isLogged) {
  return <LoginScreen />;
}

// Agora pode usar useSubscription
```

### Problema: Planos não aparecem na tela

**Causa:** API não implementada ainda, usando fallback local.

**Verificar:**
1. Console deve mostrar: `"[Subscription] Usando planos locais (API indisponível)"`
2. Planos estão hardcoded em [services/subscription.service.ts](../services/subscription.service.ts:50)

**Solução:** Implementar endpoint `GET /monitora/planos` no backend.

### Problema: Assinatura não persiste após reload

**Causa:** AsyncStorage não está salvando corretamente.

**Debug:**
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ver dados salvos
const data = await AsyncStorage.getItem('@Subscription:data');
console.log('Subscription data:', data);
```

### Problema: Paywall não aparece

**Causa:** `visible` prop não está sendo controlada corretamente.

**Solução:**
```tsx
const [showPaywall, setShowPaywall] = useState(false);

// Certifique-se de setar true
setShowPaywall(true);

<Paywall
  visible={showPaywall}  // ✅ Controlado por state
  onClose={() => setShowPaywall(false)}
  {...props}
/>
```

### Problema: Limite de uso não funciona

**Causa:** `featureUsageManager` não está sendo chamado corretamente.

**Verificar:**
```tsx
// ❌ Errado - não checa limite
const handleAction = async () => {
  await performAction();
};

// ✅ Correto - checa antes
const handleAction = async () => {
  const { canUse } = await featureUsageManager.canUseFeature(
    user.id,
    'cpfQueries',
    planType
  );

  if (!canUse) {
    showLimitAlert();
    return;
  }

  await performAction();
  await featureUsageManager.updateUsage(user.id, 'cpfQueries');
};
```

---

## 📚 Referências Adicionais

- [Documentação React Navigation](https://reactnavigation.org/)
- [AsyncStorage Docs](https://react-native-async-storage.github.io/async-storage/)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)

---

## ✅ Checklist de Implementação

### Frontend (✅ Completo)
- [x] Serviço de assinaturas
- [x] Hook useSubscription
- [x] Componente Paywall
- [x] HOC withPremium
- [x] Tela de planos com seleção
- [x] Tela de gerenciamento
- [x] Sistema de limites de uso
- [x] Modo simulação para desenvolvimento

### Backend (⏳ Pendente)
- [ ] Criar tabelas no banco de dados
- [ ] Implementar endpoints da API
- [ ] Integrar com gateway de pagamento
- [ ] Configurar webhooks
- [ ] Sistema de renovação automática
- [ ] Notificações por email/push
- [ ] Logs de auditoria

### Integração (⏳ Pendente)
- [ ] SDK do Mercado Pago ou Stripe
- [ ] Tokenização de cartão
- [ ] Fluxo de checkout completo
- [ ] Tratamento de erros de pagamento
- [ ] Retry logic para pagamentos falhados

---

## 🤝 Contribuindo

Para adicionar novos recursos ao sistema de assinaturas:

1. **Backend primeiro:** Implemente e teste o endpoint na API
2. **Atualize o serviço:** Adicione método em `subscription.service.ts`
3. **Atualize o hook:** Se necessário, expanda `useSubscription`
4. **Documente:** Atualize este guia e o `API_ENDPOINTS_ASSINATURAS.md`
5. **Teste:** Crie testes para o novo recurso

---

**Última atualização:** 2025-12-03
**Versão:** 1.0.0
**Autor:** Claude Code
