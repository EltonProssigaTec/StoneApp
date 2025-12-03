# 🚀 Sistema de Assinaturas - Guia Rápido para Backend

## 📦 O que foi implementado no Frontend

✅ **Completo e funcional:**
- Serviço de gerenciamento de assinaturas
- Hook React para controle de estado
- Telas de planos e gerenciamento
- Sistema de Paywall para recursos premium
- Controle de limites de uso por plano
- Modo simulação para desenvolvimento

## 🔌 O que o Backend precisa fazer

### 1. Criar Tabelas no Banco de Dados

Execute os scripts SQL em [API_ENDPOINTS_ASSINATURAS.md](./API_ENDPOINTS_ASSINATURAS.md#-estrutura-do-banco-de-dados):

```sql
-- Principais tabelas:
- subscription_plans  (planos disponíveis)
- subscriptions       (assinaturas dos usuários)
- payments            (histórico de pagamentos)
```

### 2. Implementar Endpoints Essenciais

**Prioridade ALTA 🔴:**

```php
GET  /api/v1.0/monitora/planos
GET  /api/v1.0/monitora/assinaturas/{user_id}
POST /api/v1.0/monitora/assinaturas/criar
POST /api/v1.0/monitora/assinaturas/webhook
```

**Prioridade MÉDIA 🟡:**

```php
POST /api/v1.0/monitora/assinaturas/{id}/cancelar
POST /api/v1.0/monitora/assinaturas/{id}/reativar
GET  /api/v1.0/monitora/assinaturas/{user_id}/pagamentos
```

### 3. Integrar Gateway de Pagamento

**Recomendado para Brasil:** Mercado Pago

#### Instalação (Composer):
```bash
composer require mercadopago/dx-php
```

#### Configuração Básica:
```php
<?php
use MercadoPago\SDK;
use MercadoPago\Payment;

// Configurar credenciais
SDK::setAccessToken(env('MERCADOPAGO_ACCESS_TOKEN'));

// Criar pagamento
$payment = new Payment();
$payment->transaction_amount = 15.00;
$payment->token = $request->input('card_token');
$payment->description = 'Assinatura Monitora Mês';
$payment->installments = 1;
$payment->payment_method_id = 'visa';
$payment->payer = [
    'email' => $user->email
];

$payment->save();

return response()->json([
    'success' => true,
    'payment_id' => $payment->id,
    'status' => $payment->status
]);
```

### 4. Configurar Webhook

**URL do Webhook:**
```
https://api.stoneup.com.br/api/v1.0/monitora/assinaturas/webhook
```

**Exemplo de Handler:**
```php
public function handleWebhook(Request $request)
{
    // Validar assinatura do Mercado Pago
    $signature = $request->header('x-signature');
    if (!$this->validateSignature($signature, $request->all())) {
        return response()->json(['error' => 'Invalid signature'], 401);
    }

    $type = $request->input('type');
    $paymentId = $request->input('data.id');

    if ($type === 'payment') {
        $payment = \MercadoPago\Payment::find_by_id($paymentId);

        if ($payment->status === 'approved') {
            // Ativar assinatura
            $this->activateSubscription($payment);
        } elseif ($payment->status === 'rejected') {
            // Notificar usuário
            $this->notifyPaymentFailed($payment);
        }
    }

    return response()->json(['success' => true]);
}
```

### 5. Lógica de Renovação Automática

Criar um comando Artisan (Laravel) ou cron job:

```php
<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;

class RenewSubscriptions extends Command
{
    protected $signature = 'subscriptions:renew';

    public function handle()
    {
        $subscriptions = Subscription::where('status', 'active')
            ->where('auto_renew', true)
            ->whereDate('next_billing_date', '<=', now())
            ->get();

        foreach ($subscriptions as $subscription) {
            try {
                $this->processRenewal($subscription);
            } catch (\Exception $e) {
                Log::error('Renewal failed', [
                    'subscription_id' => $subscription->id,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }

    private function processRenewal($subscription)
    {
        // Cobrar via gateway
        $payment = $this->chargeCustomer($subscription);

        if ($payment->status === 'approved') {
            // Atualizar datas
            $subscription->update([
                'next_billing_date' => now()->addMonth(),
                'end_date' => now()->addMonth()
            ]);

            // Registrar pagamento
            Payment::create([
                'subscription_id' => $subscription->id,
                'amount' => $subscription->plan->price,
                'status' => 'paid',
                'payment_date' => now()
            ]);
        } else {
            // Falha - tentar novamente em 3 dias
            $subscription->update([
                'next_billing_date' => now()->addDays(3)
            ]);
        }
    }
}
```

**Adicionar ao cron (app/Console/Kernel.php):**
```php
protected function schedule(Schedule $schedule)
{
    // Executar diariamente às 3h
    $schedule->command('subscriptions:renew')->dailyAt('03:00');
}
```

---

## 🧪 Testando a Integração

### 1. Configurar Sandbox do Mercado Pago

```env
MERCADOPAGO_PUBLIC_KEY=TEST-xxxxx
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxx
```

### 2. Cartões de Teste

```
Aprovado:
  - Número: 5031 4332 1540 6351
  - CVV: 123
  - Validade: 11/25

Recusado:
  - Número: 5031 7557 3453 0604
  - CVV: 123
  - Validade: 11/25
```

### 3. Testar Endpoints

```bash
# Listar planos
curl -X GET https://api.stoneup.com.br/api/v1.0/monitora/planos

# Criar assinatura (simular)
curl -X POST https://api.stoneup.com.br/api/v1.0/monitora/assinaturas/criar \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "plan_type": "monthly",
    "simulate": true
  }'

# Buscar assinatura do usuário
curl -X GET https://api.stoneup.com.br/api/v1.0/monitora/assinaturas/{user_id} \
  -H "Authorization: Bearer {token}"
```

---

## 📊 Estrutura de Resposta Esperada

### Sucesso:
```json
{
  "success": true,
  "dados": { /* data */ },
  "message": "Operação realizada com sucesso"
}
```

### Erro:
```json
{
  "success": false,
  "message": "Descrição do erro",
  "errors": { /* validation errors */ }
}
```

---

## 🔐 Segurança

### Validações Obrigatórias:

1. **Autenticação:** Validar Bearer token em todos os endpoints protegidos
2. **Autorização:** Usuário só pode acessar suas próprias assinaturas
3. **Webhook:** Validar assinatura do gateway (x-signature header)
4. **Pagamento:** Nunca confiar em valores do frontend (sempre usar valores do banco)
5. **Rate Limiting:** Limitar requisições por IP/usuário

### Exemplo de Middleware:
```php
public function handle($request, Closure $next)
{
    $user = auth()->user();
    $resourceUserId = $request->route('user_id');

    if ($user->id !== $resourceUserId) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }

    return $next($request);
}
```

---

## 📧 Notificações

Enviar emails em:

| Evento | Template |
|--------|----------|
| Assinatura ativada | `subscription_activated.blade.php` |
| Pagamento aprovado | `payment_approved.blade.php` |
| Pagamento recusado | `payment_failed.blade.php` |
| Assinatura expirando (7 dias) | `subscription_expiring.blade.php` |
| Assinatura renovada | `subscription_renewed.blade.php` |
| Assinatura cancelada | `subscription_cancelled.blade.php` |

---

## 📝 Logs Importantes

```php
Log::channel('subscriptions')->info('Subscription created', [
    'user_id' => $user->id,
    'plan_type' => $planType,
    'amount' => $amount,
    'payment_id' => $paymentId
]);

Log::channel('payments')->warning('Payment failed', [
    'subscription_id' => $subscriptionId,
    'reason' => $errorMessage,
    'retry_count' => $retryCount
]);
```

---

## 🐛 Debug Frontend

Se algo não funcionar, o frontend tem logs detalhados:

```
[Subscription] Usando planos locais (API indisponível)
[useSubscription] Erro ao carregar assinatura: {error}
[FeatureUsage] Erro ao buscar uso: {error}
```

Para ver logs do app:
```bash
# React Native
npx react-native log-android
npx react-native log-ios

# Expo
npx expo start
# Pressionar 'j' para abrir debugger
```

---

## ✅ Checklist de Deploy

Antes de colocar em produção:

- [ ] Tabelas criadas no banco
- [ ] Endpoints implementados e testados
- [ ] Gateway configurado (produção)
- [ ] Webhook configurado e testando
- [ ] Cron de renovação ativo
- [ ] Emails funcionando
- [ ] Logs configurados
- [ ] Rate limiting ativo
- [ ] Backup do banco configurado
- [ ] Monitoramento (Sentry/New Relic)

---

## 📚 Documentação Completa

- **Endpoints detalhados:** [API_ENDPOINTS_ASSINATURAS.md](./API_ENDPOINTS_ASSINATURAS.md)
- **Guia de uso (Frontend):** [GUIA_ASSINATURAS.md](./GUIA_ASSINATURAS.md)

---

## 💬 Contato

**Dúvidas técnicas:**
- Mobile Team: mobile@stoneup.com.br
- Backend Team: backend@stoneup.com.br

**Acesso ao repositório:**
- GitHub: `github.com/stoneup/monitora-mobile`

---

## 🎯 Priorização Sugerida

### Sprint 1 (Essencial - 1 semana)
1. Criar tabelas no banco
2. Implementar endpoints básicos (CRUD)
3. Integrar Mercado Pago (pagamento único)
4. Configurar webhook básico

### Sprint 2 (Importante - 1 semana)
5. Implementar renovação automática (cron)
6. Sistema de notificações por email
7. Cancelamento e reativação
8. Histórico de pagamentos

### Sprint 3 (Melhorias - 1 semana)
9. Dashboard admin para gestão
10. Relatórios de receita (MRR, churn)
11. Sistema de cupons/descontos
12. Testes automatizados

---

**Última atualização:** 2025-12-03
**Responsável:** Time Mobile (Frontend completo ✅)
**Aguardando:** Time Backend (Implementação dos endpoints)
