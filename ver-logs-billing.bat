@echo off
echo ========================================
echo   MONITOR DE LOGS - Google Play Billing
echo ========================================
echo.
echo Verificando dispositivo conectado...
adb devices
echo.
echo Limpando logs anteriores...
adb logcat -c
echo.
echo ========================================
echo   Aguardando logs...
echo   Pressione Ctrl+C para parar
echo ========================================
echo.

REM Filtrar apenas logs relevantes do Google Play Billing e Checkout
adb logcat | findstr /C:"[GooglePlayBilling]" /C:"[Checkout]" /C:"ReactNativeJS"

pause
