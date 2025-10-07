# StoneApp - StoneUP Monitora

Aplicativo mobile para gestão de dívidas e acordos financeiros desenvolvido com React Native e Expo.

## Sobre o Projeto

O StoneApp (StoneUP Monitora) é uma solução mobile para ajudar usuários a monitorar e gerenciar suas dívidas, fazer acordos de pagamento e acompanhar sua saúde financeira.

## Tecnologias

- **React Native** 0.81.4
- **Expo SDK** 54
- **TypeScript** 5.9.2
- **Expo Router** - Navegação baseada em arquivos
- **React Native Gesture Handler** - Gestos e animações
- **React Native Reanimated** - Animações performáticas
- **Axios** - Cliente HTTP
- **AsyncStorage** - Armazenamento local

## Funcionalidades

- ✅ Autenticação de usuários (Login/Cadastro/Recuperação)
- ✅ Visualização de dívidas e pendências
- ✅ Ofertas de acordos personalizados
- ✅ Geração de planos de pagamento
- ✅ Acompanhamento de saúde financeira
- ✅ Notificações de vencimentos
- ✅ Chat de suporte
- ✅ Menu lateral animado com gestos

## Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Expo Go (para testar no dispositivo físico)
- Android Studio ou Xcode (para emuladores)

## Instalação

1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd StoneApp
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
# Crie um arquivo .env na raiz do projeto
API_URL=https://api.stoneup.com.br/api/v1.0
```

## Executando o Projeto

### Modo de desenvolvimento
```bash
npm start
# ou
npx expo start
```

### Limpar cache e reiniciar
```bash
npx expo start --clear
```

### Executar em plataforma específica
```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## Estrutura do Projeto

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
└── assets/                # Imagens e recursos
```

## Recursos de UI

### Componentes Principais
- **Button** - Botão padrão
- **GradientButton** - Botão com gradiente
- **Input/FloatingInput** - Campos de entrada
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

## API Integration

O app se comunica com a API StoneUP através de serviços configurados com Axios:

```typescript
// Exemplo de uso
import { AuthService } from '@/services';

const login = await AuthService.login(email, password);
```

### Endpoints Principais
- `POST /login_monitora` - Login
- `POST /pre_register` - Pré-cadastro
- `GET /dividas` - Listar dívidas
- `GET /ofertas` - Listar ofertas

## Máscaras de Input

O projeto inclui máscaras para formatação de dados:

```typescript
import { cpfMask, phoneMask, dateMask, moneyMask } from '@/utils/masks';

const formatted = cpfMask('12345678900'); // 123.456.789-00
```

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto é proprietário da StoneUP.

## Contato

StoneUP - [https://stoneup.com.br](https://stoneup.com.br)
