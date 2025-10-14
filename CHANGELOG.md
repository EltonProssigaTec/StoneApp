# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2024-10-14

### ✨ Adicionado
- Sistema completo de autenticação (Login, Registro, Recuperação de senha)
- Dashboard com resumo financeiro
- Visualização de dívidas e pendências
- Sistema de ofertas e acordos personalizados
- Consulta de CPF/CNPJ com score
- Geração de planos de pagamento
- Chat de suporte com IA (ChatBot)
- Notificações configuráveis (Push, SMS, Email)
- Menu lateral animado com gestos
- Splash screen animada
- Componentes reutilizáveis e tipados
- Sistema de navegação com Expo Router
- Tema customizado com gradientes
- Máscaras de input (CPF, CNPJ, telefone, data, dinheiro)

### 🐛 Corrigido
- Crash no login em builds de produção (APK)
  - Removidos console.log em produção usando `__DEV__`
  - Substituído AsyncStorage.clear() por multiRemove nas chaves específicas
  - Alert.alert movido para componente com setTimeout para execução segura
  - Melhorado tratamento de erros assíncronos
- Navegação: usuário não consegue mais voltar para splash screen
- Back button habilitado em todas as telas (exceto splash)
- Tratamento robusto de erros de rede e API
- Proteção contra JSON.parse de dados corrompidos

### 🔧 Melhorado
- Performance geral do app
- Tratamento de erros mais robusto
- Logs condicionais apenas em desenvolvimento
- Sistema de navegação mais intuitivo
- UX ao pressionar botão voltar no Android
- Validações de formulários
- Feedback visual ao usuário

### 📦 Configurações
- Configurado EAS Build para Android (preview e production)
- Perfil preview gera APK para testes
- Perfil production gera AAB para Google Play
- TypeScript strict mode habilitado
- ESLint e Prettier configurados

### 🔒 Segurança
- Tokens de autenticação armazenados de forma segura
- Validação de dados no frontend
- Timeout de requisições HTTP (30s)
- Proteção contra navegação indesejada

---

## [Em Desenvolvimento]

### 🚀 Próximas Funcionalidades
- [ ] Notificações push nativas
- [ ] Modo offline com sincronização
- [ ] Suporte a biometria (Touch ID / Face ID)
- [ ] Histórico de acordos realizados
- [ ] Exportação de relatórios em PDF
- [ ] Integração com PIX
- [ ] Dark mode
- [ ] Multi-idioma (PT/EN/ES)

### 🐛 Bugs Conhecidos
- Nenhum bug crítico identificado

---

## Legenda

- ✨ **Adicionado**: Novas funcionalidades
- 🐛 **Corrigido**: Correções de bugs
- 🔧 **Melhorado**: Melhorias em funcionalidades existentes
- 📦 **Configurações**: Mudanças em configurações e dependências
- 🔒 **Segurança**: Correções de segurança
- ⚠️ **Depreciado**: Funcionalidades que serão removidas
- ❌ **Removido**: Funcionalidades removidas
- 🚀 **Próximas Funcionalidades**: Planejamento futuro
