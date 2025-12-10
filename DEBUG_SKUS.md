# 🔍 Debug - SKUs do Google Play

## Problema

O `fetchProducts` retorna array vazio para os SKUs:
- `monitora-01` ❌
- `monitora-02` ❌
- `monitora-anual-01` ❌

## Possível Solução

No Google Play Billing API v5+ (usado pelo react-native-iap v14), você precisa usar o **Product ID** completo, não apenas o Base Plan ID.

### Diferença:

- **Product ID** (Subscription ID): `br.com.stoneup.monitora.app.monitora`
- **Base Plan ID**: `monitora-01`

O `fetchProducts` espera o **Product ID**, não o Base Plan ID!

## Próximo Passo

Vou adicionar um log para buscar **TODOS** os produtos sem filtro e ver o que retorna.

Aguarde o próximo build!
