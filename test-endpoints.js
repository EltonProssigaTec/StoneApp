/**
 * Script para testar endpoints da API
 *
 * Como usar:
 * 1. Coloque seu token de autenticação abaixo
 * 2. Execute: node test-endpoints.js
 * 3. Veja o relatório gerado
 */

const axios = require('axios');
const fs = require('fs');

// ==================== CONFIGURAÇÃO ====================
const BASE_URL = 'https://api.stoneup.com.br/api/v1.0';
const AUTH_TOKEN = 'SEU_TOKEN_AQUI'; // ⚠️ SUBSTITUA pelo seu token

// Endpoints para testar (baseados no APK antigo)
const ENDPOINTS_TO_TEST = [
  // === PLANOS E ASSINATURAS ===
  {
    name: 'Listar Planos',
    method: 'POST',
    url: '/monitora/listar_planos',
    body: {},
    category: 'Planos',
  },
  {
    name: 'Listar Plano do Usuário',
    method: 'POST',
    url: '/monitora/listar_plano_user',
    body: { idUser: '1' }, // Substitua com ID real
    category: 'Planos',
  },
  {
    name: 'Inserir Plano Usuário',
    method: 'POST',
    url: '/monitora/inser_plano_user',
    body: { idUser: '1', idPlano: '1', metodoPagamento: 'test' },
    category: 'Planos',
    skipTest: true, // Pular por padrão para não criar assinatura de teste
  },
  {
    name: 'Alterar Plano',
    method: 'POST',
    url: '/monitora/alterar_plano',
    body: { idUser: '1', plano: '1' },
    category: 'Planos',
    skipTest: true,
  },
  {
    name: 'Remover Plano Usuário',
    method: 'POST',
    url: '/monitora/remover_plano_user',
    body: { idUser: '1' },
    category: 'Planos',
    skipTest: true,
  },
  {
    name: 'Listar Descontos do Plano',
    method: 'POST',
    url: '/monitora/listar_descontos_plano_user',
    body: { id_plano: '1' },
    category: 'Planos',
  },
  {
    name: 'Usar Cupom',
    method: 'POST',
    url: '/monitora/usarCupom',
    body: { idUser: '1', codigo: 'TEST' },
    category: 'Planos',
    skipTest: true,
  },

  // === BUSCA ===
  {
    name: 'Buscar Negativados por CPF/CNPJ',
    method: 'POST',
    url: '/monitora/searchNegativados/12345678901',
    body: {},
    category: 'Busca',
  },
  {
    name: 'Buscar Dívidas',
    method: 'POST',
    url: '/monitora/searchDividas',
    body: {},
    category: 'Busca',
  },
  {
    name: 'Consultar Empresas por CNPJ Credor',
    method: 'POST',
    url: '/monitora/consult_empresas_cnpjCredor',
    body: { cnpj_credor: '12345678000190' },
    category: 'Busca',
  },
  {
    name: 'Get Dívida',
    method: 'POST',
    url: '/monitora/getDivida',
    body: { id: '1' },
    category: 'Busca',
  },
  {
    name: 'Get Empresa Dívida',
    method: 'POST',
    url: '/monitora/getEmpresaDivida',
    body: { id: '1' },
    category: 'Busca',
  },

  // === USUÁRIO ===
  {
    name: 'Editar Usuário',
    method: 'POST',
    url: '/monitora/editar_usuarios',
    body: { idUser: '1' },
    category: 'Usuário',
    skipTest: true,
  },
  {
    name: 'Endereço Usuário',
    method: 'POST',
    url: '/monitora/endereco_usuarios',
    body: { idUser: '1' },
    category: 'Usuário',
  },
  {
    name: 'Consultar Endereço Usuário',
    method: 'POST',
    url: '/monitora/consultar_usuario_endereco',
    body: { idUser: '1' },
    category: 'Usuário',
  },
  {
    name: 'Editar Endereço Cobrança',
    method: 'POST',
    url: '/monitora/editar_endereco_cobranca',
    body: { idUser: '1' },
    category: 'Usuário',
    skipTest: true,
  },

  // === NOTIFICAÇÕES ===
  {
    name: 'Load Notificações',
    method: 'POST',
    url: '/monitora/load_notificacoes_usuarios',
    body: { idUser: '1' },
    category: 'Notificações',
  },
  {
    name: 'Notificações Não Lidas',
    method: 'POST',
    url: '/monitora/naolidas_notificacoes_usuarios',
    body: { idUser: '1' },
    category: 'Notificações',
  },
  {
    name: 'Registrar Visualização Notificação',
    method: 'POST',
    url: '/monitora/registrar_visualizacao_notificacoes',
    body: { idUser: '1', idNotificacao: '1' },
    category: 'Notificações',
    skipTest: true,
  },

  // === PAGAMENTOS ===
  {
    name: 'Gravar Pagamento Loja',
    method: 'POST',
    url: '/monitora/gravarpagamentoloja/test',
    body: { idUser: '1', idPlano: '1' },
    category: 'Pagamentos',
    skipTest: true,
  },
  {
    name: 'Cadastrar Cartão',
    method: 'POST',
    url: '/monitora/cadastrarCartao',
    body: { idUser: '1' },
    category: 'Pagamentos',
    skipTest: true,
  },
  {
    name: 'Buscar Cartão',
    method: 'POST',
    url: '/monitora/buscarCartao',
    body: { idUser: '1' },
    category: 'Pagamentos',
  },

  // === NEGOCIAÇÕES ===
  {
    name: 'Negociações',
    method: 'POST',
    url: '/monitora/negociacoes',
    body: {},
    category: 'Negociações',
  },
  {
    name: 'Termos Negociação',
    method: 'POST',
    url: '/monitora/termos_negociacao',
    body: { id: '1' },
    category: 'Negociações',
  },

  // === CHAT ===
  {
    name: 'Load Chat',
    method: 'POST',
    url: '/monitora/load_chat_monitora',
    body: { idUser: '1' },
    category: 'Chat',
  },
  {
    name: 'Monitoramento',
    method: 'POST',
    url: '/monitora/monitoramento',
    body: {},
    category: 'Monitoramento',
  },
];

// ==================== FUNÇÕES ====================

async function testEndpoint(endpoint) {
  try {
    const config = {
      method: endpoint.method,
      url: BASE_URL + endpoint.url,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
      timeout: 10000,
    };

    if (endpoint.method === 'POST' && endpoint.body) {
      config.data = endpoint.body;
    }

    const startTime = Date.now();
    const response = await axios(config);
    const endTime = Date.now();
    const duration = endTime - startTime;

    return {
      success: true,
      status: response.status,
      duration,
      data: response.data,
      headers: response.headers,
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 0,
      error: error.message,
      errorData: error.response?.data,
      errorCode: error.code,
    };
  }
}

async function testAllEndpoints() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       TESTANDO ENDPOINTS DA API - StoneUP Monitora        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Token: ${AUTH_TOKEN.substring(0, 20)}...`);
  console.log('');

  if (AUTH_TOKEN === 'SEU_TOKEN_AQUI') {
    console.log('❌ ERRO: Configure seu token de autenticação primeiro!');
    console.log('   Edite o arquivo e substitua AUTH_TOKEN pelo seu token real.');
    return;
  }

  const results = {
    working: [],
    failing: [],
    skipped: [],
    byCategory: {},
  };

  let testCount = 0;
  const totalTests = ENDPOINTS_TO_TEST.filter(e => !e.skipTest).length;

  for (const endpoint of ENDPOINTS_TO_TEST) {
    if (endpoint.skipTest) {
      console.log(`⏭️  PULANDO: ${endpoint.name}`);
      results.skipped.push({
        ...endpoint,
        reason: 'Marcado como skipTest para evitar alterações de dados',
      });
      continue;
    }

    testCount++;
    console.log(`\n[${testCount}/${totalTests}] Testando: ${endpoint.name}`);
    console.log(`    ${endpoint.method} ${endpoint.url}`);

    const result = await testEndpoint(endpoint);

    const endpointResult = {
      ...endpoint,
      ...result,
    };

    if (result.success) {
      console.log(`    ✅ SUCESSO - Status ${result.status} (${result.duration}ms)`);

      // Verificar se retornou dados
      if (result.data) {
        const hasData = Array.isArray(result.data.data)
          ? result.data.data.length > 0
          : result.data.data !== null && result.data.data !== undefined;

        if (hasData) {
          console.log(`    📊 Dados retornados: SIM`);
        } else {
          console.log(`    📊 Dados retornados: Vazio (esperado para alguns casos)`);
        }
      }

      results.working.push(endpointResult);
    } else {
      console.log(`    ❌ FALHA - Status ${result.status || 'N/A'}`);
      console.log(`    💬 Erro: ${result.error}`);

      if (result.status === 401) {
        console.log(`    ⚠️  Token inválido ou expirado!`);
      } else if (result.status === 404) {
        console.log(`    ⚠️  Endpoint não existe ou foi removido`);
      } else if (result.status === 500) {
        console.log(`    ⚠️  Erro no servidor`);
      }

      results.failing.push(endpointResult);
    }

    // Agrupar por categoria
    if (!results.byCategory[endpoint.category]) {
      results.byCategory[endpoint.category] = {
        working: [],
        failing: [],
        skipped: [],
      };
    }

    if (endpoint.skipTest) {
      results.byCategory[endpoint.category].skipped.push(endpointResult);
    } else if (result.success) {
      results.byCategory[endpoint.category].working.push(endpointResult);
    } else {
      results.byCategory[endpoint.category].failing.push(endpointResult);
    }

    // Delay entre requisições para não sobrecarregar o servidor
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

function generateReport(results) {
  console.log('\n\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                     RELATÓRIO FINAL                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  // Resumo geral
  console.log('📊 RESUMO GERAL:');
  console.log(`   ✅ Funcionando: ${results.working.length}`);
  console.log(`   ❌ Com falha: ${results.failing.length}`);
  console.log(`   ⏭️  Pulados: ${results.skipped.length}`);
  console.log(`   📈 Taxa de sucesso: ${((results.working.length / (results.working.length + results.failing.length)) * 100).toFixed(1)}%`);
  console.log('');

  // Por categoria
  console.log('📂 POR CATEGORIA:');
  console.log('');
  Object.keys(results.byCategory).forEach(category => {
    const cat = results.byCategory[category];
    const total = cat.working.length + cat.failing.length;
    const successRate = total > 0 ? ((cat.working.length / total) * 100).toFixed(1) : 0;

    console.log(`   ${category}:`);
    console.log(`      ✅ ${cat.working.length} funcionando`);
    console.log(`      ❌ ${cat.failing.length} com falha`);
    console.log(`      ⏭️  ${cat.skipped.length} pulados`);
    if (total > 0) {
      console.log(`      📈 ${successRate}% de sucesso`);
    }
    console.log('');
  });

  // Endpoints funcionando
  console.log('\n✅ ENDPOINTS FUNCIONANDO:');
  results.working.forEach(endpoint => {
    console.log(`   • ${endpoint.name}`);
    console.log(`     ${endpoint.method} ${endpoint.url}`);
    console.log(`     Tempo: ${endpoint.duration}ms`);
  });

  // Endpoints com falha
  if (results.failing.length > 0) {
    console.log('\n❌ ENDPOINTS COM FALHA:');
    results.failing.forEach(endpoint => {
      console.log(`   • ${endpoint.name}`);
      console.log(`     ${endpoint.method} ${endpoint.url}`);
      console.log(`     Status: ${endpoint.status || 'N/A'} - ${endpoint.error}`);
    });
  }

  // Endpoints pulados
  if (results.skipped.length > 0) {
    console.log('\n⏭️  ENDPOINTS PULADOS (Podem estar funcionando):');
    results.skipped.forEach(endpoint => {
      console.log(`   • ${endpoint.name}`);
      console.log(`     ${endpoint.method} ${endpoint.url}`);
      console.log(`     Motivo: ${endpoint.reason}`);
    });
  }

  // Salvar relatório em arquivo
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      working: results.working.length,
      failing: results.failing.length,
      skipped: results.skipped.length,
      successRate: ((results.working.length / (results.working.length + results.failing.length)) * 100).toFixed(1),
    },
    byCategory: results.byCategory,
    working: results.working.map(e => ({
      name: e.name,
      method: e.method,
      url: e.url,
      status: e.status,
      duration: e.duration,
    })),
    failing: results.failing.map(e => ({
      name: e.name,
      method: e.method,
      url: e.url,
      status: e.status,
      error: e.error,
    })),
    skipped: results.skipped.map(e => ({
      name: e.name,
      method: e.method,
      url: e.url,
    })),
  };

  const reportFile = 'endpoint-test-report.json';
  fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));

  console.log('\n');
  console.log(`📄 Relatório salvo em: ${reportFile}`);
  console.log('');
}

// ==================== EXECUÇÃO ====================

async function main() {
  try {
    const results = await testAllEndpoints();
    generateReport(results);
  } catch (error) {
    console.error('Erro ao executar testes:', error);
  }
}

main();
