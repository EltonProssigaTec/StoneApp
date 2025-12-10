@echo off
REM ========================================
REM  BUILD v74 - VERSAO CORRIGIDA GOOGLE PLAY BILLING
REM ========================================

echo.
echo ========================================
echo   BUILD v74 - Google Play Billing Fixed
echo ========================================
echo.

echo [1/6] Limpando cache do Metro...
call npm start -- --clear 2>nul
timeout /t 2 /nobreak >nul

echo [2/6] Limpando build Android...
cd android
call gradlew clean
cd ..

echo [3/6] Limpando cache do npm...
rmdir /s /q node_modules\.cache 2>nul
del /q package-lock.json 2>nul

echo [4/6] Reinstalando dependencias...
call npm install

echo [5/6] Gerando build nativo...
call npx expo prebuild --clean

echo [6/6] Gerando APK v74...
cd android
call gradlew assembleRelease
cd ..

echo.
echo ========================================
echo   BUILD COMPLETO!
echo ========================================
echo.
echo APK gerado em:
echo android\app\build\outputs\apk\release\app-release.apk
echo.
echo Agora execute: .\install-v74.bat
echo.

pause
