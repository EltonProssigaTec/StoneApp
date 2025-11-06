# Configuração Funcional do Gradle Build - StoneUP

Este documento descreve a configuração completa e funcional do build do Gradle para o projeto StoneUP. Use este documento como referência caso algum erro ocorra no futuro.

**Data de criação:** 2025-11-06
**Versão do App:** 3.1.0 (versionCode 62)
**Gradle Version:** 8.14.3

---

## 1. Estrutura de Arquivos Gradle

```
android/
├── build.gradle (root)
├── app/
│   └── build.gradle (app module)
├── gradle.properties
├── settings.gradle
└── gradle/
    └── wrapper/
        └── gradle-wrapper.properties
```

---

## 2. gradle-wrapper.properties

**Localização:** `android/gradle/wrapper/gradle-wrapper.properties`

```properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.14.3-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```

**Nota:** Versão do Gradle **8.14.3** - não alterar sem necessidade.

---

## 3. gradle.properties

**Localização:** `android/gradle.properties`

```properties
# Project-wide Gradle settings.

# Specifies the JVM arguments used for the daemon process.
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m

# When configured, Gradle will run in incubating parallel mode.
org.gradle.parallel=true

# AndroidX package structure
android.useAndroidX=true

# Enable AAPT2 PNG crunching
android.enablePngCrunchInReleaseBuilds=true

# Architecture support
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64

# New Architecture Support
newArchEnabled=true

# Hermes JS engine
hermesEnabled=true

# Edge-to-edge display support
edgeToEdgeEnabled=false

# Expo configurations
expo.gif.enabled=true
expo.webp.enabled=true
expo.webp.animated=false

# Network inspector
EX_DEV_CLIENT_NETWORK_INSPECTOR=true

# Legacy packaging
expo.useLegacyPackaging=false

# Edge-to-edge (deprecated)
expo.edgeToEdgeEnabled=false
```

**Configurações importantes:**
- **newArchEnabled=true** - Nova arquitetura do React Native habilitada
- **hermesEnabled=true** - Motor Hermes habilitado
- **reactNativeArchitectures** - Suporte para múltiplas arquiteturas (ARM e x86)

---

## 4. settings.gradle (Root)

**Localização:** `android/settings.gradle`

```gradle
pluginManagement {
  def reactNativeGradlePlugin = new File(
    providers.exec {
      workingDir(rootDir)
      commandLine("node", "--print", "require.resolve('@react-native/gradle-plugin/package.json', { paths: [require.resolve('react-native/package.json')] })")
    }.standardOutput.asText.get().trim()
  ).getParentFile().absolutePath
  includeBuild(reactNativeGradlePlugin)

  def expoPluginsPath = new File(
    providers.exec {
      workingDir(rootDir)
      commandLine("node", "--print", "require.resolve('expo-modules-autolinking/package.json', { paths: [require.resolve('expo/package.json')] })")
    }.standardOutput.asText.get().trim(),
    "../android/expo-gradle-plugin"
  ).absolutePath
  includeBuild(expoPluginsPath)
}

plugins {
  id("com.facebook.react.settings")
  id("expo-autolinking-settings")
}

extensions.configure(com.facebook.react.ReactSettingsExtension) { ex ->
  if (System.getenv('EXPO_USE_COMMUNITY_AUTOLINKING') == '1') {
    ex.autolinkLibrariesFromCommand()
  } else {
    ex.autolinkLibrariesFromCommand(expoAutolinking.rnConfigCommand)
  }
}
expoAutolinking.useExpoModules()

rootProject.name = 'StoneUP'

expoAutolinking.useExpoVersionCatalog()

include ':app'
includeBuild(expoAutolinking.reactNativeGradlePlugin)
```

**Nota:** Esta configuração utiliza o autolinking do Expo e do React Native.

---

## 5. build.gradle (Root)

**Localização:** `android/build.gradle`

```gradle
// Top-level build file where you can add configuration options common to all sub-projects/modules.

buildscript {
  repositories {
    google()
    mavenCentral()
  }
  dependencies {
    classpath('com.android.tools.build:gradle')
    classpath('com.facebook.react:react-native-gradle-plugin')
    classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')
  }
}

allprojects {
  repositories {
    google()
    mavenCentral()
    maven { url 'https://www.jitpack.io' }
  }
}

apply plugin: "expo-root-project"
apply plugin: "com.facebook.react.rootproject"
```

**Repositórios configurados:**
- Google Maven
- Maven Central
- JitPack (para dependências adicionais)

---

## 6. build.gradle (App Module)

**Localização:** `android/app/build.gradle`

### 6.1 Plugins e Configurações Iniciais

```gradle
apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"

def projectRoot = rootDir.getAbsoluteFile().getParentFile().getAbsolutePath()
```

### 6.2 Bloco React

```gradle
react {
    entryFile = file(["node", "-e", "require('expo/scripts/resolveAppEntry')", projectRoot, "android", "absolute"].execute(null, rootDir).text.trim())
    reactNativeDir = new File(["node", "--print", "require.resolve('react-native/package.json')"].execute(null, rootDir).text.trim()).getParentFile().getAbsoluteFile()
    hermesCommand = new File(["node", "--print", "require.resolve('react-native/package.json')"].execute(null, rootDir).text.trim()).getParentFile().getAbsolutePath() + "/sdks/hermesc/%OS-BIN%/hermesc"
    codegenDir = new File(["node", "--print", "require.resolve('@react-native/codegen/package.json', { paths: [require.resolve('react-native/package.json')] })"].execute(null, rootDir).text.trim()).getParentFile().getAbsoluteFile()

    enableBundleCompression = (findProperty('android.enableBundleCompression') ?: false).toBoolean()
    // Use Expo CLI to bundle the app
    cliFile = new File(["node", "--print", "require.resolve('@expo/cli', { paths: [require.resolve('expo/package.json')] })"].execute(null, rootDir).text.trim())
    bundleCommand = "export:embed"

    /* Autolinking */
    autolinkLibrariesWithApp()
}
```

### 6.3 Configurações de Minificação

```gradle
def enableMinifyInReleaseBuilds = (findProperty('android.enableMinifyInReleaseBuilds') ?: false).toBoolean()

def jscFlavor = 'io.github.react-native-community:jsc-android:2026004.+'
```

### 6.4 Bloco Android

```gradle
android {
    ndkVersion rootProject.ext.ndkVersion

    buildToolsVersion rootProject.ext.buildToolsVersion
    compileSdk rootProject.ext.compileSdkVersion

    namespace 'br.com.stoneup.monitora.app'
    defaultConfig {
        applicationId 'br.com.stoneup.monitora.app'
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 62
        versionName "3.1.0"

        buildConfigField "String", "REACT_NATIVE_RELEASE_LEVEL", "\"${findProperty('reactNativeReleaseLevel') ?: 'stable'}\""
    }
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            storeFile file('monitora-upload.keystore')
            storePassword 'monitora@eever'
            keyAlias 'monitora-upload'
            keyPassword 'monitora@eever'
        }
    }
    buildTypes {
        release {
            // ✅ CORREÇÃO: Use release
            signingConfig signingConfigs.release
            def enableShrinkResources = findProperty('android.enableShrinkResourcesInReleaseBuilds') ?: 'false'
            shrinkResources enableShrinkResources.toBoolean()
            minifyEnabled enableMinifyInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
            def enablePngCrunchInRelease = findProperty('android.enablePngCrunchInReleaseBuilds') ?: 'true'
            crunchPngs enablePngCrunchInRelease.toBoolean()
        }
    }
    packagingOptions {
        jniLibs {
            def enableLegacyPackaging = findProperty('expo.useLegacyPackaging') ?: 'false'
            useLegacyPackaging enableLegacyPackaging.toBoolean()
        }
    }
    androidResources {
        ignoreAssetsPattern '!.svn:!.git:!.ds_store:!*.scc:!CVS:!thumbs.db:!picasa.ini:!*~'
    }
}
```

**Configurações críticas:**
- **applicationId:** `br.com.stoneup.monitora.app`
- **versionCode:** 62 (incrementar a cada release)
- **versionName:** "3.1.0"
- **signingConfig para release:** DEVE usar `signingConfigs.release` (não debug!)
- **Keystore:** `monitora-upload.keystore` com credenciais específicas

### 6.5 Packaging Options

```gradle
// Apply static values from `gradle.properties` to the `android.packagingOptions`
["pickFirsts", "excludes", "merges", "doNotStrip"].each { prop ->
    def options = (findProperty("android.packagingOptions.$prop") ?: "").split(",");
    for (i in 0..<options.size()) options[i] = options[i].trim();
    options -= ""

    if (options.length > 0) {
        println "android.packagingOptions.$prop += $options ($options.length)"
        options.each {
            android.packagingOptions[prop] += it
        }
    }
}
```

### 6.6 Dependências

```gradle
dependencies {
    // The version of react-native is set by the React Native Gradle Plugin
    implementation("com.facebook.react:react-android")

    def isGifEnabled = (findProperty('expo.gif.enabled') ?: "") == "true";
    def isWebpEnabled = (findProperty('expo.webp.enabled') ?: "") == "true";
    def isWebpAnimatedEnabled = (findProperty('expo.webp.animated') ?: "") == "true";

    if (isGifEnabled) {
        // For animated gif support
        implementation("com.facebook.fresco:animated-gif:${expoLibs.versions.fresco.get()}")
    }

    if (isWebpEnabled) {
        // For webp support
        implementation("com.facebook.fresco:webpsupport:${expoLibs.versions.fresco.get()}")
        if (isWebpAnimatedEnabled) {
            // Animated webp support
            implementation("com.facebook.fresco:animated-webp:${expoLibs.versions.fresco.get()}")
        }
    }

    if (hermesEnabled.toBoolean()) {
        implementation("com.facebook.react:hermes-android")
    } else {
        implementation jscFlavor
    }
}
```

---

## 7. Arquivos de Assinatura (Keystore)

**Localização:** `android/app/`

### Debug Keystore
- **Arquivo:** `debug.keystore`
- **Senha:** `android`
- **Alias:** `androiddebugkey`

### Release Keystore
- **Arquivo:** `monitora-upload.keystore`
- **Senha:** `monitora@eever`
- **Alias:** `monitora-upload`

**IMPORTANTE:** Manter o arquivo `monitora-upload.keystore` em segurança e backup.

---

## 8. Comandos de Build Funcionais

### Build de Debug
```bash
cd android
./gradlew assembleDebug
```

### Build de Release
```bash
cd android
./gradlew assembleRelease
```

### Limpar build
```bash
cd android
./gradlew clean
```

### Verificar assinatura
```bash
cd android
./gradlew signingReport
```

---

## 9. Checklist de Troubleshooting

Se houver erros no build, verificar na ordem:

1. **Versão do Gradle**
   - Verificar se está usando Gradle 8.14.3
   - Arquivo: `android/gradle/wrapper/gradle-wrapper.properties`

2. **Signing Config**
   - Confirmar que release usa `signingConfigs.release`
   - Arquivo: `android/app/build.gradle` linha 117

3. **Keystore presente**
   - Verificar se `monitora-upload.keystore` existe em `android/app/`

4. **Java Version**
   - Verificar compatibilidade com Gradle 8.14.3
   - Geralmente requer Java 17 ou superior

5. **Node Modules**
   - Executar `npm install` ou `yarn install`
   - Limpar cache: `npm start -- --reset-cache`

6. **Cache do Gradle**
   ```bash
   cd android
   ./gradlew clean
   ./gradlew cleanBuildCache
   ```

7. **Versões no app.json**
   - Verificar se `versionCode` e `versionName` estão sincronizados

---

## 10. Informações Adicionais

### Tecnologias Utilizadas
- **React Native** (versão gerenciada pelo Expo)
- **Expo SDK** (com new architecture)
- **Hermes Engine** (habilitado)
- **Kotlin** (suporte para plugins Android)

### Google Services
- Arquivo de configuração: `google-services.json` (na raiz do projeto)
- Referenciado em `app.json` linha 29-30

### Build Variants
- **debug**: Usa debug keystore, sem minificação
- **release**: Usa release keystore, com otimizações habilitadas

---

## 11. Histórico de Alterações

**2025-11-06**
- Documentação inicial criada
- Configuração testada e funcional
- versionCode: 62, versionName: 3.1.0

---

**Documento criado para servir como referência em caso de problemas futuros com o build do Gradle.**
