@echo off
chcp 65001 >nul
cls

echo.
echo ========================================
echo   DIAGNÓSTICO COMPLETO - Google Play
echo ========================================
echo.

:: Verificar dispositivo
echo [1/5] Verificando dispositivo conectado...
echo.
adb devices
echo.

:: Package name instalado
echo [2/5] Verificando package name instalado...
echo.
adb shell pm list packages | findstr stone
echo.

:: Version code do app instalado
echo [3/5] Verificando version code...
echo.
adb shell dumpsys package com.stoneativos.monitoraapp | findstr versionCode | findstr /v "targetSdk"
echo.

:: Permissões
echo [4/5] Verificando permissões...
echo.
adb shell dumpsys package com.stoneativos.monitoraapp | findstr BILLING
echo.

:: Limpar cache do Play Store
echo [5/5] Deseja limpar o cache do Google Play Store? (S/N)
set /p LIMPAR="> "

if /i "%LIMPAR%"=="S" (
    echo.
    echo Limpando cache do Play Store...
    adb shell pm clear com.android.vending
    echo ✓ Cache limpo!
) else (
    echo Cache não foi limpo
)

echo.
echo ========================================
echo   DIAGNÓSTICO CONCLUÍDO
echo ========================================
echo.
echo PRÓXIMOS PASSOS:
echo.
echo 1. Abra o app e vá até a tela de checkout
echo 2. O diagnóstico completo será executado automaticamente
echo 3. Execute: .\ver-logs-billing.bat
echo 4. Envie os logs completos para análise
echo.
echo IMPORTANTE:
echo - Verifique se o versionCode é 70 ou superior
echo - Confirme que o package é: com.stoneativos.monitoraapp
echo - Garanta que a permissão BILLING está presente
echo.
pause
