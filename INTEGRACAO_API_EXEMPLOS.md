# 🔧 Guia de Integração das APIs - Exemplos Práticos

## 📦 Arquivos Criados

1. **[services/plano.service.extended.ts](services/plano.service.extended.ts)** - Extensão do serviço de planos
   - `inserirPlanoUser()` - Criar assinatura após pagamento
   - `verificarPlanoAtivo()` - Verificar se usuário tem plano ativo
   - `usarCupom()` - Aplicar cupom de desconto
   - `assinarPlanoFluxoFull()` - Fluxo completo de assinatura

2. **[services/busca.service.ts](services/busca.service.ts)** - Serviço de busca
   - `buscarPorCpfCnpj()` - Buscar por CPF/CNPJ
   - `buscarDividas()` - Buscar dívidas com filtros
   - `consultarEmpresasPorCredor()` - Buscar empresas por CNPJ do credor
   - `getDivida()` - Obter detalhes de dívida
   - `getEmpresaDivida()` - Obter dívidas de uma empresa

## 🎯 Exemplo 1: Verificar Plano Ativo na Tela de Planos

### Arquivo: `app/(tabs)/planos.tsx`

```typescript
import { useState, useEffect } from 'react';
import { PlanoServiceExtended } from '@/services/plano.service.extended';
import { useAuth } from '@/contexts/AuthContext';

export default function PlanosScreen() {
  const { user } = useAuth();
  const [planoAtivo, setPlanoAtivo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verificarPlanoAtivo();
  }, []);

  const verificarPlanoAtivo = async () => {
    try {
      setLoading(true);

      const plano = await PlanoServiceExtended.verificarPlanoAtivo(user.id);

      if (plano) {
        setPlanoAtivo(plano);
        console.log('[Planos] Usuário tem plano ativo:', plano.nome);
      } else {
        setPlanoAtivo(null);
        console.log('[Planos] Usuário não tem plano ativo');
      }
    } catch (error) {
      console.error('[Planos] Erro ao verificar plano:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelecionarPlano = (plano: any) => {
    if (planoAtivo) {
      // Usuário já tem plano, perguntar se quer alterar
      showAlert(
        'Alterar Plano',
        `Você já possui o plano ${planoAtivo.nome}. Deseja alterar para ${plano.nome}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Alterar',
            onPress: () => router.push({
              pathname: '/checkout',
              params: { planId: plano.id, isUpgrade: 'true' }
            })
          }
        ]
      );
    } else {
      // Usuário não tem plano, ir direto para checkout
      router.push({
        pathname: '/checkout',
        params: { planId: plano.id }
      });
    }
  };

  return (
    <View>
      {/* Mostrar plano atual se houver */}
      {planoAtivo && (
        <View style={styles.planoAtualCard}>
          <Text style={styles.planoAtualTitle}>Seu Plano Atual</Text>
          <Text style={styles.planoAtualNome}>{planoAtivo.nome}</Text>
          <Text style={styles.planoAtualStatus}>
            Status: {planoAtivo.mp_status === 'authorized' ? 'Ativo' : 'Pendente'}
          </Text>
        </View>
      )}

      {/* Lista de planos disponíveis */}
      {!planoAtivo && (
        <Text style={styles.subtitle}>Escolha seu plano:</Text>
      )}
      {/* ... renderizar lista de planos ... */}
    </View>
  );
}
```

## 🎯 Exemplo 2: Criar Assinatura no Checkout (Após Pagamento Google Play)

### Arquivo: `app/checkout.tsx`

```typescript
import { PlanoServiceExtended } from '@/services/plano.service.extended';
import googlePlayBilling from '@/services/googlePlayBilling';
import { useAuth } from '@/contexts/AuthContext';

export default function CheckoutScreen() {
  const { user, updateUser } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);

  const handleGooglePlayPayment = async () => {
    if (!plan) return;

    setLoading(true);
    try {
      console.log('[Checkout] Iniciando pagamento via Google Play...');

      // 1. Iniciar fluxo de compra do Google Play
      const result = await googlePlayBilling.purchaseSubscription(plan.id);

      if (!result.success) {
        showAlert('Erro', result.error || 'Não foi possível processar a compra', undefined, 'error');
        return;
      }

      console.log('[Checkout] Fluxo de compra iniciado. Aguardando conclusão...');

      // IMPORTANTE: O listener do googlePlayBilling vai processar a compra
      // Quando a compra for concluída, ele chamará finalizarAssinatura()

    } catch (error: any) {
      console.error('[Checkout] Erro ao iniciar compra:', error);
      showAlert('Erro', 'Não foi possível iniciar a compra', undefined, 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Finaliza a assinatura criando o registro no backend
   * Esta função deve ser chamada após o pagamento ser confirmado
   */
  const finalizarAssinatura = async (purchase: any) => {
    try {
      console.log('[Checkout] Finalizando assinatura no backend...');

      // 2. Criar assinatura no backend
      await PlanoServiceExtended.inserirPlanoUser({
        idUser: user.id,
        idPlano: plan.id,
        metodoPagamento: 'google_play',
        transactionId: purchase.transactionId,
        purchaseToken: purchase.purchaseToken,
        productId: purchase.productId,
      });

      console.log('[Checkout] ✅ Assinatura criada com sucesso!');

      // 3. Atualizar contexto local do usuário
      await updateUser({ plano: plan.name });

      // 4. Mostrar sucesso e redirecionar
      showAlert(
        'Assinatura Ativada! 🎉',
        `Seu plano ${plan.displayName} foi ativado com sucesso!`,
        [
          {
            text: 'Ver Minha Assinatura',
            onPress: () => router.replace('/minha-assinatura')
          },
          {
            text: 'Ir para Home',
            onPress: () => router.replace('/(tabs)/home')
          }
        ],
        'success'
      );

    } catch (error: any) {
      console.error('[Checkout] Erro ao finalizar assinatura:', error);
      showAlert(
        'Erro na Ativação',
        'Sua compra foi processada, mas houve um erro ao ativar. Entre em contato com o suporte.',
        undefined,
        'error'
      );
    }
  };

  return (
    <View>
      {/* ... UI do checkout ... */}
    </View>
  );
}
```

## 🎯 Exemplo 3: Atualizar o Listener do Google Play Billing

### Arquivo: `services/googlePlayBilling.ts`

No listener de compra bem-sucedida (`purchaseUpdatedListener`), adicionar chamada para finalizar assinatura:

```typescript
import { PlanoServiceExtended } from './plano.service.extended';

// Dentro da classe GooglePlayBillingService:

private setupPurchaseListeners(): void {
  logInfo('Configurando listeners de compra...');

  // Listener para compras bem-sucedidas
  this.purchaseUpdateSubscription = purchaseUpdatedListener(
    async (purchase: ProductPurchase) => {
      logInfo('=== COMPRA ATUALIZADA ===');
      logInfo('Purchase object:', JSON.stringify(purchase, null, 2));

      const receipt = purchase.transactionReceipt;
      if (receipt) {
        logInfo('Receipt encontrado, processando compra...');
        try {
          // 1. Validar o recibo com seu backend (se necessário)
          logInfo('Etapa 1: Validando compra no backend...');
          await this.validatePurchaseWithBackend(purchase);
          logSuccess('Compra validada com sucesso!');

          // 2. CRIAR ASSINATURA NO BACKEND via API
          logInfo('Etapa 2: Criando assinatura no backend...');

          // Obter user ID do AsyncStorage
          const AsyncStorage = await import('@react-native-async-storage/async-storage').then(m => m.default);
          const userJson = await AsyncStorage.getItem('@Auth:user');
          const user = userJson ? JSON.parse(userJson) : null;

          if (!user || !user.id) {
            logError('Usuário não encontrado no AsyncStorage!');
            throw new Error('Usuário não encontrado');
          }

          // Mapear Product ID para Plan ID interno
          const planId = PRODUCT_ID_TO_PLAN_ID[purchase.productId];
          if (!planId) {
            logError('Plan ID não encontrado para Product ID:', purchase.productId);
            throw new Error('Plano não encontrado');
          }

          // Criar assinatura via API
          await PlanoServiceExtended.inserirPlanoUser({
            idUser: user.id,
            idPlano: planId,
            metodoPagamento: 'google_play',
            transactionId: purchase.transactionId || '',
            purchaseToken: purchase.purchaseToken || '',
            productId: purchase.productId,
          });

          logSuccess('Assinatura criada no backend!');

          // 3. Finalizar a transação (confirma para o Google Play)
          logInfo('Etapa 3: Finalizando transação com Google Play...');
          await finishTransaction({ purchase, isConsumable: false });
          logSuccess('Transação finalizada com Google Play!');

          logSuccess('=== COMPRA PROCESSADA COM SUCESSO ===');

          Alert.alert(
            'Assinatura Ativada! 🎉',
            'Seu plano foi ativado com sucesso. Aproveite todos os recursos premium!',
            [{ text: 'OK' }]
          );
        } catch (error: any) {
          logError('Erro ao processar compra');
          logError('Error message:', error?.message);

          Alert.alert(
            'Erro na Ativação',
            'Sua compra foi processada, mas houve um erro ao ativar. Entre em contato com o suporte.',
            [{ text: 'OK' }]
          );
        }
      }
    }
  );

  // ... resto do código ...
}
```

## 🎯 Exemplo 4: Buscar por CPF/CNPJ em uma Tela de Pesquisa

### Arquivo: `app/(tabs)/busca.tsx`

```typescript
import { useState } from 'react';
import { BuscaService } from '@/services/busca.service';
import { TextInput, FlatList } from 'react-native';

export default function BuscaScreen() {
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleBuscar = async () => {
    // Validar CPF/CNPJ
    const cpfCnpjLimpo = cpfCnpj.replace(/[^\d]/g, '');

    if (cpfCnpjLimpo.length !== 11 && cpfCnpjLimpo.length !== 14) {
      showAlert('Erro', 'CPF/CNPJ inválido', undefined, 'error');
      return;
    }

    setLoading(true);
    try {
      console.log('[Busca] Buscando por CPF/CNPJ:', cpfCnpjLimpo);

      const resultados = await BuscaService.buscarPorCpfCnpj(cpfCnpjLimpo);

      if (resultados.length > 0) {
        console.log('[Busca] ✅ Encontrados:', resultados.length, 'resultados');
        setResultados(resultados);
      } else {
        console.log('[Busca] ℹ️ Nenhum resultado encontrado');
        setResultados([]);
        showAlert('Nenhum Resultado', 'Não foram encontrados registros para este CPF/CNPJ', undefined, 'info');
      }
    } catch (error: any) {
      console.error('[Busca] Erro ao buscar:', error);
      showAlert('Erro', 'Não foi possível realizar a busca', undefined, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatarCpfCnpj = (valor: string) => {
    const limpo = valor.replace(/[^\d]/g, '');

    if (limpo.length <= 11) {
      // Formato CPF: 000.000.000-00
      return limpo
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // Formato CNPJ: 00.000.000/0000-00
      return limpo
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite o CPF ou CNPJ"
          value={cpfCnpj}
          onChangeText={(text) => setCpfCnpj(formatarCpfCnpj(text))}
          keyboardType="numeric"
          maxLength={18} // CPF: 14 chars, CNPJ: 18 chars
        />
        <Button
          title={loading ? 'Buscando...' : 'Buscar'}
          onPress={handleBuscar}
          disabled={loading || cpfCnpj.length < 14}
        />
      </View>

      {resultados.length > 0 && (
        <FlatList
          data={resultados}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.resultadoCard}>
              <Text style={styles.resultadoNome}>
                {item.razao_social || item.nome_fantasia || 'Sem nome'}
              </Text>
              <Text style={styles.resultadoDoc}>
                {item.cnpj || item.cpf}
              </Text>
              {item.dividas && item.dividas.length > 0 && (
                <Text style={styles.resultadoDividas}>
                  {item.dividas.length} dívida(s) encontrada(s)
                </Text>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}
```

## 🎯 Exemplo 5: Aplicar Cupom de Desconto

### Arquivo: `app/checkout.tsx` (adicionar ao componente existente)

```typescript
import { PlanoServiceExtended } from '@/services/plano.service.extended';

export default function CheckoutScreen() {
  const { user } = useAuth();
  const [codigoCupom, setCodigoCupom] = useState('');
  const [cupomAplicado, setCupomAplicado] = useState<any | null>(null);
  const [valorComDesconto, setValorComDesconto] = useState<number | null>(null);

  const handleAplicarCupom = async () => {
    if (!codigoCupom.trim()) {
      showAlert('Erro', 'Digite o código do cupom', undefined, 'error');
      return;
    }

    setLoading(true);
    try {
      console.log('[Checkout] Aplicando cupom:', codigoCupom);

      const result = await PlanoServiceExtended.usarCupom(user.id, codigoCupom);

      if (result && result.success) {
        setCupomAplicado(result.cupom);

        // Calcular valor com desconto
        const desconto = result.cupom.porcentagem || result.cupom.valor || 0;
        const novoValor = plan.price - desconto;
        setValorComDesconto(novoValor);

        showAlert(
          'Cupom Aplicado!',
          `Desconto de R$ ${desconto.toFixed(2)} aplicado com sucesso!`,
          undefined,
          'success'
        );
      } else {
        showAlert('Cupom Inválido', 'O cupom digitado não é válido ou já expirou', undefined, 'error');
      }
    } catch (error: any) {
      console.error('[Checkout] Erro ao aplicar cupom:', error);
      showAlert('Erro', 'Não foi possível aplicar o cupom', undefined, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {/* ... Resumo do plano ... */}

      {/* Campo de cupom */}
      <View style={styles.cupomContainer}>
        <TextInput
          style={styles.cupomInput}
          placeholder="Código do cupom"
          value={codigoCupom}
          onChangeText={setCodigoCupom}
          autoCapitalize="characters"
        />
        <Button
          title="Aplicar"
          onPress={handleAplicarCupom}
          disabled={loading || !codigoCupom.trim()}
        />
      </View>

      {/* Mostrar desconto se cupom aplicado */}
      {cupomAplicado && (
        <View style={styles.descontoCard}>
          <Text style={styles.descontoLabel}>Desconto aplicado:</Text>
          <Text style={styles.descontoValor}>
            - R$ {(cupomAplicado.valor || cupomAplicado.porcentagem || 0).toFixed(2)}
          </Text>
        </View>
      )}

      {/* Valor final */}
      <View style={styles.totalContainer}>
        {valorComDesconto !== null ? (
          <>
            <Text style={styles.precoOriginal}>
              De: R$ {plan.price.toFixed(2)}
            </Text>
            <Text style={styles.precoFinal}>
              Por: R$ {valorComDesconto.toFixed(2)}
            </Text>
          </>
        ) : (
          <Text style={styles.precoFinal}>
            Total: R$ {plan.price.toFixed(2)}
          </Text>
        )}
      </View>

      {/* ... Métodos de pagamento ... */}
    </View>
  );
}
```

## 📝 Checklist de Integração

### Para Tela de Planos:
- [ ] Importar `PlanoServiceExtended`
- [ ] Chamar `verificarPlanoAtivo()` no `useEffect`
- [ ] Mostrar plano atual se houver
- [ ] Implementar lógica de alteração de plano vs novo plano

### Para Tela de Checkout:
- [ ] Importar `PlanoServiceExtended`
- [ ] Após pagamento bem-sucedido, chamar `inserirPlanoUser()`
- [ ] Adicionar campo de cupom com `usarCupom()`
- [ ] Atualizar contexto do usuário após assinatura criada

### Para Google Play Billing Listener:
- [ ] Importar `PlanoServiceExtended`
- [ ] No listener de compra bem-sucedida, chamar `inserirPlanoUser()`
- [ ] Buscar user ID do AsyncStorage
- [ ] Mapear Product ID para Plan ID

### Para Tela de Busca:
- [ ] Importar `BuscaService`
- [ ] Implementar campo de CPF/CNPJ com formatação
- [ ] Chamar `buscarPorCpfCnpj()` ao submeter
- [ ] Mostrar resultados em lista

## 🚨 Importante

1. **Sempre** verificar se o usuário tem plano ativo antes de permitir nova assinatura
2. **Sempre** validar CPF/CNPJ no frontend antes de enviar para API
3. **Sempre** tratar erros de forma amigável para o usuário
4. **Sempre** fazer log das operações críticas (pagamento, assinatura)
5. **Nunca** confiar apenas no ID do cliente - validar sempre no backend

## 🔗 Próximos Passos

1. Integrar verificação de plano na tela de planos
2. Integrar criação de assinatura no checkout
3. Atualizar listener do Google Play Billing
4. Implementar busca de CPF/CNPJ (se aplicável ao app)
5. Testar fluxo completo de assinatura end-to-end

