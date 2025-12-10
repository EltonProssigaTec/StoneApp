@echo off
chcp 65001 >nul
cls
echo ╔════════════════════════════════════════╗
echo ║   ADB WIRELESS - StoneApp              ║
echo ╔════════════════════════════════════════╗
echo.

echo Este script configura ADB via WiFi (sem cabo USB)
echo.
echo ⚠️  REQUISITOS:
echo    - Android 11+ (API 30+) OU conexão USB temporária
echo    - Celular e PC na mesma rede WiFi
echo.

echo Escolha o método:
echo.
echo [1] Android 11+ (Pareamento por código)
echo [2] Qualquer Android (precisa USB uma vez)
echo [3] Reconectar WiFi (já configurado antes)
echo.
choice /c 123 /n /m "Digite 1, 2 ou 3: "

if errorlevel 3 goto reconnect
if errorlevel 2 goto usb_method
if errorlevel 1 goto pairing_method

:pairing_method
cls
echo ╔════════════════════════════════════════╗
echo ║   MÉTODO 1: Pareamento por Código     ║
echo ╚════════════════════════════════════════╝
echo.
echo 📱 NO CELULAR:
echo.
echo 1. Vá em: Configurações → Opções do desenvolvedor
echo 2. Ative "Depuração sem fio"
echo 3. Toque em "Depuração sem fio"
echo 4. Toque em "Parear dispositivo com código de pareamento"
echo.
echo Você verá algo como:
echo    IP: 192.168.1.100:37829
echo    Código: 123456
echo.
pause

echo.
set /p ip_port="Digite o IP:PORTA (ex: 192.168.1.100:37829): "
echo.
echo Pareando com %ip_port%...
echo (Digite o código quando solicitar)
echo.
adb pair %ip_port%

if %errorlevel% equ 0 (
    echo.
    echo ✅ Pareamento realizado!
    echo.
    echo Agora conectando...

    set /p connect_port="Digite a porta de conexão (geralmente 5 dígitos, ex: 37467): "
    for /f "tokens=1 delims=:" %%a in ("%ip_port%") do set ip=%%a

    adb connect %ip%:%connect_port%

    echo.
    echo Dispositivos conectados:
    adb devices
    echo.
    echo ✅ Pronto! ADB via WiFi configurado!
) else (
    echo.
    echo ❌ Erro no pareamento
    echo Verifique o IP/porta e código
)
goto end

:usb_method
cls
echo ╔════════════════════════════════════════╗
echo ║   MÉTODO 2: Via USB (uma vez)          ║
echo ╚════════════════════════════════════════╝
echo.
echo 📱 PASSOS:
echo.
echo 1. Conecte o celular via USB
echo 2. Aceite a depuração USB
echo 3. Aguarde...
echo.
pause

echo Verificando dispositivo USB...
adb devices | findstr "device" | findstr /v "List" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Nenhum dispositivo USB encontrado!
    echo Execute: test-adb.bat para diagnosticar
    goto end
)

echo ✅ Dispositivo USB encontrado
echo.

echo Habilitando modo WiFi...
adb tcpip 5555

if %errorlevel% equ 0 (
    echo ✅ Modo WiFi habilitado!
    echo.
    echo Agora descubra o IP do celular:
    echo.
    echo MÉTODO 1: Via ADB
    echo.
    for /f "tokens=3" %%a in ('adb shell ip addr show wlan0 ^| findstr "inet "') do (
        echo IP encontrado: %%a
        set phone_ip=%%a
    )

    echo.
    echo MÉTODO 2: No celular
    echo    Configurações → Sobre → Status → Endereço IP
    echo.

    set /p use_ip="Deseja usar este IP? (S/N): "
    if /i "%use_ip%"=="S" (
        echo.
        echo Você pode desconectar o cabo USB agora
        pause

        echo.
        echo Conectando via WiFi...
        adb connect %phone_ip%:5555

        echo.
        echo Dispositivos conectados:
        adb devices
        echo.
        echo ✅ Pronto! ADB via WiFi configurado!
    ) else (
        echo.
        set /p manual_ip="Digite o IP do celular: "
        echo.
        echo Você pode desconectar o cabo USB agora
        pause

        echo.
        echo Conectando via WiFi...
        adb connect %manual_ip%:5555

        echo.
        echo Dispositivos conectados:
        adb devices
        echo.
        echo ✅ Pronto! ADB via WiFi configurado!
    )
) else (
    echo ❌ Erro ao habilitar modo WiFi
)
goto end

:reconnect
cls
echo ╔════════════════════════════════════════╗
echo ║   MÉTODO 3: Reconectar WiFi            ║
echo ╚════════════════════════════════════════╝
echo.

set /p ip="Digite o IP do celular: "
echo.
echo Conectando em %ip%:5555...
adb connect %ip%:5555

echo.
echo Dispositivos conectados:
adb devices
echo.

adb devices | findstr "device" | findstr /v "List" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Conectado!
) else (
    echo ❌ Erro na conexão
    echo.
    echo Verifique:
    echo - IP correto
    echo - Mesma rede WiFi
    echo - Depuração sem fio ativa
)
goto end

:end
echo.
echo ════════════════════════════════════════
echo.
echo 💡 DICAS:
echo.
echo Para instalar APK via WiFi:
echo adb install android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Para ver logs:
echo adb logcat ^| findstr "RevenueCat Planos"
echo.
echo Para desconectar:
echo adb disconnect
echo.
echo ════════════════════════════════════════
echo.
pause
