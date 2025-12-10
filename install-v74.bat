@echo off
REM ========================================
REM  INSTALACAO v74 - GOOGLE PLAY BILLING FIXED
REM ========================================

echo.
echo ========================================
echo   INSTALANDO v74 - Google Play Billing
echo ========================================
echo.

echo [1/5] Verificando dispositivo conectado...
adb devices
echo.

echo [2/5] Desinstalando versoes antigas...
adb uninstall br.com.stoneup.monitora.app 2>nul
timeout /t 2 /nobreak >nul

echo [3/5] Limpando cache do Play Store...
adb shell pm clear com.android.vending
timeout /t 2 /nobreak >nul

echo [4/5] Instalando APK v74...
adb install android\app\build\outputs\apk\release\app-release.apk
timeout /t 2 /nobreak >nul

echo [5/5] Abrindo app...
adb shell monkey -p br.com.stoneup.monitora.app -c android.intent.category.LAUNCHER 1
echo.

echo ========================================
echo   INSTALACAO COMPLETA!
echo ========================================
echo.
echo Package: br.com.stoneup.monitora.app
echo Version Code: 74
echo.
echo Agora execute: .\ver-logs-billing.bat
echo.

pause
