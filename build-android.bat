@echo off
echo =====================================
echo   StoneApp - Build Android
echo =====================================
echo.

echo [1/4] Verificando ambiente...
where gradle >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Gradle nao encontrado!
    echo Instale Android Studio primeiro.
    pause
    exit /b 1
)

echo [2/4] Limpando builds anteriores...
cd android
call gradlew clean
cd ..

echo [3/4] Gerando build DEBUG...
cd android
call gradlew assembleDebug
cd ..

echo.
echo =====================================
echo   BUILD CONCLUIDO!
echo =====================================
echo.
echo APK gerado em:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Para instalar no dispositivo:
echo adb install android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause
