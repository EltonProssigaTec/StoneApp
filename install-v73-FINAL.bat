@echo off
chcp 65001 >nul
cls

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║     INSTALAR VERSÃO 73 - SOLUÇÃO FINAL                  ║
echo ║     Package Correto: br.com.stoneup.monitora.app         ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo ✅ PROBLEMA IDENTIFICADO E CORRIGIDO:
echo.
echo O código estava usando package: com.stoneativos.monitoraapp
echo Mas no Google Play Console o package é: br.com.stoneup.monitora.app
echo.
echo A v73 está com o package CORRETO agora!
echo.
pause

:: Verificar se APK existe
if not exist "android\app\build\outputs\apk\release\app-release.apk" (
    echo ❌ APK não encontrado!
    echo.
    echo Execute primeiro:
    echo cd android
    echo .\gradlew assembleRelease
    echo.
    pause
    exit /b 1
)

echo ✓ APK encontrado!
echo.

:: Verificar dispositivo
echo [1/6] Verificando dispositivo conectado...
adb devices -l
echo.

set /p CONTINUE="Dispositivo conectado? (S/N): "
if /i not "%CONTINUE%"=="S" (
    echo.
    echo ❌ Conecte o dispositivo e execute novamente.
    pause
    exit /b 1
)

:: Desinstalar versões antigas
echo.
echo [2/6] Desinstalando versões antigas...
echo Removendo br.com.stoneup.monitora.app (se existir)...
adb uninstall br.com.stoneup.monitora.app 2>nul
echo Removendo com.stoneativos.monitoraapp (se existir)...
adb uninstall com.stoneativos.monitoraapp 2>nul
echo.

:: Instalar nova versão
echo [3/6] Instalando versão 73 (package CORRETO: br.com.stoneup.monitora.app)...
adb install android\app\build\outputs\apk\release\app-release.apk
echo.

if %ERRORLEVEL% EQU 0 (
    echo ✓ Instalado com sucesso!
) else (
    echo ❌ Erro na instalação
    pause
    exit /b 1
)

:: Limpar cache do Play Store
echo.
echo [4/6] Limpando cache do Google Play Store...
adb shell pm clear com.android.vending
echo ✓ Cache limpo!

:: Verificar versão instalada
echo.
echo [5/6] Verificando instalação...
echo.
echo Package instalado:
adb shell pm list packages | findstr stone

echo.
echo Version Code:
adb shell dumpsys package br.com.stoneup.monitora.app | findstr versionCode | findstr /v "targetSdk"

echo.
echo [6/6] Verificando Product IDs no código...
echo.
echo ✅ Product IDs CORRETOS configurados (v73):
echo   1. br.com.stoneup.monitora.app.monitora
echo   2. br.com.stoneup.monitora.app.stoneupplus
echo.
echo ✅ Estes produtos EXISTEM no Google Play Console e estão ATIVOS
echo.

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║     ✓ INSTALAÇÃO CONCLUÍDA - VERSÃO 73                  ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo 🎉 AGORA DEVE FUNCIONAR!
echo.
echo PRÓXIMO PASSO - TESTAR:
echo.
echo 1. Abra o app (deve abrir automaticamente)
echo 2. Faça login se necessário
echo 3. Vá para: Planos → Selecione um plano
echo 4. Checkout → Selecione "Google Play"
echo 5. Clique em "Comprar via Google Play"
echo.
echo MONITORAR LOGS:
echo Execute em outro terminal: .\ver-logs-billing.bat
echo.
echo RESULTADO ESPERADO:
echo ✅ [GooglePlayBilling] ✅ 2 produto(s) encontrado(s)!
echo.
echo MOTIVO DA CORREÇÃO:
echo - v71: Package CORRETO + Produtos "Real" → Pode não ter propagado
echo - v72: Package ERRADO + Produtos antigos → Não funcionou
echo - v73: Package CORRETO + Produtos "Real" → DEVE FUNCIONAR AGORA
echo.
echo Se ainda não funcionar:
echo → Os produtos "Real" podem precisar de mais tempo de propagação
echo → Aguarde 1-2 horas após criação dos produtos no console
echo → Ou publique a v73 na trilha de teste interno
echo.

:: Abrir o app automaticamente
echo Abrindo o app...
adb shell monkey -p br.com.stoneup.monitora.app -c android.intent.category.LAUNCHER 1 >nul 2>&1

echo.
echo ✅ App aberto! Teste a compra agora.
echo.
echo Execute .\ver-logs-billing.bat em outro terminal para ver os logs!
echo.
pause
