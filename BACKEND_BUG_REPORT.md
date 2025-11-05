# Bug Report: Exclusão Incompleta de Conta

## Resumo
O processo de exclusão de conta (endpoint `PUT /monitora/user/solictarexlusao`) está deletando parcialmente os dados do usuário, deixando registros órfãos que impedem novo cadastro e causam erros de foreign key constraint.

## Dados do Teste
- **CPF**: 70546244246
- **Email**: Eltonryan.bt0@gmail.com
- **Nome**: Elton Ryan
- **Data Nascimento**: 03/11/2004
- **Telefone**: 92981533028

## Comportamento Atual (Incorreto)

### Passo 1: Usuário criou conta normalmente
✅ Cadastro realizado com sucesso

### Passo 2: Usuário solicitou exclusão de conta
✅ Solicitação enviada via tela "Exclusão de conta" do app
✅ Endpoint chamado: `PUT /monitora/user/solictarexlusao`

### Passo 3: Backend processou exclusão **PARCIALMENTE**
❌ Deletou/desativou registro da tabela `users`
❌ **NÃO deletou** registros da tabela `enderecos` vinculados ao `user_id`
❌ Resultado: Dados órfãos no banco

### Passo 4: Usuário não consegue mais usar o sistema
❌ **Login falha** - usuário deletado/inativo
❌ **Cadastro falha** - retorna erro 401 com foreign key constraint:
```
{
  "message": {
    "errorInfo": [
      "23000",
      1451,
      "Cannot delete or update a parent row: a foreign key constraint fails
       (`stoneup`.`enderecos`, CONSTRAINT `enderecos_user_id_foreign`
       FOREIGN KEY (`user_id`) REFERENCES `users` (`id`))"
    ]
  }
}
```
✅ **Recuperar acesso funciona** - encontra registro principal do usuário

## Erro de Foreign Key Detectado

Quando tentamos fazer novo cadastro com o mesmo CPF, o backend tenta limpar/atualizar o registro antigo mas falha porque:

1. Registro existe na tabela `users` (ou marcado como deletado)
2. Registros relacionados existem na tabela `enderecos` com `user_id` apontando para o usuário
3. Foreign key constraint `enderecos_user_id_foreign` impede a operação
4. API retorna erro 401 (deveria ser 400 ou 500)

## Reprodução do Erro

Execute este script para reproduzir:

```bash
node test-cpf.js
```

**Resultado esperado**: Erro 400 (CPF já cadastrado) ou 200 (novo cadastro)
**Resultado atual**: Erro 401 com mensagem de foreign key constraint

## Comportamento Esperado (Correto)

Quando uma exclusão de conta é solicitada, o backend deve:

### Opção 1: CASCADE DELETE (Recomendado)
Configurar o banco para deletar automaticamente registros relacionados:
```sql
ALTER TABLE enderecos
DROP FOREIGN KEY enderecos_user_id_foreign;

ALTER TABLE enderecos
ADD CONSTRAINT enderecos_user_id_foreign
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;
```

### Opção 2: Deleção Manual em Cascata
No código do endpoint de exclusão, deletar manualmente todas as tabelas relacionadas:
```php
// Exemplo em Laravel/PHP
DB::transaction(function () use ($userId) {
    // 1. Deletar endereços
    DB::table('enderecos')->where('user_id', $userId)->delete();

    // 2. Deletar outras tabelas relacionadas
    DB::table('dividas')->where('user_id', $userId)->delete();
    DB::table('acordos')->where('user_id', $userId)->delete();
    // ... outras tabelas

    // 3. Por último, deletar usuário
    DB::table('users')->where('id', $userId)->delete();
});
```

### Opção 3: Soft Delete
Marcar como deletado ao invés de remover:
- Adicionar coluna `deleted_at` em todas as tabelas
- Apenas marcar data de exclusão sem remover registros
- Filtrar registros deletados nas queries

## Solução Imediata para Este Caso

Para liberar o CPF 70546244246 para novo cadastro, execute manualmente no banco:

```sql
-- Verificar user_id do CPF
SELECT id, name, email, cpf_cnpj, deleted_at
FROM users
WHERE cpf_cnpj = '70546244246';

-- Anotar o user_id e executar
SET @user_id = [ID_ENCONTRADO];

-- Deletar registros órfãos
DELETE FROM enderecos WHERE user_id = @user_id;
DELETE FROM dividas WHERE user_id = @user_id;
DELETE FROM acordos WHERE user_id = @user_id;
-- ... outras tabelas relacionadas

-- Por último, deletar ou confirmar exclusão do usuário
DELETE FROM users WHERE id = @user_id;
```

## Impacto

**Severidade**: 🔴 **CRÍTICA**

- Usuários que deletam conta ficam impossibilitados de criar nova conta com mesmo CPF
- Erro está sendo retornado com status 401 ao invés de 400/500 (confuso)
- Pode afetar todos os usuários que solicitarem exclusão de conta

## Ações Necessárias

1. ✅ **Correção Imediata**: Limpar dados órfãos do CPF 70546244246
2. ✅ **Correção no Código**: Implementar deleção em cascata no endpoint `PUT /monitora/user/solictarexlusao`
3. ✅ **Correção no Banco**: Adicionar ON DELETE CASCADE nas foreign keys
4. ✅ **Validação**: Verificar se há outros usuários com mesmo problema no banco
5. ✅ **Teste**: Validar processo completo de exclusão e re-cadastro

## Arquivos Relacionados

- Frontend: `StoneApp/app/delete-account.tsx` (linha 168)
- Backend: Endpoint `PUT /monitora/user/solictarexlusao`
- Teste: `StoneApp/test-cpf.js`

---

**Reportado por**: Frontend Team
**Data**: 2025-11-05
**Prioridade**: Crítica
