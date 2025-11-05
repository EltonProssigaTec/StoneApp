# Build iOS - StoneUP App

Guia completo para configurar e fazer build do aplicativo StoneUP para iOS.

## Pré-requisitos

### 1. Hardware e Sistema Operacional
- **macOS** (obrigatório para builds nativos iOS)
- **Xcode** instalado (versão 15 ou superior)
- **Command Line Tools** do Xcode instalados

### 2. Ferramentas de Desenvolvimento
```bash
# Instalar Homebrew (se não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Node.js (se não tiver)
brew install node

# Instalar CocoaPods
sudo gem install cocoapods

# Instalar Expo CLI globalmente
npm install -g expo-cli

# Instalar EAS CLI globalmente
npm install -g eas-cli
```

### 3. Conta Apple Developer
- **Apple Developer Account** (necessário para builds de produção)
- **App Store Connect** configurado
- **Certificados e perfis de provisionamento** (gerenciados pelo EAS ou manualmente)

## Configuração Inicial

### 1. Configurar credenciais EAS
```bash
# Login no EAS
eas login

# Configurar projeto (se ainda não configurado)
eas build:configure
```

### 2. Gerar arquivos nativos iOS (primeira vez)
```bash
# Gerar pasta ios/ com arquivos nativos
yarn prebuild:ios

# Ou gerar para ambas as plataformas
yarn prebuild
```

### 3. Instalar dependências CocoaPods
```bash
# Instalar pods do iOS
yarn ios:pods

# Ou manualmente
cd ios && pod install && cd ..
```

## Scripts Disponíveis

### Desenvolvimento Local

#### Executar no simulador iOS
```bash
yarn ios
```

#### Limpar build cache
```bash
yarn ios:clean
```

#### Reinstalar CocoaPods
```bash
yarn ios:pods
```

#### Abrir projeto no Xcode
```bash
yarn open-ios-workspace
```

### Builds com EAS (Recomendado)

#### Build para Simulador (desenvolvimento)
```bash
# Build local para teste no simulador
yarn build-ios:simulator
```

#### Build Preview (TestFlight interno)
```bash
# Build para distribuição interna/TestFlight
yarn build-ios:preview
```

#### Build de Produção (App Store)
```bash
# Build completo de produção
yarn build-ios:production

# Ou usando o atalho que inclui prebuild e pods
yarn release-ios
```

## Configurações do Projeto

### app.json
- **bundleIdentifier**: `br.com.stoneup.monitora.app`
- **buildNumber**: `3.0.0`
- **Permissões**:
  - Câmera (`NSCameraUsageDescription`)
  - Galeria de Fotos (`NSPhotoLibraryUsageDescription`)
  - Salvar Fotos (`NSPhotoLibraryAddUsageDescription`)

### eas.json
Três perfis de build configurados:

#### 1. Development
- Build local para simulador
- Ideal para desenvolvimento e testes rápidos
```bash
yarn build-ios:simulator
```

#### 2. Preview
- Build para dispositivos reais
- Distribuição interna via TestFlight
- Não requer aprovação da Apple Store
```bash
yarn build-ios:preview
```

#### 3. Production
- Build para App Store
- Auto-incrementa versão
- Usa credenciais locais
```bash
yarn build-ios:production
```

## Fluxo de Build Completo

### Para TestFlight (Preview)
```bash
# 1. Gerar arquivos nativos iOS
yarn prebuild:ios

# 2. Instalar dependências CocoaPods
yarn ios:pods

# 3. Fazer build preview
yarn build-ios:preview

# 4. Aguardar build no EAS
# O EAS enviará notificação quando concluído

# 5. Baixar e instalar via TestFlight
```

### Para App Store (Produção)
```bash
# Usar o comando completo
yarn release-ios

# Ou manualmente:
# 1. Prebuild
yarn prebuild:ios

# 2. Pods
yarn ios:pods

# 3. Build
yarn build-ios:production

# 4. Aguardar conclusão no EAS

# 5. Submeter para App Store
eas submit --platform ios
```

## Credenciais iOS

### Opção 1: Credenciais gerenciadas pelo EAS (Recomendado)
O EAS gerencia automaticamente certificados e perfis de provisionamento.

```bash
# Configurar credenciais
eas credentials

# EAS criará automaticamente:
# - Apple Distribution Certificate
# - Provisioning Profile
```

### Opção 2: Credenciais locais
Se você já tem certificados:

1. Coloque os certificados em uma pasta local
2. Configure no `eas.json`:
```json
{
  "build": {
    "production": {
      "ios": {
        "credentialsSource": "local"
      }
    }
  }
}
```

## Troubleshooting

### Erro: "No bundle identifier found"
```bash
# Verificar se bundleIdentifier está configurado no app.json
# Deve estar: "bundleIdentifier": "br.com.stoneup.monitora.app"
```

### Erro: "Pod install failed"
```bash
# Limpar cache e reinstalar
cd ios
pod cache clean --all
pod deintegrate
pod install
cd ..
```

### Erro: "Xcode build failed"
```bash
# Limpar build do Xcode
yarn ios:clean

# Ou manualmente
cd ios
xcodebuild clean
rm -rf ~/Library/Developer/Xcode/DerivedData
cd ..
```

### Erro: "No certificates found"
```bash
# Configurar credenciais no EAS
eas credentials

# Ou criar manualmente no Apple Developer Portal
```

## Recursos Úteis

- [Documentação Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Apple Developer Portal](https://developer.apple.com)
- [TestFlight](https://developer.apple.com/testflight/)

## Checklist de Publicação

Antes de fazer build de produção:

- [ ] Versão atualizada no `app.json`
- [ ] BuildNumber atualizado
- [ ] Ícone do app configurado
- [ ] Splash screen configurado
- [ ] Permissões (NSUsageDescription) configuradas
- [ ] Testado em simulador
- [ ] Testado em dispositivo real via TestFlight
- [ ] Screenshots preparados para App Store
- [ ] Descrição da app atualizada no App Store Connect
- [ ] Política de privacidade publicada
- [ ] Termos de uso publicados

## Comandos Rápidos

```bash
# Desenvolvimento no simulador
yarn ios

# Build local para simulator
yarn build-ios:simulator

# Build para TestFlight
yarn build-ios:preview

# Build para App Store (completo)
yarn release-ios

# Abrir no Xcode
yarn open-ios-workspace

# Limpar tudo e recompilar
yarn ios:clean && yarn prebuild:ios && yarn ios:pods && yarn ios
```

---

**Última atualização**: 2025-11-05
**Versão**: 3.0.0
