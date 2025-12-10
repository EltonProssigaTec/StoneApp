# 🎯 Qual Sistema de Pagamento Usar?

Você tem **3 opções** para implementar assinaturas no seu app:

## 📊 Comparação Rápida

| Característica | Google Play Billing Nativo | RevenueCat | Juno (Atual) |
|---|---|---|---|
| **Plataforma** | Android apenas | Android + iOS | Web + Mobile |
| **Complexidade** | Média | Baixa | Alta |
| **Custo Extra** | Grátis | Grátis até 10k/mês | Taxa por transação |
| **Backend Necessário** | Sim (validação) | Não | Sim |
| **Analytics** | Manual | Automático | Manual |
| **Configuração** | Moderada | Simples | Complexa |
| **Status Atual** | ✅ Implementado | ⚠️ Parcial | ✅ Implementado |

---

## 1️⃣ Google Play Billing Nativo (RECOMENDADO para Android)

### ✅ Vantagens
- **Sem custos extras** além da taxa do Google (15-30%)
- **Controle total** sobre o fluxo de pagamento
- **Integração nativa** com Android
- **Código já implementado** no seu projeto
- **Testável via ADB wireless** (que você já configurou!)

### ❌ Desvantagens
- Funciona **apenas no Android**
- Requer **validação no backend** para segurança
- Mais **código para manter**
- Analytics e métricas **manuais**

### 📂 Arquivos
- Serviço: [services/googlePlayBilling.ts](services/googlePlayBilling.ts)
- Tela: [app/planos-google-play.tsx](app/planos-google-play.tsx)
- SKUs configurados:
  - `br.com.stoneup.monitora.app.monitora` (Mensal)
  - `br.com.stoneup.monitora.app.stoneupplus` (Anual)

### 🚀 Como Usar
1. Use a tela `planos-google-play.tsx`
2. Build com `npx expo prebuild` + `eas build`
3. Teste via ADB wireless (já configurado)
4. Implemente validação no backend (opcional mas recomendado)

---

## 2️⃣ RevenueCat (RECOMENDADO para Multi-plataforma)

### ✅ Vantagens
- **Funciona em Android + iOS** com o mesmo código
- **Dashboard completo** com analytics, métricas, cohorts
- **Webhooks automáticos** para backend
- **Grátis até $10k MTR/mês** (Monthly Tracked Revenue)
- **Validação automática** de compras
- **Suporte a ofertas** e testes A/B
- **Integra com analytics** (Amplitude, Mixpanel, etc)

### ❌ Desvantagens
- Depende de **serviço terceiro**
- Precisa de **API Key** (conta no RevenueCat)
- **Configuração inicial** no dashboard
- Pode ter **custo** se passar de $10k MTR/mês

### 📂 Arquivos
- Serviço: [services/revenueCat.ts](services/revenueCat.ts)
- Tela: [app/planos-melhorado.tsx](app/planos-melhorado.tsx)

### 🚀 Como Usar
1. Criar conta em https://www.revenuecat.com
2. Obter API Keys (Android + iOS)
3. Configurar em `services/revenueCat.ts:24-27`
4. Mapear produtos no Dashboard do RevenueCat
5. Usar a tela `planos-melhorado.tsx`

### 📋 Setup RevenueCat
```typescript
// services/revenueCat.ts
const REVENUECAT_API_KEYS = {
  android: 'goog_sua_api_key_aqui',
  ios: 'appl_sua_api_key_aqui',
};
```

**Documentação completa**: [REVENUECAT_SETUP_GUIA_COMPLETO.md](REVENUECAT_SETUP_GUIA_COMPLETO.md)

---

## 3️⃣ Juno (Sistema Atual - Web/PIX)

### ✅ Vantagens
- **Já implementado** e funcionando
- **PIX + Cartão** de crédito
- **Funciona na web**
- Bom para **Brasil**

### ❌ Desvantagens
- **Não é in-app** (não usa Google Play/App Store)
- **Violação das políticas** da Google Play/App Store
- Apps podem ser **removidos das lojas**
- **UX inferior** (redireciona para web)

### ⚠️ IMPORTANTE
Apps que vendem conteúdo digital/assinaturas **DEVEM** usar o sistema de pagamento da loja (Google Play Billing ou App Store In-App Purchase). Usar Juno/PIX direto pode resultar em:
- Remoção do app das lojas
- Suspensão da conta de desenvolvedor
- Perda de confiança dos usuários

### 💡 Quando Usar Juno
- Apenas na **versão web** do app
- Para **serviços físicos** (não digitais)
- Como **alternativa** ao Google Play (fora das lojas)

---

## 🎯 Recomendação

### Para Teste AGORA (Android + ADB Wireless)
✅ **Use: Google Play Billing Nativo**

**Por quê?**
- Você já tem tudo configurado
- ADB wireless pronto para testar
- SKUs criados no Play Console
- Código implementado e funcionando

**Próximos passos:**
1. Renomear `planos-google-play.tsx` para `planos.tsx` (ou ajustar imports)
2. Testar com ADB wireless seguindo: [TESTE_GOOGLE_PLAY_BILLING.md](TESTE_GOOGLE_PLAY_BILLING.md)
3. Validar todos os cenários de compra
4. (Opcional) Implementar validação no backend

### Para Produção (Android + iOS)
✅ **Use: RevenueCat**

**Por quê?**
- Multi-plataforma (mesmo código)
- Analytics e dashboard prontos
- Validação automática
- Webhooks para backend
- Grátis até $10k MTR/mês

**Próximos passos:**
1. Criar conta no RevenueCat
2. Configurar API Keys
3. Mapear produtos
4. Migrar de Google Play Billing para RevenueCat (simples)

---

## 🔄 Migração entre Sistemas

### De Google Play → RevenueCat
**Simples!** RevenueCat usa o Google Play Billing por baixo dos panos.

```typescript
// Antes (Google Play)
await googlePlayBilling.purchaseSubscription(sku);

// Depois (RevenueCat)
await revenueCatService.purchaseProduct(productId);
```

### De Juno → Google Play/RevenueCat
**Atenção!** Assinaturas do Juno não serão migradas automaticamente. Você precisará:
1. Notificar usuários sobre mudança
2. Cancelar assinaturas Juno
3. Oferecer período de teste/desconto na nova plataforma

---

## 📝 Checklist de Decisão

### Escolha Google Play Billing se:
- [ ] Foca apenas em Android
- [ ] Quer controle total do código
- [ ] Tem backend para validação
- [ ] Não precisa de analytics avançados
- [ ] Quer zero custos extras

### Escolha RevenueCat se:
- [ ] Planeja lançar no iOS também
- [ ] Quer dashboard de analytics
- [ ] Prefere menos código para manter
- [ ] Quer webhooks automáticos
- [ ] Receita < $10k/mês (grátis)

### Use Juno APENAS se:
- [ ] App é apenas web (sem lojas)
- [ ] Vende serviços físicos (não digitais)
- [ ] Está ciente dos riscos das políticas

---

## 🧪 Teste Agora com ADB Wireless

Já que você configurou o ADB wireless, pode testar o **Google Play Billing** imediatamente:

### 1. Build do App
```bash
# Development build
npx expo prebuild
cd android && ./gradlew assembleRelease

# Ou via EAS
npx eas-cli build --platform android --profile preview
```

### 2. Instalar no Dispositivo
```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

### 3. Monitorar Logs
```bash
adb logcat | findstr "GooglePlay\|Planos\|Billing"
```

### 4. Seguir Guia de Teste
Veja: [TESTE_GOOGLE_PLAY_BILLING.md](TESTE_GOOGLE_PLAY_BILLING.md)

---

## 💡 Dica Final

**Para iniciar rapidamente:**
1. Use **Google Play Billing** para MVP/testes
2. Valide modelo de negócio
3. Migre para **RevenueCat** quando escalar para iOS

**Melhor dos dois mundos:**
- Aprendizado com Google Play Billing
- Escalabilidade com RevenueCat
- Migração simples (mesmos SKUs/produtos)

---

## 📚 Recursos

- [Google Play Billing Docs](https://developer.android.com/google/play/billing)
- [RevenueCat Docs](https://docs.revenuecat.com/)
- [Guia de Teste](TESTE_GOOGLE_PLAY_BILLING.md)
- [Setup RevenueCat](REVENUECAT_SETUP_GUIA_COMPLETO.md)
- [Troubleshooting ADB](ADB_TROUBLESHOOTING.md)

---

## ❓ FAQ

**P: Posso usar os dois sistemas juntos?**
R: Não recomendado. Escolha um para evitar conflitos.

**P: Preciso de backend?**
R: Google Play: sim (recomendado). RevenueCat: não (já valida).

**P: Quanto custa?**
R: Google Play: 15-30% por transação. RevenueCat: grátis até $10k MTR/mês.

**P: Posso testar sem build release?**
R: Sim, mas precisa de development build (não funciona no Expo Go).

**P: E o plano trimestral?**
R: Crie o produto no Play Console, depois descomente o SKU no código.

---

**Status:** ✅ Pronto para teste com ADB wireless
**Recomendação:** Google Play Billing Nativo → RevenueCat (futuro)
