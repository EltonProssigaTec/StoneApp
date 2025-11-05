/**
 * Script para tentar limpar dados órfãos de um CPF
 * Este script tenta fazer a limpeza através de chamadas à API
 *
 * Execute: node cleanup-orphaned-data.js
 *
 * IMPORTANTE: Este script pode NÃO funcionar se o backend não tiver
 * endpoints apropriados. Nesse caso, será necessário executar SQL direto no banco.
 */

const axios = require('axios');

const API_URL = 'https://api.stoneup.com.br/api/v1.0';

// Dados do usuário para limpar
const userData = {
  cpf: '70546244246',
  email: 'Eltonryan.bt0@gmail.com',
  email_alternativo: 'eltonryan.bt0+1@gmail.com',
};

console.log('=== SCRIPT DE LIMPEZA DE DADOS ÓRFÃOS ===\n');
console.log('CPF:', userData.cpf);
console.log('Email:', userData.email);
console.log('\n');

/**
 * Tenta buscar informações do usuário pelo CPF
 */
async function getUserInfo() {
  console.log('1. Buscando informações do usuário...');

  try {
    // Tentar endpoint de recuperação de senha/dados
    const response = await axios.post(
      `${API_URL}/recover_password`,
      { cpf: userData.cpf },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    console.log('✓ Resposta:', response.data);
    return response.data;
  } catch (error) {
    console.log('✗ Erro ao buscar dados:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Tenta fazer novo pré-registro (isso pode limpar dados antigos se o backend estiver configurado)
 */
async function tryCleanupViaReRegister() {
  console.log('\n2. Tentando forçar re-registro para limpar dados antigos...');

  const testData = {
    name: 'Elton Ryan',
    email: userData.email,
    password: 'TempPassword123!',
    cpf_cnpj: userData.cpf,
    data_nascimento: '2004-11-03 00:00:00',
    telefone: '92981533028',
    origem: 'cleanup_script',
    cnh: '',
    rgFrente: '',
    rgVerso: '',
    residencia: '',
  };

  try {
    const response = await axios.post(
      `${API_URL}/pre_register_monitora`,
      testData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    console.log('✓ Re-registro bem sucedido!');
    console.log('Resposta:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.log('✗ Erro ao tentar re-registro:');
    console.log('  Status:', error.response?.status);
    console.log('  Dados:', JSON.stringify(error.response?.data, null, 2));

    // Analisar o tipo de erro
    if (error.response?.status === 401) {
      const errorData = error.response.data;

      if (errorData?.message?.errorInfo) {
        const errorInfo = errorData.message.errorInfo;

        if (errorInfo[0] === '23000' && errorInfo[2]?.includes('foreign key constraint')) {
          console.log('\n⚠️  CONFIRMADO: Existem dados órfãos bloqueando o cadastro!');
          console.log('  Tabela problemática:', errorInfo[2].match(/`(\w+)`/)?.[1] || 'desconhecida');
          return { success: false, orphanedData: true, error: errorInfo[2] };
        }
      }
    }

    return { success: false, orphanedData: false, error: error.message };
  }
}

/**
 * Gera comandos SQL para limpeza manual
 */
function generateSQLCleanupCommands(userId = null) {
  console.log('\n=== COMANDOS SQL PARA LIMPEZA MANUAL ===\n');
  console.log('Execute estes comandos diretamente no banco de dados MySQL:\n');

  if (userId) {
    console.log(`-- Usando user_id = ${userId}\n`);
    console.log('BEGIN TRANSACTION;');
    console.log('');
    console.log(`DELETE FROM enderecos WHERE user_id = ${userId};`);
    console.log(`DELETE FROM dividas WHERE user_id = ${userId};`);
    console.log(`DELETE FROM acordos WHERE user_id = ${userId};`);
    console.log(`DELETE FROM notificacoes WHERE user_id = ${userId};`);
    console.log(`DELETE FROM documentos WHERE user_id = ${userId};`);
    console.log(`DELETE FROM historico WHERE user_id = ${userId};`);
    console.log('');
    console.log(`-- Por último, deletar o usuário`);
    console.log(`DELETE FROM users WHERE id = ${userId};`);
    console.log('');
    console.log('COMMIT;');
  } else {
    console.log('-- Primeiro, encontre o user_id:');
    console.log(`SELECT id, name, email, cpf_cnpj, deleted_at, created_at, updated_at`);
    console.log(`FROM users`);
    console.log(`WHERE cpf_cnpj = '${userData.cpf}';`);
    console.log('');
    console.log('-- Depois de anotar o ID, execute:');
    console.log('BEGIN TRANSACTION;');
    console.log('');
    console.log('SET @user_id = [INSIRA_O_ID_AQUI];');
    console.log('');
    console.log('DELETE FROM enderecos WHERE user_id = @user_id;');
    console.log('DELETE FROM dividas WHERE user_id = @user_id;');
    console.log('DELETE FROM acordos WHERE user_id = @user_id;');
    console.log('DELETE FROM notificacoes WHERE user_id = @user_id;');
    console.log('DELETE FROM documentos WHERE user_id = @user_id;');
    console.log('DELETE FROM historico WHERE user_id = @user_id;');
    console.log('DELETE FROM pre_dividas WHERE userId = @user_id;');
    console.log('DELETE FROM boletos WHERE user_id = @user_id;');
    console.log('');
    console.log('-- Por último, deletar o usuário');
    console.log('DELETE FROM users WHERE id = @user_id;');
    console.log('');
    console.log('COMMIT;');
  }

  console.log('\n');
  console.log('IMPORTANTE: Faça backup antes de executar!');
  console.log('');
}

/**
 * Executa o processo completo
 */
async function main() {
  try {
    // Passo 1: Tentar buscar info do usuário
    const userInfo = await getUserInfo();

    // Passo 2: Tentar forçar re-registro para limpar dados
    const cleanupResult = await tryCleanupViaReRegister();

    if (cleanupResult.success) {
      console.log('\n✓ SUCESSO! Os dados foram limpos e novo cadastro foi iniciado.');
      console.log('Verifique o email para confirmar o cadastro.');
    } else if (cleanupResult.orphanedData) {
      console.log('\n✗ FALHA! Confirmado que existem dados órfãos.');
      console.log('É necessário limpar manualmente no banco de dados.');
      generateSQLCleanupCommands();
    } else {
      console.log('\n⚠️  Não foi possível completar a limpeza via API.');
      console.log('Erro:', cleanupResult.error);
      generateSQLCleanupCommands();
    }

    console.log('\n=== PROCESSO CONCLUÍDO ===\n');
  } catch (error) {
    console.error('Erro inesperado:', error);
    generateSQLCleanupCommands();
  }
}

// Executar
main();
