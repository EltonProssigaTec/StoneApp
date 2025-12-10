# ⚠️ AÇÃO NECESSÁRIA: SKUs Incompletos

## 🔴 Problema

Você mencionou ter **3 produtos/assinaturas**:
- ✅ Mensal (R$ 14,99/mês)
- ⚠️ Trimestral (R$ 34,99/3 meses) - **FALTANDO NO CÓDIGO**
- ✅ Anual (R$ 59,99/ano)

Mas o código atual só tem **2 SKUs** configurados!

## 📋 O que preciso saber

Por favor, me forneça as seguintes informações do **Google Play Console**:

### 1. Acesse o Google Play Console
- Vá em: https://play.google.com/console
- Selecione seu app
- Vá em: **Monetização** → **Produtos** → **Assinaturas**

### 2. Copie os 3 SKUs exatos

Você deve ver algo como:

| Nome do Produto | ID do Produto (SKU) | Preço | Período |
|-----------------|---------------------|-------|---------|
| Plano Mensal | `br.com.stoneup.monitora.app.???` | R$ 14,99 | 1 mês |
| Plano Trimestral | `br.com.stoneup.monitora.app.???` | R$ 34,99 | 3 meses |
| Plano Anual | `br.com.stoneup.monitora.app.???` | R$ 59,99 | 1 ano |

### 3. Me envie os 3 SKUs

Exemplo:
```
SKU Mensal: br.com.stoneup.monitora.app.mensal
SKU Trimestral: br.com.stoneup.monitora.app.trimestral
SKU Anual: br.com.stoneup.monitora.app.anual
```

## 🔧 Após me enviar, eu vou:

1. Atualizar `SUBSCRIPTION_SKUS` em [services/googlePlayBilling.ts](services/googlePlayBilling.ts)
2. Atualizar `SKU_TO_PLAN_ID` no mesmo arquivo
3. Atualizar `skuMap` em [app/checkout.tsx](app/checkout.tsx)
4. Garantir que todos os 3 planos funcionem corretamente

## 📸 Como tirar screenshot

Se preferir, pode tirar print da tela de produtos no Google Play Console e me enviar!

---

**Aguardando os 3 SKUs para continuar! 🎯**
