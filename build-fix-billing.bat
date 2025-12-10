@echo off
echo ========================================
echo   BUILD CORRECAO GOOGLE PLAY BILLING
echo   Versao: 75 - Fix Global Fix
echo ========================================
echo.

echo [1/4] Limpando build anterior...
cd android
call gradlew clean
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Falha ao limpar build
    pause
    exit /b 1
)

echo.
echo [2/4] Gerando bundle Android...
call gradlew bundleRelease
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Falha ao gerar bundle
    pause
    exit /b 1
)

echo.
echo [3/4] Gerando APK de teste...
call gradlew assembleRelease
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Falha ao gerar APK
    pause
    exit /b 1
)

cd ..

echo.
echo [4/4] Instalando no dispositivo...
adb devices
echo.
adb install -r android\app\build\outputs\apk\release\app-release.apk
if %ERRORLEVEL% NEQ 0 (
    echo AVISO: Falha na instalacao automatica
    echo Por favor, instale manualmente o APK em:
    echo android\app\build\outputs\apk\release\app-release.apk
    pause
    exit /b 1
)

echo.
echo ========================================
echo   BUILD CONCLUIDO COM SUCESSO!
echo ========================================
echo.
echo APK gerado em:
echo android\app\build\outputs\apk\release\app-release.apk
echo.
echo Bundle gerado em:
echo android\app\build\outputs\bundle\release\app-release.aab
echo.
echo Pressione qualquer tecla para iniciar o app...
pause > nul

adb shell am start -n br.com.stoneup.monitora.app/.MainActivity

echo.
echo App iniciado! Verifique o dispositivo.
echo.
pause
