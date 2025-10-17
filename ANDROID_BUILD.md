# Configuração de Build Android - StoneApp

## Informações do Projeto

- **Package Name**: `br.com.stoneup.stoneapp`
- **Keystore**: `android/app/monitora-upload.keystore`
- **Key Alias**: `monitora-upload`

## Scripts Disponíveis

```bash
# Build APK de release
npm run android:release

# Build AAB (Android App Bundle) para Play Store
npm run android:bundle

# Limpar build cache
npm run android:clean
```

## Como Obter o SHA1 do Keystore

### Usando keytool (Java JDK)

```bash
# No diretório do projeto
cd android/app

# Para keystore de release
keytool -list -v -keystore monitora-upload.keystore -alias monitora-upload -storepass monitora@eever -keypass monitora@eever

# Para keystore de debug
keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Usando Gradle

```bash
# No diretório android
cd android

# Obter SHA1 para debug e release
./gradlew signingReport
```

O comando `signingReport` mostrará:
- **SHA1** (necessário para Firebase/Google Sign-In)
- **SHA256**
- **MD5**

Para ambas as variantes (debug e release).

## Registrar SHA1 no Firebase Console

1. Acesse o [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto
3. Vá em **Project Settings** (ícone de engrenagem)
4. Na aba **General**, role até **Your apps**
5. Selecione o app Android (`br.com.stoneup.stoneapp`)
6. Role até **SHA certificate fingerprints**
7. Clique em **Add fingerprint**
8. Cole o SHA1 obtido e salve
9. Baixe o novo arquivo `google-services.json` se necessário

## Registrar SHA1 no Google Cloud Console (OAuth)

1. Acesse o [Google Cloud Console](https://console.cloud.google.com)
2. Selecione seu projeto
3. Vá em **APIs & Services** > **Credentials**
4. Localize o OAuth 2.0 Client ID para Android
5. Adicione o SHA1 fingerprint
6. Salve as alterações

## Notas Importantes

- **Debug SHA1**: Use para desenvolvimento e testes locais
- **Release SHA1**: Use para builds de produção (APK/AAB assinados)
- Após adicionar novos SHA1, pode levar alguns minutos para propagar
- Se o Google Sign-In não funcionar, verifique:
  - SHA1 correto no Firebase
  - SHA1 correto no Google Cloud Console
  - `google-services.json` atualizado no projeto
  - Package name correto em todos os lugares

## Estrutura de Arquivos

```
android/
├── app/
│   ├── debug.keystore (gerado automaticamente)
│   ├── monitora-upload.keystore (keystore de release)
│   └── build.gradle (configurações de build e signing)
├── gradle.properties (senhas e caminhos do keystore)
└── gradlew (wrapper do gradle)
```

## Troubleshooting

### Erro: keystore not found
Verifique se o caminho em `gradle.properties` está correto:
```properties
MONITORA_UPLOAD_STORE_FILE=app/monitora-upload.keystore
```

### Erro: Google Sign-In DEVELOPER_ERROR
- Verifique se o SHA1 está registrado no Firebase e Google Cloud Console
- Confirme que o package name está correto: `br.com.stoneup.stoneapp`
- Certifique-se de estar usando o SHA1 correto (debug vs release)

### Build falha ao assinar
- Verifique se as senhas em `gradle.properties` estão corretas
- Confirme que o arquivo keystore existe em `android/app/`
