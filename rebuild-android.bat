@echo off
echo ========================================
echo   REBUILD ANDROID APP
echo   Google Play Billing Fix
echo ========================================
echo.

echo [1/4] Limpando build anterior...
cd android
call gradlew clean
echo.

echo [2/4] Compilando APK release...
call gradlew assembleRelease
echo.

echo [3/4] Desinstalando versao antiga do dispositivo...
cd ..
adb uninstall br.com.stoneup.monitora.app
echo.

echo [4/4] Instalando nova versao...
adb install android\app\build\outputs\apk\release\app-release.apk
echo.

echo ========================================
echo   BUILD CONCLUIDO!
echo ========================================
echo.
echo Agora voce pode:
echo 1. Abrir o app no dispositivo
echo 2. Rodar: ver-logs-billing.bat
echo 3. Testar a compra
echo.

pause
