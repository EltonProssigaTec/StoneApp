@echo off
chcp 65001 >nul
cls
echo ╔════════════════════════════════════════╗
echo ║   DIAGNÓSTICO ADB - StoneApp           ║
echo ╔════════════════════════════════════════╗
echo.

echo [1/6] Verificando instalação do ADB...
where adb >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ADB não encontrado!
    echo.
    echo Soluções:
    echo 1. Instale Android Studio
    echo 2. Ou baixe Platform Tools: https://developer.android.com/studio/releases/platform-tools
    echo 3. Adicione ao PATH do Windows
    echo.
    pause
    exit /b 1
)
echo ✅ ADB instalado
adb version | findstr "version"
echo.

echo [2/6] Reiniciando servidor ADB...
adb kill-server >nul 2>&1
timeout /t 2 /nobreak >nul
adb start-server >nul 2>&1
echo ✅ Servidor ADB reiniciado
echo.

echo [3/6] Procurando dispositivos conectados...
echo.
adb devices -l
echo.

adb devices | findstr "device" | findstr /v "List" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Dispositivo encontrado!
    echo.

    adb devices | findstr "unauthorized" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ⚠️  STATUS: UNAUTHORIZED
        echo.
        echo 📱 AÇÃO NECESSÁRIA NO CELULAR:
        echo 1. Vá em Configurações → Opções do desenvolvedor
        echo 2. Clique em "Revogar autorizações de depuração USB"
        echo 3. Desconecte e reconecte o cabo USB
        echo 4. Aceite o popup de permissão
        echo.
        pause
        exit /b 0
    )

    echo [4/6] Informações do dispositivo:
    adb shell getprop ro.product.model
    adb shell getprop ro.build.version.release
    echo.

    echo [5/6] Testando conexão...
    adb shell echo "Conexao OK" 2>nul
    if %errorlevel% equ 0 (
        echo ✅ Conexão funcionando!
    ) else (
        echo ❌ Erro na conexão
    )
    echo.

    echo [6/6] Pronto para instalar APK!
    echo.
    echo Para instalar o app:
    echo adb install android\app\build\outputs\apk\debug\app-debug.apk
    echo.

) else (
    echo ❌ NENHUM DISPOSITIVO ENCONTRADO
    echo.
    echo ╔════════════════════════════════════════╗
    echo ║   SOLUÇÕES:                            ║
    echo ╠════════════════════════════════════════╣
    echo ║                                        ║
    echo ║ 1. VERIFIQUE O CABO USB                ║
    echo ║    → Use cabo USB que transmita dados  ║
    echo ║    → Teste outro cabo se necessário    ║
    echo ║                                        ║
    echo ║ 2. TROQUE A PORTA USB                  ║
    echo ║    → Use porta USB direta (não hub)    ║
    echo ║    → Teste todas as portas do PC       ║
    echo ║                                        ║
    echo ║ 3. NO CELULAR:                         ║
    echo ║    Configurações → Sobre o telefone    ║
    echo ║    → Toque 7x em "Número da versão"    ║
    echo ║    → Volte → Opções do desenvolvedor   ║
    echo ║    → Ative "Depuração USB"             ║
    echo ║                                        ║
    echo ║ 4. TROQUE MODO USB:                    ║
    echo ║    Notificação USB → Trocar para:      ║
    echo ║    → MTP (Transferência de arquivos)   ║
    echo ║    ou PTP (Transferência de imagens)   ║
    echo ║                                        ║
    echo ║ 5. ALTERNATIVA - ADB WIRELESS:         ║
    echo ║    Execute: adb-wireless.bat           ║
    echo ║                                        ║
    echo ╚════════════════════════════════════════╝
    echo.

    echo 🔍 DIAGNÓSTICO DETALHADO:
    echo.
    echo Sistema Operacional:
    ver
    echo.

    echo Portas USB detectadas:
    wmic path Win32_USBControllerDevice get Dependent | findstr "USB"
    echo.
)

echo.
echo ════════════════════════════════════════
echo Consulte ADB_TROUBLESHOOTING.md para mais detalhes
echo ════════════════════════════════════════
echo.
pause
