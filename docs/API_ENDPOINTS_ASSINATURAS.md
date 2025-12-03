# Documentação de Endpoints - Sistema de Assinaturas

## Base URL
```
https://api.stoneup.com.br/api/v1.0
```

---

## 📋 Endpoints Necessários

### 1. Listar Planos Disponíveis

**Endpoint:** `GET /monitora/planos`

**Descrição:** Retorna todos os planos de assinatura disponíveis.

**Autenticação:** Não requerida (público)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "dados": [
    {
      "id": "plan_monthly",
      "name": "Monitora Mês",
      "period": "PLANO MENSAL",
      "type": "monthly",
      "price": 15.00,
      "price_monthly": 15.00,
      "features": [
        "Consultas ilimitadas",
        "Monitoramento avançado",
        "Negociar acordos",
        "5 ofertas por mês",
        "Suporte por chat"
      ],
      "active": true
    },
    {
      "id": "plan_quarterly",
      "name": "Monitora Trimestre",
      "period": "PLANO TRIMESTRAL",
      "type": "quarterly",
      "price": 35.00,
      "price_monthly": 11.67,
      "features": [...],
      "badge": {
        "text": "MAIS POPULAR",
        "color": "#FF9500"
      },
      "recommended": true,
      "active": true
    }
  ]
}
```

---

### 2. Buscar Assinatura do Usuário

**Endpoint:** `GET /monitora/assinaturas/{user_id}`

**Descrição:** Retorna a assinatura ativa do usuário.

**Autenticação:** Bearer Token (obrigatório)

**Parâmetros:**
- `user_id` (path, required): ID do usuário

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "dados": {
    "id": "sub_123456",
    "user_id": "user_789",
    "plan_type": "monthly",
    "status": "active",
    "start_date": "2025-01-15T10:00:00.000Z",
    "end_date": "2025-02-15T10:00:00.000Z",
    "next_billing_date": "2025-02-15T10:00:00.000Z",
    "payment_method": "credit_card",
    "auto_renew": true,
    "created_at": "2025-01-15T10:00:00.000Z",
    "updated_at": "2025-01-15T10:00:00.000Z"
  }
}
```

**Resposta quando não há assinatura (404):**
```json
{
  "success": false,
  "message": "Nenhuma assinatura ativa encontrada"
}
```

---

### 3. Criar Assinatura (Iniciar Compra)

**Endpoint:** `POST /monitora/assinaturas/criar`

**Descrição:** Cria uma nova assinatura e inicia o processo de pagamento.

**Autenticação:** Bearer Token (obrigatório)

**Body:**
```json
{
  "plan_type": "monthly",
  "payment_method": "credit_card",
  "auto_renew": true,
  "payment_data": {
    "card_token": "tok_123abc",
    "cardholder_name": "João Silva",
    "installments": 1
  }
}
```

**Campos:**
- `plan_type` (string, required): Tipo do plano (`monthly`, `quarterly`, `annual`)
- `payment_method` (string, required): Método de pagamento (`credit_card`, `pix`, `boleto`)
- `auto_renew` (boolean, optional): Renovação automática (padrão: true)
- `payment_data` (object, required): Dados específicos do método de pagamento

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "Assinatura criada com sucesso",
  "dados": {
    "subscription_id": "sub_123456",
    "payment_id": "pay_789",
    "status": "pending",
    "payment_url": "https://payment.gateway.com/checkout/xyz123",
    "qr_code": "00020101021243...",
    "boleto_url": "https://boleto.com/pdf/123456"
  }
}
```

**Possíveis Erros:**
- `400`: Dados inválidos
- `402`: Pagamento recusado
- `409`: Usuário já possui assinatura ativa

---

### 4. Cancelar Assinatura

**Endpoint:** `POST /monitora/assinaturas/{subscription_id}/cancelar`

**Descrição:** Cancela uma assinatura ativa. O usuário mantém acesso até o fim do período pago.

**Autenticação:** Bearer Token (obrigatório)

**Parâmetros:**
- `subscription_id` (path, required): ID da assinatura

**Body:**
```json
{
  "reason": "Muito caro"
}
```

**Campos:**
- `reason` (string, optional): Motivo do cancelamento

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Assinatura cancelada com sucesso",
  "dados": {
    "subscription_id": "sub_123456",
    "status": "cancelled",
    "access_until": "2025-02-15T10:00:00.000Z"
  }
}
```

---

### 5. Reativar Assinatura

**Endpoint:** `POST /monitora/assinaturas/{subscription_id}/reativar`

**Descrição:** Reativa uma assinatura cancelada (antes de expirar).

**Autenticação:** Bearer Token (obrigatório)

**Parâmetros:**
- `subscription_id` (path, required): ID da assinatura

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Assinatura reativada com sucesso",
  "dados": {
    "subscription_id": "sub_123456",
    "status": "active",
    "next_billing_date": "2025-02-15T10:00:00.000Z"
  }
}
```

---

### 6. Atualizar Método de Pagamento

**Endpoint:** `PUT /monitora/assinaturas/{subscription_id}/pagamento`

**Descrição:** Atualiza o método de pagamento de uma assinatura.

**Autenticação:** Bearer Token (obrigatório)

**Parâmetros:**
- `subscription_id` (path, required): ID da assinatura

**Body:**
```json
{
  "payment_method": "credit_card",
  "payment_data": {
    "card_token": "tok_new_card_456",
    "cardholder_name": "João Silva"
  }
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Método de pagamento atualizado com sucesso"
}
```

---

### 7. Histórico de Pagamentos

**Endpoint:** `GET /monitora/assinaturas/{user_id}/pagamentos`

**Descrição:** Retorna o histórico de pagamentos do usuário.

**Autenticação:** Bearer Token (obrigatório)

**Parâmetros:**
- `user_id` (path, required): ID do usuário
- `limit` (query, optional): Número de resultados (padrão: 10)
- `offset` (query, optional): Paginação (padrão: 0)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "dados": [
    {
      "id": "pay_123",
      "subscription_id": "sub_456",
      "amount": 15.00,
      "status": "paid",
      "payment_method": "credit_card",
      "payment_date": "2025-01-15T10:00:00.000Z",
      "due_date": "2025-01-15T10:00:00.000Z",
      "invoice_url": "https://api.stoneup.com.br/invoices/pay_123.pdf",
      "created_at": "2025-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 10,
    "offset": 0
  }
}
```

---

### 8. Webhook de Pagamento

**Endpoint:** `POST /monitora/assinaturas/webhook`

**Descrição:** Endpoint para receber notificações do gateway de pagamento (Mercado Pago, Stripe, etc.).

**Autenticação:** Assinatura do gateway (validar hash/signature)

**Body (exemplo Mercado Pago):**
```json
{
  "id": 12345,
  "live_mode": true,
  "type": "payment",
  "date_created": "2025-01-15T10:00:00.000Z",
  "user_id": 123456,
  "api_version": "v1",
  "action": "payment.created",
  "data": {
    "id": "pay_123456"
  }
}
```

**Resposta:**
```json
{
  "success": true
}
```

**Ações do Webhook:**
- `payment.created`: Pagamento iniciado
- `payment.approved`: Pagamento aprovado → ativar assinatura
- `payment.rejected`: Pagamento rejeitado → notificar usuário
- `payment.refunded`: Pagamento estornado → cancelar assinatura

---

## 🔐 Autenticação

Todos os endpoints protegidos requerem header:
```
Authorization: Bearer {token}
```

O token é obtido no login (`POST /login_monitora`).

---

## 📊 Status de Assinatura

| Status | Descrição |
|--------|-----------|
| `active` | Assinatura ativa e paga |
| `pending` | Aguardando pagamento |
| `cancelled` | Cancelada pelo usuário (acesso até fim do período) |
| `expired` | Expirada (sem renovação) |
| `inactive` | Inativa (nunca foi ativada ou expirou há muito tempo) |

---

## 💳 Métodos de Pagamento Suportados

1. **Credit Card** (`credit_card`)
   - Tokenização via gateway
   - Suporte a parcelamento
   - Renovação automática

2. **PIX** (`pix`)
   - QR Code gerado
   - Validade: 30 minutos
   - Sem renovação automática

3. **Boleto** (`boleto`)
   - PDF gerado
   - Validade: 3 dias
   - Sem renovação automática

---

## 🔄 Fluxo de Compra

### Fluxo com Cartão de Crédito:

1. **Frontend:** Usuário seleciona plano → tela `/planos`
2. **Frontend:** Coleta dados do cartão
3. **Frontend:** Tokeniza cartão via SDK do gateway (Mercado Pago SDK)
4. **Frontend:** Envia `POST /monitora/assinaturas/criar` com token
5. **Backend:** Processa pagamento via API do gateway
6. **Backend:** Cria assinatura no banco
7. **Backend:** Retorna status ao frontend
8. **Gateway:** Envia webhook com confirmação
9. **Backend:** Atualiza status da assinatura
10. **Frontend:** Atualiza UI (via polling ou websocket)

### Fluxo com PIX:

1-4. (mesmos passos)
5. **Backend:** Gera QR Code via gateway
6. **Backend:** Retorna QR Code + subscription_id
7. **Frontend:** Exibe QR Code para usuário
8. **Usuário:** Paga via app bancário
9. **Gateway:** Envia webhook confirmando pagamento
10. **Backend:** Ativa assinatura
11. **Frontend:** Detecta ativação (polling ou notificação push)

---

## 🧪 Ambiente de Testes

Para testar em desenvolvimento sem gateway real, use o parâmetro `simulate`:

```json
POST /monitora/assinaturas/criar
{
  "plan_type": "monthly",
  "simulate": true
}
```

Backend deve retornar assinatura mockada imediatamente ativa.

---

## 📝 Estrutura do Banco de Dados

### Tabela: `subscriptions`

```sql
CREATE TABLE subscriptions (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  plan_type ENUM('free', 'monthly', 'quarterly', 'annual') NOT NULL,
  status ENUM('active', 'pending', 'cancelled', 'expired', 'inactive') DEFAULT 'pending',
  start_date DATETIME,
  end_date DATETIME,
  next_billing_date DATETIME,
  payment_method VARCHAR(20),
  auto_renew BOOLEAN DEFAULT TRUE,
  gateway_subscription_id VARCHAR(100), -- ID no Mercado Pago/Stripe
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_status (user_id, status),
  INDEX idx_next_billing (next_billing_date)
);
```

### Tabela: `payments`

```sql
CREATE TABLE payments (
  id VARCHAR(50) PRIMARY KEY,
  subscription_id VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  payment_method VARCHAR(20) NOT NULL,
  payment_date DATETIME,
  due_date DATETIME NOT NULL,
  gateway_payment_id VARCHAR(100), -- ID no gateway
  invoice_url VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
  INDEX idx_subscription (subscription_id),
  INDEX idx_status (status),
  INDEX idx_due_date (due_date)
);
```

### Tabela: `subscription_plans`

```sql
CREATE TABLE subscription_plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('free', 'monthly', 'quarterly', 'annual') UNIQUE,
  price DECIMAL(10, 2) NOT NULL,
  price_monthly DECIMAL(10, 2),
  features JSON,
  badge JSON,
  recommended BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🚀 Próximos Passos para Implementação Backend

1. ✅ Criar tabelas no banco de dados
2. ✅ Implementar endpoints básicos (CRUD de assinaturas)
3. ✅ Integrar com gateway de pagamento (Mercado Pago recomendado para Brasil)
4. ✅ Configurar webhook do gateway
5. ✅ Implementar lógica de renovação automática (cron job)
6. ✅ Implementar notificações (email/push) para eventos:
   - Assinatura ativada
   - Pagamento aprovado/rejeitado
   - Assinatura expirando em breve
   - Assinatura renovada
7. ✅ Adicionar logs de auditoria
8. ✅ Implementar testes unitários e de integração
9. ✅ Configurar ambiente de sandbox/staging

---

## 📚 Referências

- [Mercado Pago API Docs](https://www.mercadopago.com.br/developers/pt/docs)
- [Stripe API Docs](https://stripe.com/docs/api)
- [React Native Mercado Pago SDK](https://github.com/blackboxvision/react-native-mercadopago-px)

---

## 💬 Suporte

Para dúvidas sobre a integração, contate:
- Backend Team: backend@stoneup.com.br
- Mobile Team: mobile@stoneup.com.br
