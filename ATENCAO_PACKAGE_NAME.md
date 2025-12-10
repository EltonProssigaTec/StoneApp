# ⚠️ ATENÇÃO: Inconsistência no Package Name

## 🔴 Problema Identificado

Há uma **inconsistência crítica** entre o package name do app e os SKUs configurados:

### Package Name do App (app.json)
```json
"android": {
  "package": "com.stoneativos.monitoraapp"
}
```

### SKUs Configurados (Google Play Console)
```
br.com.stoneup.monitora.app.monitora
br.com.stoneup.monitora.app.stoneupplus
```

## ❌ Por que isso é um problema?

Os SKUs no Google Play Console devem seguir o padrão:
```
<PACKAGE_NAME>.<PRODUTO>
```

**Exemplo correto:**
- Package: `com.stoneativos.monitoraapp`
- SKU Mensal: `com.stoneativos.monitoraapp.mensal`
- SKU Anual: `com.stoneativos.monitoraapp.anual`

## ✅ Soluções Possíveis

### Opção 1: Alterar os SKUs no Google Play Console (RECOMENDADO)

**Vantagens:**
- Não precisa fazer novo build
- Mantém o package name atual

**Passos:**

1. **No Google Play Console**, vá em `Monetização` → `Produtos` → `Assinaturas`

2. **Verifique os SKUs atuais:**
   - Se os produtos ainda não foram publicados, você pode **editar ou deletar**
   - Se já foram publicados, você precisará **criar novos produtos**

3. **Crie/Edite os produtos com os SKUs corretos:**

   | Produto | SKU Correto | Preço | Período |
   |---------|-------------|-------|---------|
   | Plano Mensal | `com.stoneativos.monitoraapp.mensal` | R$ 14,99 | 1 mês |
   | Plano Trimestral | `com.stoneativos.monitoraapp.trimestral` | R$ 34,99 | 3 meses |
   | Plano Anual | `com.stoneativos.monitoraapp.anual` | R$ 59,99 | 1 ano |

4. **Atualizar o código** ([googlePlayBilling.ts:50-56](services/googlePlayBilling.ts#L50-L56)):

```typescript
export const SUBSCRIPTION_SKUS = Platform.select({
  android: [
    'com.stoneativos.monitoraapp.mensal',      // Plano Mensal
    'com.stoneativos.monitoraapp.trimestral',  // Plano Trimestral
    'com.stoneativos.monitoraapp.anual',       // Plano Anual
  ],
  default: [],
}) as string[];
```

5. **Atualizar o mapeamento** ([googlePlayBilling.ts:61-64](services/googlePlayBilling.ts#L61-L64)):

```typescript
const SKU_TO_PLAN_ID: Record<string, string> = {
  'com.stoneativos.monitoraapp.mensal': 'monthly',
  'com.stoneativos.monitoraapp.trimestral': 'quarterly',
  'com.stoneativos.monitoraapp.anual': 'annual',
};
```

6. **Atualizar o checkout** ([checkout.tsx:202-206](app/checkout.tsx#L202-L206)):

```typescript
const skuMap: Record<string, string> = {
  'monthly': 'com.stoneativos.monitoraapp.mensal',
  'quarterly': 'com.stoneativos.monitoraapp.trimestral',
  'annual': 'com.stoneativos.monitoraapp.anual',
};
```

---

### Opção 2: Alterar o Package Name do App

**⚠️ NÃO RECOMENDADO** se o app já está publicado!

Alterar o package name de um app já publicado cria um app completamente novo no Google Play.

---

## 🔍 Como Verificar o Package Name Atual

Execute este comando:

```bash
# Ver package name no AndroidManifest
findstr /C:"package=" android\app\src\main\AndroidManifest.xml

# OU ver no build.gradle
findstr /C:"applicationId" android\app\build.gradle
```

---

## 📝 Checklist de Correção

Após escolher a **Opção 1**:

- [ ] Acessar Google Play Console
- [ ] Verificar produtos atuais em Monetização
- [ ] Criar/Editar produtos com SKUs corretos
- [ ] Aguardar propagação (pode levar até 24h)
- [ ] Atualizar `SUBSCRIPTION_SKUS` no código
- [ ] Atualizar `SKU_TO_PLAN_ID` no código
- [ ] Atualizar `skuMap` no checkout
- [ ] Testar com novo build

---

## 💡 Como isso aconteceu?

Provavelmente:
1. O app foi criado inicialmente com package `com.stoneativos.monitoraapp`
2. Os produtos foram criados com SKUs baseados em `br.com.stoneup.monitora.app`
3. Houve confusão entre diferentes versões do projeto

---

## 🎯 Próximo Passo

**RECOMENDO:** Siga a **Opção 1** e me avise qual o package name correto que está no Google Play Console para eu atualizar o código automaticamente.

Para verificar, rode:
```bash
findstr /C:"applicationId" android\app\build.gradle
```

E me mande o resultado!
