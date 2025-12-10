@echo off
echo ========================================
echo   VERIFICACAO DE CONFIGURACAO
echo   Google Play Billing
echo ========================================
echo.

echo [1/4] Verificando dispositivo conectado...
adb devices
echo.

echo [2/4] Verificando pasta android...
if exist "android\app\build.gradle" (
    echo ✅ Pasta android encontrada
    echo.
    echo [3/4] Package Name configurado:
    findstr /C:"applicationId" android\app\build.gradle
) else (
    echo ❌ Pasta android nao encontrada
    echo.
    echo Voce precisa fazer prebuild primeiro:
    echo   npx expo prebuild --platform android
)
echo.

echo [4/4] Verificando react-native-iap no package.json...
findstr /C:"react-native-iap" package.json
echo.

echo ========================================
echo   SKUs configurados no codigo:
echo ========================================
echo.
echo Arquivo: services\googlePlayBilling.ts
echo.
findstr /C:"br.com.stoneup.monitora.app" services\googlePlayBilling.ts
echo.

echo ========================================
echo   IMPORTANTE:
echo ========================================
echo.
echo 1. O Package Name do app DEVE corresponder aos
echo    SKUs criados no Google Play Console
echo.
echo 2. Formato correto do SKU:
echo    ^<PACKAGE_NAME^>.^<NOME_PRODUTO^>
echo.
echo 3. Exemplo:
echo    Package: com.exemplo.app
echo    SKU: com.exemplo.app.mensal
echo.
echo Leia: ATENCAO_PACKAGE_NAME.md
echo.

pause
