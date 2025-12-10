# 🧪 Guia de Teste de Endpoints

## 📋 Scripts Criados

Criei dois scripts para testar automaticamente todos os endpoints da API:

1. **[test-endpoints.js](test-endpoints.js)** - Versão Node.js
2. **[test-endpoints.py](test-endpoints.py)** - Versão Python

Ambos fazem a mesma coisa, escolha o que você preferir!

## 🚀 Como Usar

### Opção 1: Node.js

#### Passo 1: Obter seu Token de Autenticação

Você precisa de um token válido da API. Há duas formas de obter:

**Forma A: Pelo App (Mais Fácil)**
1. Faça login no app
2. Use ADB para ver o token armazenado:
   ```bash
   adb shell run-as com.stoneativos.monitoraapp cat files/@Auth:token
   ```

**Forma B: Fazer Login via API**
```bash
curl -X POST https://api.stoneup.com.br/api/v1.0/login \
  -H "Content-Type: application/json" \
  -d '{"email": "seu@email.com", "password": "sua_senha"}'
```

Copie o `token` da resposta.

#### Passo 2: Configurar o Script

Abra `test-endpoints.js` e substitua:

```javascript
const AUTH_TOKEN = 'SEU_TOKEN_AQUI'; // ⚠️ Cole seu token aqui
const TEST_USER_ID = '1'; // ⚠️ Substitua pelo seu ID de usuário
```

#### Passo 3: Executar

```bash
cd c:\Users\pross\PROJETOS_PROSSIGA\StoneApp
node test-endpoints.js
```

### Opção 2: Python

#### Passo 1: Instalar Dependências

```bash
pip install requests
```

#### Passo 2: Obter Token

Mesmo processo acima (Forma A ou B).

#### Passo 3: Configurar o Script

Abra `test-endpoints.py` e substitua:

```python
AUTH_TOKEN = 'SEU_TOKEN_AQUI'  # ⚠️ Cole seu token aqui
TEST_USER_ID = '1'  # ⚠️ Substitua pelo seu ID de usuário
```

#### Passo 4: Executar

```bash
cd c:\Users\pross\PROJETOS_PROSSIGA\StoneApp
python test-endpoints.py
```

## 📊 O Que o Script Faz

O script testa automaticamente **40+ endpoints** encontrados no APK antigo:

### Categorias Testadas:
- ✅ **Planos e Assinaturas** (7 endpoints)
- ✅ **Busca** (CPF/CNPJ, dívidas, empresas) (5 endpoints)
- ✅ **Usuário** (perfil, endereço) (3 endpoints)
- ✅ **Notificações** (2 endpoints)
- ✅ **Pagamentos** (1 endpoint)
- ✅ **Negociações** (1 endpoint)
- ✅ **Chat** (1 endpoint)
- ✅ **Monitoramento** (1 endpoint)

### Para Cada Endpoint:
1. Faz a requisição HTTP
2. Mede o tempo de resposta
3. Verifica se retornou dados
4. Registra se funcionou ou deu erro
5. Mostra informações detalhadas

### Saída do Script:

```
╔════════════════════════════════════════════════════════════╗
║       TESTANDO ENDPOINTS DA API - StoneUP Monitora        ║
╚════════════════════════════════════════════════════════════╝

Base URL: https://api.stoneup.com.br/api/v1.0
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

[1/30] Testando: Listar Planos
    POST /monitora/listar_planos
    ✅ SUCESSO - Status 200 (245ms)
    📊 Dados retornados: SIM

[2/30] Testando: Listar Plano do Usuário
    POST /monitora/listar_plano_user
    ✅ SUCESSO - Status 200 (189ms)
    📊 Dados retornados: Vazio (esperado para alguns casos)

[3/30] Testando: Buscar Negativados por CPF/CNPJ
    POST /monitora/searchNegativados/12345678901
    ❌ FALHA - Status 404
    💬 Erro: Request failed with status code 404
    ⚠️  Endpoint não existe ou foi removido

...
```

## 📄 Relatório Gerado

Ao final, o script gera:

### 1. Relatório no Console

```
╔════════════════════════════════════════════════════════════╗
║                     RELATÓRIO FINAL                        ║
╚════════════════════════════════════════════════════════════╝

📊 RESUMO GERAL:
   ✅ Funcionando: 18
   ❌ Com falha: 7
   ⏭️  Pulados: 5
   📈 Taxa de sucesso: 72.0%

📂 POR CATEGORIA:
   Planos:
      ✅ 4 funcionando
      ❌ 1 com falha
      ⏭️  2 pulados
      📈 80.0% de sucesso

   Busca:
      ✅ 3 funcionando
      ❌ 2 com falha
      📈 60.0% de sucesso

...

✅ ENDPOINTS FUNCIONANDO:
   • Listar Planos
     POST /monitora/listar_planos
     Tempo: 245ms

   • Listar Plano do Usuário
     POST /monitora/listar_plano_user
     Tempo: 189ms

...

❌ ENDPOINTS COM FALHA:
   • Buscar Negativados por CPF/CNPJ
     POST /monitora/searchNegativados/12345678901
     Status: 404 - Request failed

...
```

### 2. Arquivo JSON (`endpoint-test-report.json`)

```json
{
  "timestamp": "2025-12-05T17:30:00.000Z",
  "summary": {
    "working": 18,
    "failing": 7,
    "skipped": 5,
    "success_rate": "72.0%"
  },
  "by_category": {
    "Planos": {
      "working": 4,
      "failing": 1,
      "skipped": 2
    },
    "Busca": {
      "working": 3,
      "failing": 2,
      "skipped": 0
    }
  },
  "working": [
    {
      "name": "Listar Planos",
      "method": "POST",
      "url": "/monitora/listar_planos",
      "status": 200,
      "duration": 245
    }
  ],
  "failing": [
    {
      "name": "Buscar Negativados por CPF/CNPJ",
      "method": "POST",
      "url": "/monitora/searchNegativados/12345678901",
      "status": 404,
      "error": "Request failed"
    }
  ]
}
```

## 🎯 Como Interpretar os Resultados

### Status 200 ✅
- **Endpoint funcionando perfeitamente**
- Use este endpoint no seu código

### Status 401 ⚠️
- Token inválido ou expirado
- Faça login novamente para obter novo token

### Status 404 ❌
- Endpoint não existe ou foi removido
- **NÃO USE** este endpoint no código

### Status 500 ⚠️
- Erro no servidor
- Endpoint pode estar funcionando, mas com problemas no momento
- Tente novamente mais tarde

### Dados Vazios 📊
- Endpoint funciona, mas não retornou dados
- Normal para alguns casos (ex: usuário sem plano, sem notificações, etc.)

## 🔧 Personalizando os Testes

### Adicionar Novos Endpoints

Edite o array `ENDPOINTS_TO_TEST`:

```javascript
{
  name: 'Meu Novo Endpoint',
  method: 'POST',
  url: '/monitora/meu_endpoint',
  body: { param1: 'valor1' },
  category: 'MinhaCategoria',
}
```

### Pular Endpoints Perigosos

Alguns endpoints alteram dados (criar, editar, deletar). Por padrão, eles são pulados:

```javascript
{
  name: 'Inserir Plano Usuário',
  method: 'POST',
  url: '/monitora/inser_plano_user',
  body: { ... },
  category: 'Planos',
  skipTest: true,  // ← Não será testado
}
```

Para testá-los, mude `skipTest: false` ou remova a linha.

### Alterar Timeout

Por padrão, cada requisição tem timeout de 10 segundos:

```javascript
// Node.js
timeout: 10000,  // 10 segundos

// Python
timeout=10  # 10 segundos
```

## 📋 Próximos Passos Após o Teste

1. **Verifique o relatório** (`endpoint-test-report.json`)

2. **Atualize os serviços**:
   - Remova endpoints que retornaram 404
   - Adicione endpoints novos que funcionaram
   - Corrija URLs de endpoints que mudaram

3. **Documente os funcionando**:
   ```markdown
   ## Endpoints Funcionando (Testado em 05/12/2025)
   - ✅ POST /monitora/listar_planos
   - ✅ POST /monitora/listar_plano_user
   - ✅ POST /monitora/buscarCartao
   ```

4. **Atualize os serviços TypeScript**:
   - [services/plano.service.extended.ts](services/plano.service.extended.ts)
   - [services/busca.service.ts](services/busca.service.ts)

## ⚠️ Avisos Importantes

### Cuidado com Endpoints de Escrita
- ❌ NÃO teste endpoints que criam/alteram/deletam dados em produção
- ✅ Use ambiente de desenvolvimento/staging se possível
- ✅ Ou deixe `skipTest: true` para esses endpoints

### Rate Limiting
- O script tem delay de 500ms entre requisições
- Se a API tiver rate limit, aumente o delay:
  ```javascript
  await new Promise(resolve => setTimeout(resolve, 1000)); // 1 segundo
  ```

### Token Expira
- Tokens geralmente expiram em 24h
- Se der erro 401 em todos os endpoints, gere novo token

## 🎓 Exemplo de Uso Real

```bash
# 1. Obter token
curl -X POST https://api.stoneup.com.br/api/v1.0/login \
  -H "Content-Type: application/json" \
  -d '{"email": "seu@email.com", "password": "sua_senha"}'

# Resposta:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": { "id": "123", ... }
# }

# 2. Editar test-endpoints.js
# AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
# TEST_USER_ID = '123'

# 3. Executar
node test-endpoints.js

# 4. Ver relatório
cat endpoint-test-report.json | jq .summary

# Saída:
# {
#   "working": 18,
#   "failing": 7,
#   "skipped": 5,
#   "success_rate": "72.0%"
# }

# 5. Ver quais funcionam
cat endpoint-test-report.json | jq '.working[].name'

# Saída:
# "Listar Planos"
# "Listar Plano do Usuário"
# "Listar Descontos do Plano"
# ...
```

## 💡 Dicas

1. **Execute regularmente**: A API pode mudar com o tempo
2. **Salve os relatórios**: Compare versões antigas com novas
3. **Documente mudanças**: Se um endpoint parar de funcionar, documente quando
4. **Teste em staging primeiro**: Antes de usar em produção

## 📞 Suporte

Se encontrar problemas:

1. Verifique se o token está correto
2. Verifique se a URL base está correta
3. Verifique se tem conexão com a internet
4. Veja o arquivo de relatório para detalhes do erro

---

**Agora você pode descobrir quais endpoints realmente funcionam!** 🎯
