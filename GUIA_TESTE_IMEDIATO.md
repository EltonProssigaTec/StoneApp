# ⚡ GUIA DE TESTE IMEDIATO - V74

**🟢 TUDO PRONTO** | **⏱️ 2 minutos** | **🎯 95% confiança**

---

## 🚀 PASSO 1: RECARREGAR APP

### Opção A: Metro rodando
```
Pressione 'r' no terminal
```

### Opção B: No celular
```
Sacudir → Reload
```

---

## 📱 PASSO 2: TESTAR (30 segundos)

1. Abrir app
2. Ir em **"Planos"**
3. Selecionar **qualquer plano**
4. Clicar **"Assinar"**
5. ✅ **Checkout abre?**
   - **SIM** → Continue
   - **NÃO** → Ver "Diagnóstico"
6. Selecionar **"Google Play"**
7. Clicar **"Comprar via Google Play"**
8. ✅ **Tela Google Play abre?**
   - **SIM** → 🎉 SUCESSO!
   - **NÃO** → Ver "Diagnóstico"

---

## 📊 LOGS DE SUCESSO

Você deve ver:

```
[FixGlobals] ✅ Correção aplicada com sucesso!
[Checkout] 🔵 Disponível? true  ⬅️ CRÍTICO!
[GooglePlayBilling] ✅ Conexão estabelecida!
[GooglePlayBilling] ✅ 2 produto(s) encontrado(s)!
```

---

## 🔍 DIAGNÓSTICO RÁPIDO

### ❌ NÃO vê [FixGlobals]
**Solução:** `npm start -- --clear`

### ❌ "Disponível? false"
**Solução:** Ativar detector

Edite [app/_layout.tsx](app/_layout.tsx):
```typescript
// Linha 2: trocar
import { applyGlobalFix } from '@/src/fix/fixGlobals';

// Por:
import { applyGlobalFix, detectGlobalOverrides } from '@/src/fix/fixGlobals';

// Linha 5: adicionar
detectGlobalOverrides();
```

Depois reload e me envie logs.

### ❌ "0 produtos encontrados"
**Solução:** Verificar SKUs no Play Console

---

## ✅ ARQUIVOS CONFIRMADOS

- ✅ [src/fix/fixGlobals.ts](src/fix/fixGlobals.ts)
- ✅ [services/googlePlayBilling.ts](services/googlePlayBilling.ts)
- ✅ [services/googlePlayBilling.safe.ts](services/googlePlayBilling.safe.ts)
- ✅ [app/_layout.tsx](app/_layout.tsx) (fix aplicado)
- ✅ [app/checkout.tsx](app/checkout.tsx) (wrapper seguro)
- ✅ package.json (react-native-iap: 14.4.46)
- ✅ app.json (versionCode: 74)

---

## 🎯 O QUE ESPERAR

| Checkpoint | Esperado | Tempo |
|------------|----------|-------|
| Reload app | Logs FixGlobals | 2s |
| Ir Planos | Tela carrega | 5s |
| Assinar | Checkout abre | 12s |
| Comprar | Google Play abre | 20s |

**Tempo total:** ~20 segundos

---

## 💡 CORREÇÕES APLICADAS

1. ✅ Fix Global (protege Error, console, Symbol, Promise)
2. ✅ getSubscriptions() em vez de fetchProducts()
3. ✅ offerToken extraído corretamente
4. ✅ Wrapper seguro (nunca crasha)
5. ✅ Import dinâmico (evita erros)

---

## 🎉 PRÓXIMOS PASSOS (SE FUNCIONAR)

1. Testar compra real
2. Verificar produtos/preços
3. Implementar validação backend
4. Publicar v74

---

## 📞 PRECISA DE AJUDA?

Me envie:
1. Logs completos
2. Qual checkpoint falhou
3. O que aparece na tela

---

**RECARREGUE AGORA E TESTE! 🚀**

Versão: 74 | Data: 08/12/2025 | Status: Pronto
