@echo off
echo ========================================
echo   BUILD VERSAO 70 - StoneApp
echo ========================================
echo.

echo [1/6] Limpando build anterior...
cd android
call gradlew.bat clean
cd ..
echo ✓ Build anterior limpo
echo.

echo [2/6] Desinstalando versoes antigas...
adb uninstall com.stoneativos.monitoraapp 2>nul
adb uninstall br.com.stoneup.monitora.app 2>nul
echo ✓ Apps antigos desinstalados
echo.

echo [3/6] Gerando APK release...
cd android
call gradlew.bat assembleRelease
cd ..
echo ✓ APK gerado
echo.

echo [4/6] Instalando nova versao...
adb install android\app\build\outputs\apk\release\app-release.apk
echo ✓ App instalado
echo.

echo [5/6] Limpando cache do Play Store...
adb shell pm clear com.android.vending
echo ✓ Cache limpo
echo.

echo [6/6] Verificando package instalado...
adb shell pm list packages | findstr monitora
echo.

echo ========================================
echo   BUILD CONCLUIDO!
echo ========================================
echo.
echo Proximos passos:
echo 1. Abra o app no dispositivo
echo 2. Va para Planos/Assinaturas
echo 3. Selecione um plano
echo 4. Escolha metodo: Google Play
echo 5. Clique no botao azul: "🔍 Executar Diagnostico Completo"
echo 6. Verifique os logs do ADB
echo.
echo Para ver os logs:
echo   adb logcat ^| findstr -i "GooglePlay Billing"
echo.
pause
