# 📱 StoneApp - StoneUP Monitora

<div align="center">
  <p>Aplicativo mobile para gestão de dívidas e acordos financeiros</p>
  <p>Desenvolvido com React Native, Expo e TypeScript</p>
</div>

---

## 📋 Sobre o Projeto

O **StoneApp** (StoneUP Monitora) é uma solução mobile completa para ajudar usuários a:
- 💰 Monitorar e gerenciar suas dívidas
- 🤝 Fazer acordos de pagamento
- 📊 Acompanhar sua saúde financeira
- 💳 Consultar informações de CPF/CNPJ
- 🔔 Receber notificações de vencimentos

**Versão Atual:** 3.1.0 (versionCode: 62)

## 🚀 Tecnologias

- **React Native** 0.81.4
- **Expo SDK** 54
- **TypeScript** 5.9.2
- **Expo Router** - Navegação baseada em arquivos
- **React Native Gesture Handler** - Gestos e animações
- **React Native Reanimated** - Animações performáticas
- **Axios** - Cliente HTTP
- **AsyncStorage** - Armazenamento local persistente
- **Expo Linear Gradient** - Gradientes nativos
- **React Native SVG** - Ícones e gráficos vetoriais
- **Gradle** 8.14.3 - Build Android
- **New Architecture** - Habilitado (Fabric + Hermes)

## ✨ Funcionalidades

### 🔐 Autenticação
- ✅ Login com email/senha
- ✅ Cadastro de novos usuários com validação de CPF/CNPJ
- ✅ Recuperação de senha com verificação por código
- ✅ Manter logado (sessão persistente)
- ✅ Verificação de código de segurança

### 💼 Gestão Financeira
- ✅ Dashboard com resumo financeiro
- ✅ Visualização de dívidas e pendências detalhadas
- ✅ Ofertas de acordos personalizados
- ✅ Geração e simulação de planos de pagamento
- ✅ Consulta de CPF/CNPJ com score e situação
- ✅ Acompanhamento de saúde financeira

### 🔔 Notificações e Suporte
- ✅ Notificações de vencimentos
- ✅ Chat de suporte com IA (ChatBot)
- ✅ Configurações de notificações (Push, SMS, Email)

### 🎨 Interface
- ✅ Menu lateral animado com gestos
- ✅ Tema customizado com gradientes
- ✅ Componentes reutilizáveis e tipados
- ✅ Animações fluídas com Reanimated
- ✅ Splash screen animada
- ✅ Design responsivo

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** ou **yarn**
- **Git** ([Download](https://git-scm.com/))
- **Java JDK** 17+ (para build Android)
- **Expo Go** no celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))
- **Android Studio** (para emulador Android) ou **Xcode** (para emulador iOS)
- **EAS CLI** (para builds de produção): `npm install -g eas-cli`

## ⚙️ Instalação

### 1️⃣ Clone o repositório
```bash
git clone https://github.com/seu-usuario/StoneApp.git
cd StoneApp
```

### 2️⃣ Instale as dependências
```bash
npm install
```

### 3️⃣ Configure as variáveis de ambiente
O app já está configurado para usar a API de produção da StoneUP:
```typescript
// services/api.config.ts
const BASE_URL = 'https://api.stoneup.com.br/';
```

## 🏃 Executando o Projeto

### Modo de desenvolvimento
```bash
npm start
```
ou
```bash
npx expo start
```

Isso abrirá o Expo Developer Tools. Você pode:
- Pressionar `a` para abrir no emulador Android
- Pressionar `i` para abrir no emulador iOS
- Escanear o QR Code com o app Expo Go no seu celular

### Limpar cache e reiniciar
```bash
npx expo start --clear
```

### Executar em plataforma específica
```bash
# Android (emulador ou dispositivo conectado)
npm run android

# iOS (apenas macOS)
npm run ios

# Web (desenvolvimento)
npm run web
```

## 📦 Build de Produção

### Build com EAS (Recomendado)

#### 1. Instalar EAS CLI
```bash
npm install -g eas-cli
```

#### 2. Login no Expo
```bash
eas login
```

#### 3. Configurar projeto (primeira vez)
```bash
eas build:configure
```

#### 4. Build APK para Android (testes)
```bash
eas build -p android -e preview
```

#### 5. Build AAB para Android (produção - Google Play)
```bash
eas build -p android -e production
```

#### 6. Build para iOS (produção - App Store)
```bash
eas build -p ios -e production
```

### Build Local (Gradle)

Para builds locais, consulte a documentação detalhada em [GRADLE_BUILD_CONFIG.md](GRADLE_BUILD_CONFIG.md).

```bash
# Gerar template nativo
npx expo prebuild

# Build Android local (Release)
cd android
./gradlew assembleRelease

# APK estará em: android/app/build/outputs/apk/release/
```

## 🔑 Configurações Importantes

### app.json
Certifique-se de configurar:
```json
{
  "expo": {
    "name": "StoneUP",
    "slug": "StoneApp",
    "version": "3.1.0",
    "android": {
      "versionCode": 62,
      "package": "br.com.stoneup.monitora.app"
    },
    "ios": {
      "bundleIdentifier": "br.com.stoneup.monitora.app",
      "buildNumber": "3.1.0"
    }
  }
}
```

### eas.json
Perfis de build já configurados:
- **preview**: Gera APK para testes internos
- **production**: Gera AAB/IPA para stores

## 📂 Estrutura do Projeto

```
StoneApp/
├── app/                      # Screens (Expo Router)
│   ├── (tabs)/              # Telas com tab navigation
│   │   ├── home.tsx
│   │   ├── dividas.tsx
│   │   ├── saude-financeira.tsx
│   │   └── notificacoes.tsx
│   ├── login.tsx
│   ├── register.tsx
│   ├── recover.tsx
│   └── _layout.tsx
├── components/              # Componentes reutilizáveis
│   ├── ui/                 # Componentes de interface
│   ├── cards/              # Cards específicos
│   └── layouts/            # Layouts e containers
├── constants/              # Constantes e temas
│   ├── theme.ts           # Cores, fontes, gradientes
│   └── global-styles.ts   # Estilos globais
├── contexts/               # Context API
│   └── AuthContext.tsx    # Autenticação
├── services/               # Serviços de API
│   ├── api.config.ts      # Configuração Axios
│   ├── auth.service.ts    # Autenticação
│   └── dividas.service.ts # Dívidas
├── utils/                  # Utilitários
│   └── masks.ts           # Máscaras de input
├── assets/                # Imagens e recursos
├── android/               # Projeto Android nativo
└── GRADLE_BUILD_CONFIG.md # Documentação do build Gradle
```

## 🎨 Componentes de UI

### Componentes Principais
- **Button** - Botão padrão com variantes
- **GradientButton** - Botão com gradiente
- **Input/FloatingInput** - Campos de entrada com label flutuante
- **Card** - Container com sombra
- **ScreenHeader** - Cabeçalho de tela
- **SideMenu** - Menu lateral animado
- **WaveDecoration** - Decoração de ondas

### Layout Components
- **ScreenLayout** - Layout padrão de telas
- **AuthLayout** - Layout para autenticação
- **SafeContainer** - Container com SafeArea
- **ResponsiveContainer** - Container responsivo

### Tema
- **Cores** - Paleta de cores do app
- **Fontes** - Montserrat (Regular, Medium, SemiBold, Bold)
- **Gradientes** - Gradientes pré-configurados
- **Espaçamentos** - Sistema de espaçamento consistente

## 🌐 API Integration

O app se comunica com a API StoneUP através de serviços configurados com Axios:

```typescript
// Exemplo de uso
import { AuthService } from '@/services';

const login = await AuthService.login(email, password);
```

### Endpoints Principais
- `POST /login_monitora` - Login
- `POST /pre_register` - Pré-cadastro
- `POST /recover` - Recuperação de senha
- `GET /dividas` - Listar dívidas
- `GET /ofertas` - Listar ofertas

### Base URL
```
https://api.stoneup.com.br/
```

## 🎨 Máscaras de Input

```typescript
import { cpfMask, cnpjMask, phoneMask, dateMask, moneyMask } from '@/utils/masks';

cpfMask('12345678900');        // 123.456.789-00
cnpjMask('12345678000190');    // 12.345.678/0001-90
phoneMask('11987654321');      // (11) 98765-4321
dateMask('01012024');          // 01/01/2024
moneyMask('1000');             // R$ 1.000,00
```

## 🐛 Debug e Logs

O app utiliza logs condicionais para desenvolvimento:

```typescript
if (__DEV__) {
  console.log('Debug info'); // Apenas em desenvolvimento
}
```

Todos os `console.log` em produção foram removidos para melhor performance.

## 🔧 Troubleshooting

### Erro de cache
```bash
npx expo start --clear
```

### Erro de dependências
```bash
rm -rf node_modules
npm install
```

### Erro no build Android
Consulte o documento [GRADLE_BUILD_CONFIG.md](GRADLE_BUILD_CONFIG.md) para configuração detalhada.

```bash
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
```

### Problemas conhecidos resolvidos
- ✅ Crash no login (APK): Console.log removidos em produção
- ✅ AsyncStorage: Uso otimizado
- ✅ Signing config: Configuração corrigida para release

## 📱 Funcionalidades de Navegação

### Proteção de Navegação
- ❌ **Splash Screen**: Não permite voltar (previne UX ruim)
- ✅ **Login**: Navegação livre
- ✅ **Home**: Navegação livre entre tabs
- ✅ **Outras telas**: Navegação padrão

### Back Button (Android)
O app respeita o botão voltar do Android em todas as telas, exceto splash.

## 🚀 Deploy

### Publicar update OTA (sem rebuild)
```bash
eas update --branch production
```

### Submeter para Google Play
```bash
eas submit -p android
```

### Submeter para App Store
```bash
eas submit -p ios
```

## 📋 Documentação Adicional

- [GRADLE_BUILD_CONFIG.md](GRADLE_BUILD_CONFIG.md) - Configuração detalhada do build Gradle
- [CHANGELOG.md](CHANGELOG.md) - Histórico de versões
- [CONTRIBUTING.md](CONTRIBUTING.md) - Guia de contribuição

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

### Padrões de Commit
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, ponto e vírgula, etc
- `refactor`: Refatoração de código
- `test`: Testes
- `chore`: Tarefas de build, configurações, etc

## 📄 Licença

Este projeto é proprietário da **StoneUP**.

## 📞 Contato e Suporte

- **Website**: [https://stoneup.com.br](https://stoneup.com.br)
- **API**: [https://api.stoneup.com.br](https://api.stoneup.com.br)
- **Suporte**: Entre em contato através do chat no app

---

<div align="center">
  <p>Desenvolvido com ❤️ pela equipe StoneUP</p>
  <p>© 2024 StoneUP - Todos os direitos reservados</p>
</div>
