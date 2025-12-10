@echo off
chcp 65001 >nul
cls

echo.
echo ========================================
echo   QUICK FIX - Google Play Billing
echo ========================================
echo.

echo Este script vai executar os seguintes passos:
echo 1. Limpar cache do Google Play Store
echo 2. Verificar package name instalado
echo 3. Verificar version code
echo 4. Reiniciar o app
echo.
echo Pressione qualquer tecla para continuar...
pause >nul

echo.
echo [1/4] Verificando dispositivo...
adb devices -l
echo.

set /p CONTINUE="Dispositivo conectado? (S/N): "
if /i not "%CONTINUE%"=="S" (
    echo.
    echo ❌ Conecte o dispositivo e execute novamente.
    pause
    exit /b 1
)

echo.
echo [2/4] Limpando cache do Google Play Store...
adb shell pm clear com.android.vending
if %ERRORLEVEL% EQU 0 (
    echo ✓ Cache limpo com sucesso!
) else (
    echo ❌ Erro ao limpar cache
)

echo.
echo [3/4] Verificando configuração do app...
echo.
echo Package instalado:
adb shell pm list packages | findstr stone

echo.
echo Version Code:
adb shell dumpsys package com.stoneativos.monitoraapp | findstr versionCode | findstr /v "targetSdk"

echo.
echo Permissões:
adb shell dumpsys package com.stoneativos.monitoraapp | findstr BILLING

echo.
echo [4/4] Reiniciando o app...
adb shell am force-stop com.stoneativos.monitoraapp
timeout /t 2 /nobreak >nul
adb shell monkey -p com.stoneativos.monitoraapp -c android.intent.category.LAUNCHER 1 >nul 2>&1

echo.
echo ========================================
echo   ✓ QUICK FIX CONCLUÍDO
echo ========================================
echo.
echo PRÓXIMOS PASSOS:
echo.
echo 1. O app deve ter aberto automaticamente
echo 2. Faça login se necessário
echo 3. Vá para: Planos → Selecionar plano → Checkout
echo 4. Selecione "Google Play" como método de pagamento
echo 5. Clique em "🔍 Executar Diagnóstico Completo"
echo.
echo 6. Em outro terminal, execute:
echo    .\ver-logs-billing.bat
echo.
echo IMPORTANTE:
echo - Se versionCode não for 70+, precisa reinstalar o APK correto
echo - Se package não for com.stoneativos.monitoraapp, há problema no build
echo - Se BILLING não aparecer, falta a permissão no AndroidManifest
echo.
pause
