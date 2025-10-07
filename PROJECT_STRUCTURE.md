# StoneUP Monitora - Estrutura do Projeto

## 📱 Sobre o Projeto

Aplicação mobile desenvolvida com React Native e Expo para monitoramento de dívidas e gestão financeira. O design foi implementado baseado no Figma fornecido, mantendo fidelidade às cores, layouts e componentes especificados.

## 🎨 Design System

### Cores Principais
- **Primary (Azul)**: `#0B7FBE`
- **Secondary (Laranja)**: `#FF9500`
- **Background**: `#FFFFFF` / `#F9FAFB`

### Componentes Base
Localizados em `components/ui/`:
- **Button**: Botão customizado com variantes (primary, secondary, outline)
- **Input**: Campo de entrada com suporte a ícones, labels e validação
- **Card**: Container com elevação e bordas arredondadas
- **Logo**: Componente do logo StoneUP com diferentes tamanhos

## 📂 Estrutura de Telas

### Autenticação
- `app/splash.tsx` - Tela inicial com animação
- `app/login.tsx` - Tela de login
- `app/register.tsx` - Cadastro de novos usuários
- `app/recover.tsx` - Recuperação de senha

### Navegação Principal (Tabs)
Localizado em `app/(tabs)/`:
- `home.tsx` - Dashboard principal com resumo de dívidas
- `saude-financeira.tsx` - Análise de saúde financeira
- `dividas.tsx` - Listagem de dívidas
- `notificacoes.tsx` - Central de notificações

### Telas Secundárias
- `app/pendencias.tsx` - Pendências financeiras detalhadas
- `app/ofertas.tsx` - Ofertas de negociação com progress bar
- `app/planos.tsx` - Planos de assinatura
- `app/chat.tsx` - Chat de suporte
- `app/my-cpf.tsx` - Consulta CPF/CNPJ
- `app/acordos.tsx` - Meus acordos
- `app/gerar-acordos.tsx` - Geração de acordos

## 🚀 Como Executar

### Pré-requisitos
- Node.js instalado
- Expo CLI instalado globalmente

### Instalação
```bash
npm install
```

### Executar
```bash
# Para Android
npm run android

# Para iOS
npm run ios

# Para Web
npm run web

# Modo desenvolvimento
npm start
```

## 🗂️ Organização do Código

```
StoneApp/
├── app/                    # Telas da aplicação (File-based routing)
│   ├── (tabs)/            # Telas com navegação em tabs
│   ├── _layout.tsx        # Layout raiz
│   ├── index.tsx          # Redirecionamento inicial
│   └── [outras telas]
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes de UI base
│   └── Logo.tsx          # Logo da aplicação
├── constants/            # Constantes e tema
│   └── theme.ts         # Cores e estilos
└── hooks/               # Hooks customizados
```

## 🎯 Funcionalidades Implementadas

✅ Sistema de autenticação (UI)
✅ Dashboard com resumo de dívidas
✅ Listagem de pendências financeiras
✅ Sistema de ofertas com descontos
✅ Planos de assinatura
✅ Chat de suporte
✅ Navegação por tabs
✅ Componentes reutilizáveis
✅ Design system baseado no Figma
✅ Suporte para Web e Mobile (Android/iOS)

## 🔄 Próximos Passos

- [ ] Integração com API backend
- [ ] Implementar autenticação real
- [ ] Adicionar persistência de dados
- [ ] Implementar notificações push
- [ ] Adicionar testes automatizados
- [ ] Melhorar acessibilidade
- [ ] Adicionar animações avançadas

## 📱 Compatibilidade

- ✅ Android
- ✅ iOS
- ✅ Web

## 🛠️ Tecnologias Utilizadas

- React Native
- Expo SDK 54
- Expo Router (File-based routing)
- React Navigation
- TypeScript
- React Native Gesture Handler
- React Native Reanimated
