-- ============================================
-- Script para limpar dados órfãos do banco
-- Executar quando usuários forem deletados mas deixarem referências
-- ============================================

-- ATENÇÃO: Execute em ambiente de desenvolvimento primeiro!
-- Faça backup antes de executar em produção

USE stoneup;

-- 1. VERIFICAR registros órfãos antes de deletar
-- ============================================

-- Verificar endereços órfãos
SELECT
    e.id,
    e.user_id,
    e.rua,
    e.cidade,
    'endereco_orfao' as tipo
FROM enderecos e
WHERE e.user_id NOT IN (SELECT id FROM users)
ORDER BY e.id;

-- Verificar outras tabelas que podem ter referências (ajuste conforme seu schema)
SELECT
    COUNT(*) as total_orfaos,
    'enderecos' as tabela
FROM enderecos
WHERE user_id NOT IN (SELECT id FROM users);

-- 2. BUSCAR usuário específico (CPF 70546244246)
-- ============================================

-- Ver se usuário existe
SELECT * FROM users WHERE cpf_cnpj = '70546244246';

-- Ver registros relacionados ao CPF (mesmo que user foi deletado)
SELECT e.*
FROM enderecos e
WHERE e.user_id IN (
    SELECT id FROM users WHERE cpf_cnpj = '70546244246'
);

-- 3. LIMPAR dados órfãos
-- ============================================

-- CUIDADO: Estas queries deletam dados permanentemente!
-- Descomente apenas depois de verificar os registros acima

-- Deletar endereços órfãos
-- DELETE FROM enderecos
-- WHERE user_id NOT IN (SELECT id FROM users);

-- Se existirem outras tabelas com foreign keys, adicione aqui:
-- DELETE FROM telefones WHERE user_id NOT IN (SELECT id FROM users);
-- DELETE FROM documentos WHERE user_id NOT IN (SELECT id FROM users);
-- DELETE FROM veiculos WHERE user_id NOT IN (SELECT id FROM users);
-- DELETE FROM financeiro WHERE user_id NOT IN (SELECT id FROM users);

-- 4. LIMPAR registros específicos do CPF 70546244246
-- ============================================

-- IMPORTANTE: Use isso apenas se quiser deletar TUDO relacionado a este CPF

-- Ver o user_id deste CPF (pode estar NULL se foi deletado)
SET @user_id_cpf = (SELECT id FROM users WHERE cpf_cnpj = '70546244246' LIMIT 1);

-- Se o usuário não existe mais, buscar user_id antigo nos registros órfãos
-- Você pode precisar ajustar manualmente baseado nos resultados da query 1

-- Exemplo: Se você souber o user_id antigo (ex: 123), pode deletar manualmente:
-- DELETE FROM enderecos WHERE user_id = 123;
-- DELETE FROM users WHERE cpf_cnpj = '70546244246';

-- 5. VERIFICAR integridade após limpeza
-- ============================================

-- Verificar se ainda existem órfãos
SELECT
    (SELECT COUNT(*) FROM enderecos WHERE user_id NOT IN (SELECT id FROM users)) as enderecos_orfaos;

-- 6. PERMITIR novo cadastro com mesmo CPF
-- ============================================

-- Verificar se CPF/Email já existe
SELECT
    id,
    name,
    email,
    cpf_cnpj,
    created_at
FROM users
WHERE cpf_cnpj = '70546244246' OR email = 'eltonryan.bt0@gmail.com';

-- Se retornar vazio, está pronto para novo cadastro
-- Se retornar registros, você precisa deletar ou atualizar:
-- DELETE FROM users WHERE cpf_cnpj = '70546244246';
-- DELETE FROM users WHERE email = 'eltonryan.bt0@gmail.com';

-- ============================================
-- QUERIES DE MANUTENÇÃO PREVENTIVA
-- ============================================

-- Ver todas as foreign keys da tabela users
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_NAME = 'users'
AND TABLE_SCHEMA = 'stoneup';

-- Isso mostra todas as tabelas que referenciam users
-- Use para criar queries de limpeza personalizadas
