@echo off
chcp 65001 >nul
cls

echo.
echo ========================================
echo   INSTALAR VERSÃO 71 - Package Correto
echo ========================================
echo.

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
echo [1/5] Verificando dispositivo conectado...
adb devices -l
echo.

set /p CONTINUE="Dispositivo conectado? (S/N): "
if /i not "%CONTINUE%"=="S" (
    echo.
    echo ❌ Conecte o dispositivo e execute novamente.
    pause
    exit /b 1
)

:: Desinstalar versão antiga
echo.
echo [2/5] Desinstalando versão antiga...
adb uninstall br.com.stoneup.monitora.app
echo.

:: Instalar nova versão
echo [3/5] Instalando versão 71 (package correto)...
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
echo [4/5] Limpando cache do Google Play Store...
adb shell pm clear com.android.vending
echo ✓ Cache limpo!

:: Verificar versão instalada
echo.
echo [5/5] Verificando instalação...
echo.
echo Package instalado:
adb shell pm list packages | findstr stone

echo.
echo Version Code:
adb shell dumpsys package br.com.stoneup.monitora.app | findstr versionCode | findstr /v "targetSdk"

echo.
echo ========================================
echo   ✓ INSTALAÇÃO CONCLUÍDA
echo ========================================
echo.
echo PRÓXIMO PASSO - TESTAR:
echo.
echo 1. Abra o app (deve abrir automaticamente)
echo 2. Faça login se necessário
echo 3. Vá para: Planos → Selecione um plano
echo 4. Checkout → Selecione "Google Play"
echo 5. Clique em "Comprar via Google Play"
echo.
echo MONITORAR LOGS:
echo Execute em outro terminal: .\ver-logs-billing.bat
echo.
echo DIAGNÓSTICO COMPLETO:
echo No app, na tela de checkout (Google Play):
echo Clique no botão "🔍 Executar Diagnóstico Completo"
echo.

:: Abrir o app automaticamente
echo Abrindo o app...
adb shell monkey -p br.com.stoneup.monitora.app -c android.intent.category.LAUNCHER 1 >nul 2>&1

echo.
echo App aberto! Teste a compra agora.
echo.
pause
