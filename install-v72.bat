@echo off
chcp 65001 >nul
cls

echo.
echo ========================================
echo   INSTALAR VERSÃO 72 - TESTE DIAGNÓSTICO
echo ========================================
echo.
echo Este é um TESTE para verificar se os produtos
echo ORIGINAIS (com.stoneativos.monitoraapp.*) funcionam.
echo.
pause

:: Verificar se APK existe
if not exist "android\app\build\outputs\apk\release\app-release.apk" (
    echo ❌ APK não encontrado!
    echo.
    echo Execute primeiro:
    echo cd android
    echo .\gradlew assembleRelease
    echo.
    pause
    exit /b 1
)

echo ✓ APK encontrado!
echo.

:: Verificar dispositivo
echo [1/6] Verificando dispositivo conectado...
adb devices -l
echo.

set /p CONTINUE="Dispositivo conectado? (S/N): "
if /i not "%CONTINUE%"=="S" (
    echo.
    echo ❌ Conecte o dispositivo e execute novamente.
    pause
    exit /b 1
)

:: Desinstalar versões antigas (ambos package names)
echo.
echo [2/6] Desinstalando versões antigas...
echo Removendo br.com.stoneup.monitora.app (se existir)...
adb uninstall br.com.stoneup.monitora.app 2>nul
echo Removendo com.stoneativos.monitoraapp (se existir)...
adb uninstall com.stoneativos.monitoraapp 2>nul
echo.

:: Instalar nova versão
echo [3/6] Instalando versão 72 (package: com.stoneativos.monitoraapp)...
adb install android\app\build\outputs\apk\release\app-release.apk
echo.

if %ERRORLEVEL% EQU 0 (
    echo ✓ Instalado com sucesso!
) else (
    echo ❌ Erro na instalação
    pause
    exit /b 1
)

:: Limpar cache do Play Store
echo.
echo [4/6] Limpando cache do Google Play Store...
adb shell pm clear com.android.vending
echo ✓ Cache limpo!

:: Verificar versão instalada
echo.
echo [5/6] Verificando instalação...
echo.
echo Package instalado:
adb shell pm list packages | findstr stone

echo.
echo Version Code:
adb shell dumpsys package com.stoneativos.monitoraapp | findstr versionCode | findstr /v "targetSdk"

echo.
echo [6/6] Verificando Product IDs no código...
echo.
echo Product IDs configurados (v72):
echo   1. com.stoneativos.monitoraapp.monitora
echo   2. com.stoneativos.monitoraapp.stoneupplus
echo.

echo.
echo ========================================
echo   ✓ INSTALAÇÃO CONCLUÍDA - TESTE V72
echo ========================================
echo.
echo ⚠️  IMPORTANTE: ESTE É UM TESTE DIAGNÓSTICO
echo.
echo OBJETIVO:
echo - Verificar se os produtos ORIGINAIS funcionam
echo - Se funcionarem: confirma que sistema está OK
echo - Se não funcionarem: problema está no Google Play Console
echo.
echo PRÓXIMO PASSO - TESTAR:
echo.
echo 1. Abra o app (deve abrir automaticamente)
echo 2. Faça login se necessário
echo 3. Vá para: Planos → Selecione um plano
echo 4. Checkout → Selecione "Google Play"
echo 5. Clique em "🔍 Executar Diagnóstico Completo"
echo.
echo MONITORAR LOGS:
echo Execute em outro terminal: .\ver-logs-billing.bat
echo.
echo RESULTADOS ESPERADOS:
echo.
echo ✅ CENÁRIO 1: Produtos encontrados
echo    → Sistema OK, produtos "Real" precisam propagação
echo.
echo ❌ CENÁRIO 2: Produtos NÃO encontrados
echo    → Problema no Google Play Console
echo.
echo Leia: TESTE_DIAGNOSTICO_V72.md para mais detalhes
echo.

:: Abrir o app automaticamente
echo Abrindo o app...
adb shell monkey -p com.stoneativos.monitoraapp -c android.intent.category.LAUNCHER 1 >nul 2>&1

echo.
echo App aberto! Execute o diagnóstico agora.
echo.
pause
