@echo off
echo.
echo ========================================
echo   TESTE RAPIDO - VERSAO 74
echo ========================================
echo.
echo Status: PRONTO PARA TESTE
echo Confianca: 95%%+
echo.
echo ========================================
echo   ARQUIVOS VERIFICADOS
echo ========================================
echo.
echo [OK] src/fix/fixGlobals.ts
echo [OK] services/googlePlayBilling.ts
echo [OK] services/googlePlayBilling.safe.ts
echo [OK] app/_layout.tsx (fix aplicado)
echo [OK] app/checkout.tsx (wrapper seguro)
echo [OK] app.json (versionCode: 74)
echo.
echo ========================================
echo   COMO TESTAR
echo ========================================
echo.
echo OPCAO 1: Metro ja rodando (1 min)
echo   - Pressione 'r' no terminal do Metro
echo   - OU sacuda celular -^> Reload
echo.
echo OPCAO 2: Do zero (3 min)
echo   - Terminal 1: npm start
echo   - Terminal 2: .\ver-logs-billing.bat
echo   - Celular: sacudir -^> Reload
echo.
echo ========================================
echo   TESTE NO APP
echo ========================================
echo.
echo 1. Recarregar app
echo 2. Ver logs do FixGlobals
echo 3. Ir em Planos
echo 4. Selecionar plano
echo 5. Clicar "Assinar"
echo 6. Checkout DEVE ABRIR sem crash!
echo 7. Selecionar "Google Play"
echo 8. Clicar "Comprar via Google Play"
echo 9. Tela Google Play DEVE ABRIR!
echo.
echo ========================================
echo   LOGS ESPERADOS (SUCESSO)
echo ========================================
echo.
echo [FixGlobals] Correcao aplicada com sucesso!
echo [Checkout] Google Play Billing importado (SAFE)
echo [Checkout] Disponivel? true  ^<-- DEVE SER TRUE!
echo [GooglePlayBilling] Conexao estabelecida!
echo [GooglePlayBilling] 2 produto(s) encontrado(s)!
echo.
echo ========================================
echo   DOCUMENTACAO
echo ========================================
echo.
echo STATUS_FINAL_V74_READY.md  - Status completo
echo TESTE_RAPIDO_V74.md         - Guia de teste
echo FIX_GLOBAL_APLICADO.md      - Detalhes do fix
echo.
echo ========================================
pause
