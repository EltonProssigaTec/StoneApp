-- ============================================================================
-- SCRIPT DE LIMPEZA DE DADOS ÓRFÃOS - CPF 70546244246
-- ============================================================================
--
-- Este script limpa completamente os dados do usuário com CPF 70546244246
-- que ficaram órfãos após uma exclusão incompleta de conta.
--
-- ATENÇÃO: Este script deleta dados permanentemente!
-- Faça backup antes de executar!
--
-- Execute este script no banco de dados MySQL 'stoneup'
-- ============================================================================

USE stoneup;

-- Mostrar estado atual antes da limpeza
SELECT '=== ESTADO ANTES DA LIMPEZA ===' AS info;

-- Encontrar o user_id
SELECT
    id AS user_id,
    name,
    email,
    cpf_cnpj,
    deleted_at,
    created_at,
    updated_at
FROM users
WHERE cpf_cnpj = '70546244246';

-- Verificar quantos registros órfãos existem em cada tabela
SET @user_id = (SELECT id FROM users WHERE cpf_cnpj = '70546244246' LIMIT 1);

SELECT
    CONCAT('Endereços: ', COUNT(*)) AS registros_orfaos
FROM enderecos
WHERE user_id = @user_id;

SELECT
    CONCAT('Dívidas: ', COUNT(*)) AS registros_orfaos
FROM dividas
WHERE user_id = @user_id;

SELECT
    CONCAT('Acordos: ', COUNT(*)) AS registros_orfaos
FROM acordos
WHERE user_id = @user_id;

-- ============================================================================
-- LIMPEZA DOS DADOS (DESCOMENTE PARA EXECUTAR)
-- ============================================================================

-- Iniciar transação para poder reverter se necessário
START TRANSACTION;

-- Definir o user_id
SET @user_id = (SELECT id FROM users WHERE cpf_cnpj = '70546244246' LIMIT 1);

-- Deletar registros em todas as tabelas relacionadas
-- (em ordem para evitar erros de foreign key)

-- 1. Tabelas que referenciam endereços
DELETE FROM enderecos WHERE user_id = @user_id;

-- 2. Tabelas relacionadas a dívidas
DELETE FROM pre_dividas WHERE userId = @user_id;
DELETE FROM dividas WHERE user_id = @user_id;

-- 3. Tabelas relacionadas a acordos/boletos
DELETE FROM boletos WHERE user_id = @user_id;
DELETE FROM acordos WHERE user_id = @user_id;

-- 4. Outras tabelas relacionadas
DELETE FROM notificacoes WHERE user_id = @user_id;
DELETE FROM documentos WHERE user_id = @user_id;
DELETE FROM historico WHERE user_id = @user_id;
DELETE FROM logs_usuario WHERE user_id = @user_id;

-- 5. Tokens e sessões
DELETE FROM password_reset_tokens WHERE email IN (
    SELECT email FROM users WHERE id = @user_id
);
DELETE FROM personal_access_tokens WHERE tokenable_id = @user_id AND tokenable_type = 'App\\Models\\User';

-- 6. Por último, deletar o usuário
DELETE FROM users WHERE id = @user_id;

-- Verificar resultado
SELECT '=== REGISTROS DELETADOS ===' AS info;
SELECT ROW_COUNT() AS total_registros_deletados;

-- DESCOMENTAR A LINHA ABAIXO PARA CONFIRMAR AS ALTERAÇÕES
-- COMMIT;

-- OU DESCOMENTAR A LINHA ABAIXO PARA CANCELAR AS ALTERAÇÕES
-- ROLLBACK;

SELECT '=== AVISO ===' AS info;
SELECT 'Execute COMMIT; para confirmar ou ROLLBACK; para cancelar' AS mensagem;

-- ============================================================================
-- VERIFICAÇÃO PÓS-LIMPEZA (Execute após COMMIT)
-- ============================================================================

-- Verificar se o CPF foi removido completamente
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN 'SUCESSO: CPF foi completamente removido'
        ELSE 'ERRO: CPF ainda existe no banco'
    END AS resultado
FROM users
WHERE cpf_cnpj = '70546244246';

-- ============================================================================
-- COMANDOS PARA PREVENIR PROBLEMA NO FUTURO
-- ============================================================================

-- Adicionar CASCADE DELETE nas foreign keys da tabela enderecos
-- (isso fará com que os endereços sejam deletados automaticamente quando o usuário for deletado)

-- ATENÇÃO: Isso afeta TODOS os usuários, não apenas este CPF
-- Execute apenas se tiver certeza e após backup!

/*
ALTER TABLE enderecos
DROP FOREIGN KEY enderecos_user_id_foreign;

ALTER TABLE enderecos
ADD CONSTRAINT enderecos_user_id_foreign
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;
*/

-- Fazer o mesmo para outras tabelas importantes
/*
ALTER TABLE dividas
DROP FOREIGN KEY IF EXISTS dividas_user_id_foreign;

ALTER TABLE dividas
ADD CONSTRAINT dividas_user_id_foreign
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE acordos
DROP FOREIGN KEY IF EXISTS acordos_user_id_foreign;

ALTER TABLE acordos
ADD CONSTRAINT acordos_user_id_foreign
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;
*/
