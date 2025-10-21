# Scripts de Manutenção do Banco de Dados

## Problema: Dados Órfãos (Foreign Key Constraint)

Quando um usuário é deletado mas ainda possui registros em outras tabelas (endereços, telefones, etc.), o banco impede novas operações devido a constraints de foreign key.

### Erro Comum:
```
Cannot delete or update a parent row: a foreign key constraint fails
(`stoneup`.`enderecos`, CONSTRAINT `enderecos_user_id_foreign`
FOREIGN KEY (`user_id`) REFERENCES `users` (`id`))
```

## Como Usar os Scripts SQL

### 1. Acesse o banco de dados
```bash
mysql -u seu_usuario -p stoneup
```

### 2. Execute o script de limpeza
```bash
mysql -u seu_usuario -p stoneup < database/cleanup_orphaned_records.sql
```

### 3. Ou execute manualmente as queries

Abra o arquivo `cleanup_orphaned_records.sql` e execute as queries uma por uma.

## Passos Recomendados

### Passo 1: Verificar dados órfãos
Execute as queries da **Seção 1** do script para verificar quais registros estão órfãos.

### Passo 2: Verificar usuário específico
Se você sabe o CPF (ex: 70546244246), execute as queries da **Seção 2** para ver todos os dados relacionados.

### Passo 3: Backup (IMPORTANTE!)
Antes de deletar qualquer coisa, faça backup:
```bash
mysqldump -u seu_usuario -p stoneup > backup_antes_limpeza.sql
```

### Passo 4: Limpar dados órfãos
Descomente e execute as queries da **Seção 3** para deletar os registros órfãos.

### Passo 5: Verificar integridade
Execute as queries da **Seção 5** para confirmar que a limpeza foi bem-sucedida.

## Prevenção de Problemas

### No Backend (PHP/Laravel)
Adicione cascade delete nas migrations:

```php
Schema::create('enderecos', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')
          ->constrained('users')
          ->onDelete('cascade'); // Deleta automaticamente quando user for deletado
    // outros campos...
});
```

### No Frontend (React Native)
O arquivo `app/register.tsx` foi atualizado com tratamento de erros melhorado que detecta:
- ✅ Usuário já cadastrado (erro 400)
- ✅ Erros de foreign key (erro 500 com errorInfo)
- ✅ Erros de autenticação (erro 401)
- ✅ Erros de rede e timeout

## Mensagens de Erro Melhoradas

Agora o app mostra mensagens mais claras:

| Situação | Mensagem |
|----------|----------|
| CPF/Email duplicado | "Este CPF ou e-mail já está cadastrado no sistema." |
| Dados órfãos no banco | "Detectamos dados inconsistentes no sistema. Por favor, entre em contato com o suporte ou tente com outro CPF/e-mail." |
| Erro de autenticação | "Erro de autenticação. Tente novamente." |
| Erro no servidor | "Erro no servidor. Tente novamente mais tarde." |

## Teste com Dados Novos

Se após limpar o banco ainda tiver problemas, teste com dados completamente novos:

```
Nome: Teste User
Email: teste.novo@example.com
CPF: 12345678901 (diferente do anterior)
Telefone: (11) 98765-4321
Data Nascimento: 01/01/1990
Senha: SenhaSegura123
```

## Suporte

Se os problemas persistirem após executar as queries de limpeza:

1. Verifique os logs do servidor backend
2. Confirme que todas as foreign keys têm CASCADE configurado
3. Execute a query de verificação de foreign keys (Seção 6 do script)
4. Entre em contato com o administrador do banco de dados
