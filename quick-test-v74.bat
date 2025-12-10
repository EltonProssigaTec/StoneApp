@echo off
REM ========================================
REM  TESTE RAPIDO v74
REM ========================================

echo.
echo ========================================
echo   TESTE RAPIDO - Google Play Billing v74
echo ========================================
echo.

echo [1/4] Parando Metro...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] Rebuild rapido...
cd android
call gradlew assembleRelease
cd ..

echo [3/4] Instalando...
adb uninstall br.com.stoneup.monitora.app 2>nul
adb shell pm clear com.android.vending 2>nul
timeout /t 2 /nobreak >nul
adb install android\app\build\outputs\apk\release\app-release.apk

echo [4/4] Abrindo app...
adb shell monkey -p br.com.stoneup.monitora.app -c android.intent.category.LAUNCHER 1

echo.
echo ========================================
echo   PRONTO! Agora teste no app
echo ========================================
echo.
echo Execute em outro terminal:
echo .\ver-logs-billing.bat
echo.

pause
