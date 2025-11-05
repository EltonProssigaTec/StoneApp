/**
 * Script de teste para verificar dados de CPF na API
 * Execute: node test-cpf.js
 */

const axios = require('axios');

const API_URL = 'https://api.stoneup.com.br/api/v1.0';

// Dados da tentativa de cadastro mencionada
const testData = {
  email: 'eltonryan.bt0+1@gmail.com',
  cpf: '70546244246',
  name: 'EltonRyan',
  telefone: '(11) 98765-4321', // exemplo
};

console.log('=== TESTE DE VERIFICAÇÃO DE CPF ===\n');
console.log('Dados do teste:', testData);
console.log('\n');

// Teste 1: Verificar se o CPF já tem cadastro (endpoint de pré-registro)
async function testPreRegistro() {
  console.log('1. Testando pré-registro (deve retornar erro se CPF já cadastrado)...');

  try {
    const response = await axios.post(
      `${API_URL}/pre_register_monitora`,
      {
        name: testData.name,
        email: testData.email,
        password: 'TesteSenha123',
        cpf_cnpj: testData.cpf,
        data_nascimento: '2004-11-03 00:00:00',
        telefone: testData.telefone,
        origem: 'test',
        cnh: '',
        rgFrente: '',
        rgVerso: '',
        residencia: '',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    console.log('✓ Resposta sucesso:', response.data);
    console.log('Status:', response.status);
  } catch (error) {
    if (error.response) {
      console.log('✗ Erro da API:');
      console.log('  Status:', error.response.status);
      console.log('  Mensagem:', error.response.data);

      if (error.response.status === 400) {
        console.log('\n⚠️  CPF/Email provavelmente JÁ CADASTRADO no sistema!');
      } else if (error.response.status === 401) {
        console.log('\n⚠️  API exigindo autenticação (não deveria para pré-registro)');
      }
    } else if (error.request) {
      console.log('✗ Erro de rede:', error.message);
    } else {
      console.log('✗ Erro:', error.message);
    }
  }
}

// Teste 2: Tentar consultar dívidas (requer autenticação)
async function testConsultaDividas() {
  console.log('\n2. Testando consulta de dívidas (endpoint protegido)...');

  try {
    const response = await axios.get(
      `${API_URL}/monitora/dividas/${testData.cpf}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    console.log('✓ Resposta sucesso:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('✗ Esperado! Erro 401 (endpoint protegido)');
      console.log('  Status:', error.response.status);
    } else {
      console.log('✗ Erro de rede:', error.message);
    }
  }
}

// Executar testes
async function runTests() {
  await testPreRegistro();
  await testConsultaDividas();

  console.log('\n=== TESTE CONCLUÍDO ===');
  console.log('\nSe o pré-registro retornou erro 400, significa que o CPF/Email já está cadastrado.');
  console.log('Se retornou erro 401, pode ser um problema de configuração da API.\n');
}

runTests();
