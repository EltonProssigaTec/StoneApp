@echo off
echo ========================================
echo   SALVAR LOGS - Google Play Billing
echo ========================================
echo.

REM Criar nome do arquivo com timestamp
set timestamp=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set timestamp=%timestamp: =0%
set filename=logs_billing_%timestamp%.txt

echo Verificando dispositivo conectado...
adb devices
echo.
echo Limpando logs anteriores...
adb logcat -c
echo.
echo Salvando logs em: %filename%
echo.
echo ========================================
echo   Aguardando logs...
echo   Pressione Ctrl+C quando terminar o teste
echo ========================================
echo.

REM Salvar logs filtrados em arquivo
adb logcat | findstr /C:"[GooglePlayBilling]" /C:"[Checkout]" > %filename%

echo.
echo Logs salvos em: %filename%
pause
