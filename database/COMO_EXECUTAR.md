# Como Executar as Queries SQL de Limpeza

## Método 1: MySQL via Linha de Comando (Windows)

### Passo 1: Abrir terminal
Pressione `Win + R`, digite `cmd` e pressione Enter

### Passo 2: Conectar ao MySQL
```bash
mysql -u root -p -h api.stoneup.com.br stoneup
```
ou se for local:
```bash
mysql -u root -p stoneup
```

Você será solicitado a digitar a senha do MySQL.

### Passo 3: Executar o arquivo completo (Automático)
```bash
source C:\Users\pross\PROJETOS_PROSSIGA\StoneApp\database\cleanup_orphaned_records.sql
```

OU no Windows (fora do MySQL):
```bash
mysql -u root -p stoneup < C:\Users\pross\PROJETOS_PROSSIGA\StoneApp\database\cleanup_orphaned_records.sql
```

### Passo 4: Ou execute manualmente (Mais seguro)
Copie e cole as queries uma por uma no terminal MySQL.

---

## Método 2: MySQL Workbench (Interface Gráfica)

### Passo 1: Abrir MySQL Workbench
- Abra o MySQL Workbench
- Conecte ao servidor: `api.stoneup.com.br` (ou localhost se for local)

### Passo 2: Abrir o arquivo SQL
1. Menu: `File` → `Open SQL Script`
2. Navegue até: `C:\Users\pross\PROJETOS_PROSSIGA\StoneApp\database\cleanup_orphaned_records.sql`
3. Clique em `Open`

### Passo 3: Executar queries
1. **Executar tudo**: Clique no ⚡ (raio) ou pressione `Ctrl + Shift + Enter`
2. **Executar seleção**: Selecione a query desejada e pressione `Ctrl + Enter`

### Passo 4: Ver resultados
Os resultados aparecerão na parte inferior da janela.

---

## Método 3: phpMyAdmin (Se disponível)

### Passo 1: Acessar phpMyAdmin
- Acesse via navegador (geralmente `http://localhost/phpmyadmin`)
- Faça login com suas credenciais

### Passo 2: Selecionar banco de dados
- Clique em `stoneup` na lista à esquerda

### Passo 3: Abrir SQL
- Clique na aba `SQL` no topo

### Passo 4: Colar e executar
1. Abra o arquivo `cleanup_orphaned_records.sql` em um editor de texto
2. Copie as queries que deseja executar
3. Cole na área de texto do phpMyAdmin
4. Clique em `Go` ou `Executar`

---

## Método 4: HeidiSQL (Se disponível)

### Passo 1: Abrir HeidiSQL
- Conecte ao servidor MySQL

### Passo 2: Abrir arquivo
- Menu: `File` → `Load SQL file`
- Selecione: `cleanup_orphaned_records.sql`

### Passo 3: Executar
- Pressione `F9` ou clique no botão ▶️ (Play)

---

## ⚠️ IMPORTANTE - Ordem de Execução Segura

### 1. Primeiro: VERIFICAR (NÃO deleta nada)
Execute apenas as queries da **Seção 1 e 2**:

```sql
-- Ver endereços órfãos
SELECT e.id, e.user_id, e.rua, e.cidade, 'endereco_orfao' as tipo
FROM enderecos e
WHERE e.user_id NOT IN (SELECT id FROM users)
ORDER BY e.id;

-- Ver se usuário existe
SELECT * FROM users WHERE cpf_cnpj = '70546244246';
```

### 2. Segundo: BACKUP (Obrigatório!)
Antes de deletar, faça backup:

**Via MySQL Command Line:**
```bash
mysqldump -u root -p stoneup > backup_antes_limpeza_$(date +%Y%m%d_%H%M%S).sql
```

**Via Windows CMD:**
```bash
mysqldump -u root -p stoneup > backup_antes_limpeza.sql
```

### 3. Terceiro: DELETAR (CUIDADO!)
Descomente e execute as queries da **Seção 3**:

```sql
DELETE FROM enderecos
WHERE user_id NOT IN (SELECT id FROM users);
```

### 4. Quarto: VERIFICAR
Execute as queries da **Seção 5** para confirmar:

```sql
SELECT COUNT(*) as enderecos_orfaos
FROM enderecos
WHERE user_id NOT IN (SELECT id FROM users);
```

Se retornar `0`, está limpo! ✅

---

## Exemplo Prático Passo a Passo

```bash
# 1. Abrir MySQL
mysql -u root -p stoneup

# 2. Verificar órfãos
SELECT COUNT(*) FROM enderecos WHERE user_id NOT IN (SELECT id FROM users);

# 3. Ver detalhes
SELECT e.* FROM enderecos e WHERE e.user_id NOT IN (SELECT id FROM users);

# 4. Fazer backup (em outro terminal/CMD)
mysqldump -u root -p stoneup > backup.sql

# 5. Deletar (de volta no MySQL)
DELETE FROM enderecos WHERE user_id NOT IN (SELECT id FROM users);

# 6. Confirmar limpeza
SELECT COUNT(*) FROM enderecos WHERE user_id NOT IN (SELECT id FROM users);
-- Deve retornar: 0

# 7. Testar cadastro novamente no app
```

---

## Credenciais Comuns

Se você não souber as credenciais, verifique:

1. **Arquivo .env do backend**:
   - Procure por `DB_USERNAME` e `DB_PASSWORD`

2. **Arquivo de configuração do Laravel**:
   - `config/database.php`

3. **Credenciais padrão**:
   - Usuário: `root`
   - Senha: (vazia) ou `root` ou `password`
   - Host: `localhost` ou `127.0.0.1` ou `api.stoneup.com.br`
   - Porta: `3306`

---

## Troubleshooting

### Erro: "Access denied for user"
- Verifique usuário e senha
- Tente: `mysql -u root -p` (sem especificar banco)

### Erro: "mysql: command not found"
- Adicione MySQL ao PATH do Windows
- Ou use o caminho completo: `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe`

### Erro: "Unknown database 'stoneup'"
- Liste bancos disponíveis: `SHOW DATABASES;`
- Crie o banco: `CREATE DATABASE stoneup;`

### Erro ao executar arquivo .sql
- Certifique-se que o caminho está correto
- Use barras duplas no Windows: `C:\\Users\\pross\\...`
- Ou barras normais: `C:/Users/pross/...`

---

## Precisa de Ajuda?

Se tiver dificuldades, me informe:
1. Qual método você está tentando usar?
2. Qual erro está aparecendo?
3. Você tem acesso ao servidor de banco de dados?
