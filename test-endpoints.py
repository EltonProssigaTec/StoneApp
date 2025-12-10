#!/usr/bin/env python3
"""
Script para testar endpoints da API StoneUP Monitora

Como usar:
1. Instale requests: pip install requests
2. Configure seu token abaixo
3. Execute: python test-endpoints.py
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Any

# ==================== CONFIGURAÇÃO ====================
BASE_URL = 'https://api.stoneup.com.br/api/v1.0'
AUTH_TOKEN = 'SEU_TOKEN_AQUI'  # ⚠️ SUBSTITUA pelo seu token

# ID de usuário para testes (substitua por um real)
TEST_USER_ID = '1'

# Endpoints para testar
ENDPOINTS_TO_TEST = [
    # === PLANOS E ASSINATURAS ===
    {
        'name': 'Listar Planos',
        'method': 'POST',
        'url': '/monitora/listar_planos',
        'body': {},
        'category': 'Planos',
    },
    {
        'name': 'Listar Plano do Usuário',
        'method': 'POST',
        'url': '/monitora/listar_plano_user',
        'body': {'idUser': TEST_USER_ID},
        'category': 'Planos',
    },
    {
        'name': 'Inserir Plano Usuário',
        'method': 'POST',
        'url': '/monitora/inser_plano_user',
        'body': {'idUser': TEST_USER_ID, 'idPlano': '1', 'metodoPagamento': 'test'},
        'category': 'Planos',
        'skip_test': True,
    },
    {
        'name': 'Alterar Plano',
        'method': 'POST',
        'url': '/monitora/alterar_plano',
        'body': {'idUser': TEST_USER_ID, 'plano': '1'},
        'category': 'Planos',
        'skip_test': True,
    },
    {
        'name': 'Remover Plano Usuário',
        'method': 'POST',
        'url': '/monitora/remover_plano_user',
        'body': {'idUser': TEST_USER_ID},
        'category': 'Planos',
        'skip_test': True,
    },
    {
        'name': 'Listar Descontos do Plano',
        'method': 'POST',
        'url': '/monitora/listar_descontos_plano_user',
        'body': {'id_plano': '1'},
        'category': 'Planos',
    },
    {
        'name': 'Usar Cupom',
        'method': 'POST',
        'url': '/monitora/usarCupom',
        'body': {'idUser': TEST_USER_ID, 'codigo': 'TEST'},
        'category': 'Planos',
        'skip_test': True,
    },

    # === BUSCA ===
    {
        'name': 'Buscar Negativados por CPF/CNPJ',
        'method': 'POST',
        'url': '/monitora/searchNegativados/12345678901',
        'body': {},
        'category': 'Busca',
    },
    {
        'name': 'Buscar Dívidas',
        'method': 'POST',
        'url': '/monitora/searchDividas',
        'body': {},
        'category': 'Busca',
    },
    {
        'name': 'Consultar Empresas por CNPJ Credor',
        'method': 'POST',
        'url': '/monitora/consult_empresas_cnpjCredor',
        'body': {'cnpj_credor': '12345678000190'},
        'category': 'Busca',
    },
    {
        'name': 'Get Dívida',
        'method': 'POST',
        'url': '/monitora/getDivida',
        'body': {'id': '1'},
        'category': 'Busca',
    },
    {
        'name': 'Get Empresa Dívida',
        'method': 'POST',
        'url': '/monitora/getEmpresaDivida',
        'body': {'id': '1'},
        'category': 'Busca',
    },

    # === USUÁRIO ===
    {
        'name': 'Editar Usuário',
        'method': 'POST',
        'url': '/monitora/editar_usuarios',
        'body': {'idUser': TEST_USER_ID},
        'category': 'Usuário',
        'skip_test': True,
    },
    {
        'name': 'Endereço Usuário',
        'method': 'POST',
        'url': '/monitora/endereco_usuarios',
        'body': {'idUser': TEST_USER_ID},
        'category': 'Usuário',
    },
    {
        'name': 'Consultar Endereço Usuário',
        'method': 'POST',
        'url': '/monitora/consultar_usuario_endereco',
        'body': {'idUser': TEST_USER_ID},
        'category': 'Usuário',
    },

    # === NOTIFICAÇÕES ===
    {
        'name': 'Load Notificações',
        'method': 'POST',
        'url': '/monitora/load_notificacoes_usuarios',
        'body': {'idUser': TEST_USER_ID},
        'category': 'Notificações',
    },
    {
        'name': 'Notificações Não Lidas',
        'method': 'POST',
        'url': '/monitora/naolidas_notificacoes_usuarios',
        'body': {'idUser': TEST_USER_ID},
        'category': 'Notificações',
    },

    # === PAGAMENTOS ===
    {
        'name': 'Buscar Cartão',
        'method': 'POST',
        'url': '/monitora/buscarCartao',
        'body': {'idUser': TEST_USER_ID},
        'category': 'Pagamentos',
    },

    # === NEGOCIAÇÕES ===
    {
        'name': 'Negociações',
        'method': 'POST',
        'url': '/monitora/negociacoes',
        'body': {},
        'category': 'Negociações',
    },

    # === CHAT ===
    {
        'name': 'Load Chat',
        'method': 'POST',
        'url': '/monitora/load_chat_monitora',
        'body': {'idUser': TEST_USER_ID},
        'category': 'Chat',
    },
    {
        'name': 'Monitoramento',
        'method': 'POST',
        'url': '/monitora/monitoramento',
        'body': {},
        'category': 'Monitoramento',
    },
]


def test_endpoint(endpoint: Dict[str, Any]) -> Dict[str, Any]:
    """Testa um endpoint específico"""
    try:
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': f'Bearer {AUTH_TOKEN}',
        }

        url = BASE_URL + endpoint['url']
        method = endpoint['method']
        body = endpoint.get('body', {})

        start_time = time.time()

        if method == 'POST':
            response = requests.post(url, json=body, headers=headers, timeout=10)
        elif method == 'GET':
            response = requests.get(url, headers=headers, timeout=10)
        else:
            response = requests.request(method, url, json=body, headers=headers, timeout=10)

        end_time = time.time()
        duration = int((end_time - start_time) * 1000)  # ms

        return {
            'success': True,
            'status': response.status_code,
            'duration': duration,
            'data': response.json() if response.text else None,
            'headers': dict(response.headers),
        }

    except requests.exceptions.RequestException as e:
        status = 0
        error_data = None

        if hasattr(e, 'response') and e.response is not None:
            status = e.response.status_code
            try:
                error_data = e.response.json()
            except:
                error_data = e.response.text

        return {
            'success': False,
            'status': status,
            'error': str(e),
            'error_data': error_data,
        }


def test_all_endpoints() -> Dict[str, Any]:
    """Testa todos os endpoints"""
    print('╔════════════════════════════════════════════════════════════╗')
    print('║       TESTANDO ENDPOINTS DA API - StoneUP Monitora        ║')
    print('╚════════════════════════════════════════════════════════════╝')
    print('')
    print(f'Base URL: {BASE_URL}')
    print(f'Token: {AUTH_TOKEN[:20]}...')
    print('')

    if AUTH_TOKEN == 'SEU_TOKEN_AQUI':
        print('❌ ERRO: Configure seu token de autenticação primeiro!')
        print('   Edite o arquivo e substitua AUTH_TOKEN pelo seu token real.')
        return None

    results = {
        'working': [],
        'failing': [],
        'skipped': [],
        'by_category': {},
    }

    test_count = 0
    total_tests = len([e for e in ENDPOINTS_TO_TEST if not e.get('skip_test', False)])

    for endpoint in ENDPOINTS_TO_TEST:
        if endpoint.get('skip_test', False):
            print(f"⏭️  PULANDO: {endpoint['name']}")
            results['skipped'].append({
                **endpoint,
                'reason': 'Marcado como skip_test para evitar alterações de dados',
            })
            continue

        test_count += 1
        print(f"\n[{test_count}/{total_tests}] Testando: {endpoint['name']}")
        print(f"    {endpoint['method']} {endpoint['url']}")

        result = test_endpoint(endpoint)

        endpoint_result = {**endpoint, **result}

        if result['success']:
            print(f"    ✅ SUCESSO - Status {result['status']} ({result['duration']}ms)")

            # Verificar se retornou dados
            if result['data']:
                data = result['data'].get('data')
                has_data = False

                if isinstance(data, list):
                    has_data = len(data) > 0
                elif data is not None:
                    has_data = True

                if has_data:
                    print(f"    📊 Dados retornados: SIM")
                else:
                    print(f"    📊 Dados retornados: Vazio (esperado para alguns casos)")

            results['working'].append(endpoint_result)
        else:
            print(f"    ❌ FALHA - Status {result.get('status', 'N/A')}")
            print(f"    💬 Erro: {result['error']}")

            if result.get('status') == 401:
                print(f"    ⚠️  Token inválido ou expirado!")
            elif result.get('status') == 404:
                print(f"    ⚠️  Endpoint não existe ou foi removido")
            elif result.get('status') == 500:
                print(f"    ⚠️  Erro no servidor")

            results['failing'].append(endpoint_result)

        # Agrupar por categoria
        category = endpoint['category']
        if category not in results['by_category']:
            results['by_category'][category] = {
                'working': [],
                'failing': [],
                'skipped': [],
            }

        if endpoint.get('skip_test', False):
            results['by_category'][category]['skipped'].append(endpoint_result)
        elif result['success']:
            results['by_category'][category]['working'].append(endpoint_result)
        else:
            results['by_category'][category]['failing'].append(endpoint_result)

        # Delay entre requisições
        time.sleep(0.5)

    return results


def generate_report(results: Dict[str, Any]):
    """Gera relatório dos testes"""
    print('\n\n')
    print('╔════════════════════════════════════════════════════════════╗')
    print('║                     RELATÓRIO FINAL                        ║')
    print('╚════════════════════════════════════════════════════════════╝')
    print('')

    # Resumo geral
    working_count = len(results['working'])
    failing_count = len(results['failing'])
    skipped_count = len(results['skipped'])
    total = working_count + failing_count
    success_rate = (working_count / total * 100) if total > 0 else 0

    print('📊 RESUMO GERAL:')
    print(f'   ✅ Funcionando: {working_count}')
    print(f'   ❌ Com falha: {failing_count}')
    print(f'   ⏭️  Pulados: {skipped_count}')
    print(f'   📈 Taxa de sucesso: {success_rate:.1f}%')
    print('')

    # Por categoria
    print('📂 POR CATEGORIA:')
    print('')
    for category, cat_results in results['by_category'].items():
        working = len(cat_results['working'])
        failing = len(cat_results['failing'])
        skipped = len(cat_results['skipped'])
        total = working + failing
        cat_success_rate = (working / total * 100) if total > 0 else 0

        print(f'   {category}:')
        print(f'      ✅ {working} funcionando')
        print(f'      ❌ {failing} com falha')
        print(f'      ⏭️  {skipped} pulados')
        if total > 0:
            print(f'      📈 {cat_success_rate:.1f}% de sucesso')
        print('')

    # Endpoints funcionando
    print('\n✅ ENDPOINTS FUNCIONANDO:')
    for endpoint in results['working']:
        print(f"   • {endpoint['name']}")
        print(f"     {endpoint['method']} {endpoint['url']}")
        print(f"     Tempo: {endpoint['duration']}ms")

    # Endpoints com falha
    if results['failing']:
        print('\n❌ ENDPOINTS COM FALHA:')
        for endpoint in results['failing']:
            print(f"   • {endpoint['name']}")
            print(f"     {endpoint['method']} {endpoint['url']}")
            print(f"     Status: {endpoint.get('status', 'N/A')} - {endpoint['error']}")

    # Endpoints pulados
    if results['skipped']:
        print('\n⏭️  ENDPOINTS PULADOS (Podem estar funcionando):')
        for endpoint in results['skipped']:
            print(f"   • {endpoint['name']}")
            print(f"     {endpoint['method']} {endpoint['url']}")
            print(f"     Motivo: {endpoint.get('reason', 'N/A')}")

    # Salvar relatório
    report_data = {
        'timestamp': datetime.now().isoformat(),
        'summary': {
            'working': working_count,
            'failing': failing_count,
            'skipped': skipped_count,
            'success_rate': f'{success_rate:.1f}%',
        },
        'by_category': {
            cat: {
                'working': len(data['working']),
                'failing': len(data['failing']),
                'skipped': len(data['skipped']),
            }
            for cat, data in results['by_category'].items()
        },
        'working': [
            {
                'name': e['name'],
                'method': e['method'],
                'url': e['url'],
                'status': e['status'],
                'duration': e['duration'],
            }
            for e in results['working']
        ],
        'failing': [
            {
                'name': e['name'],
                'method': e['method'],
                'url': e['url'],
                'status': e.get('status', 'N/A'),
                'error': e['error'],
            }
            for e in results['failing']
        ],
        'skipped': [
            {
                'name': e['name'],
                'method': e['method'],
                'url': e['url'],
            }
            for e in results['skipped']
        ],
    }

    report_file = 'endpoint-test-report.json'
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report_data, f, indent=2, ensure_ascii=False)

    print('\n')
    print(f'📄 Relatório salvo em: {report_file}')
    print('')


def main():
    """Função principal"""
    try:
        results = test_all_endpoints()
        if results:
            generate_report(results)
    except Exception as e:
        print(f'Erro ao executar testes: {e}')
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
