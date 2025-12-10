# 🔧 Guia: Resolver Problemas de Conexão ADB

**Problema:** Celular conectado via USB mas não solicita permissão de depuração

---

## 🎯 Soluções Passo a Passo

### **Solução 1: Verificar se ADB Detecta o Dispositivo**

```bash
# Verificar se ADB está instalado
adb version

# Listar dispositivos conectados
adb devices
```

**Resultado esperado:**
```
List of devices attached
XXXXXXXXXX    device
```

**Se aparecer "unauthorized" ou nada:**
```
List of devices attached
XXXXXXXXXX    unauthorized
```
→ Continue para as próximas soluções

---

### **Solução 2: Revogar Autorizações USB**

No celular:

1. Abra **Configurações**
2. Vá para **Opções do desenvolvedor**
3. Role até encontrar **Revogar autorizações de depuração USB**
4. Clique e confirme
5. **Desconecte e reconecte** o cabo USB
6. O popup de permissão deve aparecer

---

### **Solução 3: Reiniciar Servidor ADB**

No PC (terminal/cmd):

```bash
# Matar servidor ADB
adb kill-server

# Esperar 2 segundos

# Iniciar servidor ADB
adb start-server

# Listar dispositivos
adb devices
```

Agora desconecte e reconecte o cabo USB. O popup deve aparecer.

---

### **Solução 4: Verificar Drivers USB (Windows)**

#### Passo 1: Abrir Gerenciador de Dispositivos
```
Win + X → Gerenciador de Dispositivos
```

#### Passo 2: Procurar pelo Celular
Procure em uma destas categorias:
- **Dispositivos Android**
- **Outros dispositivos** (se aparecer com ⚠️)
- **Dispositivos portáteis**

#### Passo 3: Se Aparecer com ⚠️ (Driver Faltando)

**Opção A - Instalar Driver Automático:**
1. Clique com botão direito no dispositivo
2. Clique em **Atualizar driver**
3. Selecione **Pesquisar automaticamente por drivers**

**Opção B - Instalar Driver Manual (Google USB Driver):**
1. Baixe: https://developer.android.com/studio/run/win-usb
2. Extraia o zip
3. No Gerenciador de Dispositivos:
   - Botão direito no dispositivo → Atualizar driver
   - Procurar drivers no meu computador
   - Aponte para a pasta extraída
   - Instalar

#### Passo 4: Reiniciar ADB
```bash
adb kill-server
adb start-server
adb devices
```

---

### **Solução 5: Trocar Modo de Conexão USB**

No celular, quando conectar o USB, você verá uma notificação.

#### Passo 1: Tocar na Notificação USB

Altere o modo para:
- ✅ **MTP (Transferência de arquivos)**
- ✅ **PTP (Transferência de imagens)**
- ✅ **MIDI**

❌ Evite: "Apenas carregamento"

#### Passo 2: Alternativamente

1. Configurações → Conectado como...
2. Ou: Configurações → Sistema → USB do computador
3. Selecione **Transferência de arquivos (MTP)**

---

### **Solução 6: Verificar Cabo USB**

⚠️ **Muitos cabos USB só carregam, não transmitem dados!**

**Como verificar:**
1. Conecte o celular no PC
2. Se o PC **não detectar** nem mostrar "Novo dispositivo USB"
3. **O cabo é apenas de carregamento**

**Solução:** Use outro cabo USB (preferencialmente o original)

---

### **Solução 7: Tentar Outra Porta USB**

- ❌ Evite: Hubs USB / Extensores USB
- ✅ Use: Porta USB direta no PC (preferencialmente USB 2.0)
- ✅ Experimente: Todas as portas USB do PC

---

### **Solução 8: Verificar Opções do Desenvolvedor**

No celular:

1. Configurações → Sobre o telefone
2. Toque 7x em **Número da versão** (para habilitar)
3. Volte → Opções do desenvolvedor
4. Certifique-se:
   - ✅ **Depuração USB** está ATIVA
   - ✅ **Instalar via USB** está ATIVA (se disponível)
   - ✅ **Verificação de app via USB** está DESATIVA

---

### **Solução 9: Método Alternativo - Wireless ADB**

Se USB não funcionar de jeito nenhum, use ADB via WiFi:

#### Passo 1: Conectar uma Vez via USB (ou use outro PC)
```bash
# No PC
adb tcpip 5555
```

#### Passo 2: Desconectar USB e Conectar via WiFi
```bash
# Descubra o IP do celular
# Configurações → Sobre → Status → Endereço IP
# Exemplo: 192.168.1.100

# Conectar via WiFi
adb connect 192.168.1.100:5555

# Verificar
adb devices
```

Agora você pode usar ADB sem cabo! 🎉

---

### **Solução 10: Reinstalar Android Studio / Platform Tools**

Se nada funcionar:

#### Opção A - Via Android Studio
1. Abra Android Studio
2. Vá para: File → Settings → Appearance & Behavior → System Settings → Android SDK
3. Aba **SDK Tools**
4. Marque ✅ **Google USB Driver**
5. Click **Apply** → **OK**

#### Opção B - Platform Tools Standalone
```bash
# Baixe: https://developer.android.com/studio/releases/platform-tools
# Extraia em: C:\platform-tools
# Adicione ao PATH do Windows
```

---

## 🧪 Script de Diagnóstico

Crie um arquivo `test-adb.bat`:

```batch
@echo off
echo ====================================
echo   Diagnostico ADB
echo ====================================
echo.

echo [1] Versao do ADB:
adb version
echo.

echo [2] Reiniciando servidor...
adb kill-server
timeout /t 2 /nobreak >nul
adb start-server
echo.

echo [3] Dispositivos conectados:
adb devices -l
echo.

echo [4] Se aparecer "unauthorized", va ao celular e:
echo    - Configuracoes ^> Opcoes do desenvolvedor
echo    - Revogar autorizacoes de depuracao USB
echo    - Desconecte e reconecte o cabo
echo.

echo [5] Se nao aparecer nada:
echo    - Verifique o cabo USB
echo    - Troque a porta USB
echo    - Troque o modo USB (MTP)
echo.

pause
```

Rode:
```bash
test-adb.bat
```

---

## 📱 Testado com Sucesso?

Depois que `adb devices` mostrar:
```
List of devices attached
XXXXXXXXXX    device
```

Você pode:

```bash
# Instalar APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Ver logs
adb logcat | findstr "RevenueCat Planos"

# Ou usar expo
npx expo run:android
```

---

## ⚡ Método RÁPIDO (Se tiver pressa)

**Opção 1: Wireless ADB (Mais Fácil)**

Se seu Android é 11+ (API 30+):

1. Celular e PC na mesma rede WiFi
2. No celular:
   - Configurações → Opções do desenvolvedor
   - **Depuração sem fio** → ATIVAR
   - Toque em "Depuração sem fio"
   - Toque em "Parear dispositivo com código de pareamento"
   - Anote: IP:Porta e Código

3. No PC:
```bash
# Parear (só precisa uma vez)
adb pair 192.168.1.100:37829
# Digite o código de pareamento quando solicitar

# Conectar
adb connect 192.168.1.100:37829

# Verificar
adb devices
```

Pronto! Agora funciona sem cabo! 🎉

---

**Opção 2: Enviar APK via WhatsApp/Email**

Mais simples:

1. Gere o APK:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

2. Encontre o APK:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

3. Envie para o celular (WhatsApp/Email/Google Drive)

4. Instale manualmente no celular

**Desvantagem:** Sem logs em tempo real

---

## 📊 Checklist de Diagnóstico

- [ ] `adb version` funciona?
- [ ] Celular aparece em `adb devices`?
- [ ] Depuração USB ativa no celular?
- [ ] Autorizações USB revogadas e reconectado?
- [ ] Cabo USB transmite dados (não só carrega)?
- [ ] Porta USB direta (não hub)?
- [ ] Modo USB é MTP/PTP (não "só carregamento")?
- [ ] Driver USB instalado (Windows)?
- [ ] Servidor ADB reiniciado?
- [ ] Testou em outra porta USB?
- [ ] Testou outro cabo USB?

---

## 🆘 Ainda Não Funciona?

### Última Tentativa - ADB Wireless (Android 11+)

```bash
# 1. Habilite "Depuração sem fio" no celular
# 2. Anote o IP (ex: 192.168.1.100)
# 3. Conecte:
adb connect 192.168.1.100:5555

# Deve funcionar!
```

### Ou Use o Método Manual:

1. Gere APK
2. Envie para celular via WhatsApp/Email
3. Instale manualmente
4. Para ver logs, use app de logs do Android

---

**Boa sorte!** 🚀

Se precisar de ajuda específica, me diga:
- Marca/modelo do celular
- Versão do Android
- O que aparece em `adb devices`
