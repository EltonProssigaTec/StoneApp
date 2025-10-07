# 📱 Guia de Responsividade - StoneUP Monitora

## 🎯 Objetivo

Garantir que todas as telas funcionem perfeitamente em:
- 📱 Mobile (iOS/Android)
- 💻 Web (com max-width 720px)
- 🔒 SafeArea respeitada em todos os dispositivos

## 🏗️ Componentes de Layout

### 1. AuthLayout
Para telas de autenticação (Login, Registro, Recuperação).

```tsx
import { AuthLayout } from '@/components/layouts';

<AuthLayout waveVariant="login">
  {/* Seu conteúdo aqui */}
</AuthLayout>
```

**Características:**
- ✅ SafeAreaView integrado
- ✅ KeyboardAvoidingView
- ✅ ScrollView com handling
- ✅ Max-width 720px na web
- ✅ Centralizado na web
- ✅ Logo opcional

### 2. ScreenLayout
Para telas internas com header.

```tsx
import { ScreenLayout } from '@/components/layouts';

<ScreenLayout
  headerTitle="Minha Tela"
  showBack
  scrollable
>
  {/* Seu conteúdo aqui */}
</ScreenLayout>
```

**Características:**
- ✅ SafeAreaView integrado
- ✅ Header customizável
- ✅ ScrollView opcional
- ✅ Max-width 720px na web
- ✅ Centralizado na web

### 3. SafeContainer
Container básico com SafeArea.

```tsx
import { SafeContainer } from '@/components/layouts';

<SafeContainer edges={['top', 'bottom']}>
  {/* Seu conteúdo aqui */}
</SafeContainer>
```

### 4. ResponsiveContainer
Container com responsividade web.

```tsx
import { ResponsiveContainer } from '@/components/layouts';

<ResponsiveContainer centered>
  {/* Seu conteúdo aqui */}
</ResponsiveContainer>
```

## 📐 Padrão de Estilo Responsivo

### Template Base

```tsx
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  // SafeArea - sempre no root
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background.secondary,
  },

  // Wrapper - centraliza na web
  wrapper: {
    flex: 1,
    ...Platform.select({
      web: {
        justifyContent: 'center',
        alignItems: 'center',
      },
    }),
  },

  // Container - max-width na web
  container: {
    flex: 1,
    width: '100%',
    ...Platform.select({
      web: {
        maxWidth: 720,
      },
    }),
  },
});
```

### Estrutura Completa

```tsx
export default function MyScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.wrapper}>
        <View style={styles.container}>
          {/* Conteúdo da tela */}
        </View>
      </View>
    </SafeAreaView>
  );
}
```

## 🎨 Breakpoints e Dimensões

### Mobile
- Width: Dinâmica (100% do dispositivo)
- Padding lateral: 16-32px
- SafeArea: Sempre respeitada

### Web
- Max-width: 720px
- Centralizado horizontal e verticalmente
- Padding lateral: 32px

## ✅ Checklist de Implementação

### Para Cada Tela:

- [ ] Usa SafeAreaView com edges apropriadas
- [ ] Wrapper com centralização web
- [ ] Container com max-width 720px
- [ ] Padding responsivo
- [ ] Testado em mobile
- [ ] Testado em web
- [ ] Testado em diferentes tamanhos de tela

## 📱 Telas Já Implementadas

### ✅ AuthLayout (Login, Register, Recover)
```tsx
// Estrutura completa com:
// - SafeAreaView
// - Wrapper centralizado (web)
// - Container max-width 720px
// - KeyboardAvoidingView
// - ScrollView
```

### ✅ Home
```tsx
// Estrutura com:
// - SafeAreaView
// - Wrapper centralizado
// - Container max-width 720px
// - ScreenHeader
// - Componentes reutilizáveis
```

### 🔄 Pendente de Migração:
- Pendências
- Ofertas
- Planos
- Chat
- Outras telas secundárias

## 🛠️ Como Migrar uma Tela Existente

### Antes:
```tsx
export default function MyScreen() {
  return (
    <View style={styles.container}>
      {/* Conteúdo */}
    </View>
  );
}
```

### Depois:
```tsx
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

export default function MyScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.wrapper}>
        <View style={styles.container}>
          {/* Conteúdo */}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  wrapper: {
    flex: 1,
    ...Platform.select({
      web: {
        justifyContent: 'center',
        alignItems: 'center',
      },
    }),
  },
  container: {
    flex: 1,
    width: '100%',
    ...Platform.select({
      web: {
        maxWidth: 720,
      },
    }),
  },
});
```

## 📏 Padrões de Espaçamento

### Padding/Margin Horizontal
```tsx
paddingHorizontal: 20,  // Mobile
paddingHorizontal: 32,  // Web (opcional)
```

### SafeArea Edges
```tsx
// Telas com header próprio
edges={['bottom']}

// Telas fullscreen
edges={['top', 'bottom']}

// Telas modais
edges={['top', 'right', 'bottom', 'left']}
```

## 🎯 Boas Práticas

### ✅ Fazer:
1. Sempre usar SafeAreaView no root
2. Sempre ter wrapper + container na web
3. Testar em múltiplos dispositivos
4. Usar Platform.select para web
5. Manter max-width 720px

### ❌ Evitar:
1. Hardcoded heights
2. Position absolute sem cuidado
3. Ignorar SafeArea
4. Esquecer do KeyboardAvoidingView
5. Não testar na web

## 🧪 Como Testar

### Mobile
```bash
# iOS
npm run ios

# Android
npm run android
```

### Web
```bash
npm run web

# Ou acesse: http://localhost:8082
```

### Diferentes Tamanhos
- Redimensione o navegador
- Teste em tablets
- Teste em diferentes celulares
- Use Dev Tools do navegador

## 📦 Exemplo Completo

```tsx
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ui';
import { AppColors } from '@/constants/theme';

export default function ExampleScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.wrapper}>
        <View style={styles.container}>
          <ScreenHeader title="Example" showBack />

          <View style={styles.content}>
            <Text>Conteúdo da tela</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background.secondary,
  },
  wrapper: {
    flex: 1,
    ...Platform.select({
      web: {
        justifyContent: 'center',
        alignItems: 'center',
      },
    }),
  },
  container: {
    flex: 1,
    width: '100%',
    ...Platform.select({
      web: {
        maxWidth: 720,
      },
    }),
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
```

## 🚀 Ferramentas Úteis

### React Native Safe Area Context
```bash
npm install react-native-safe-area-context
```

### Testando Responsividade
- Chrome DevTools (F12)
- Responsive Design Mode
- Multiple device simulators

## 📝 Notas Importantes

1. **SafeArea** é crítica para iOS com notch
2. **Max-width 720px** mantém legibilidade na web
3. **Centralização** melhora UX em telas grandes
4. **Platform.select** permite código específico por plataforma
5. **KeyboardAvoidingView** essencial para formulários

## 🎓 Recursos

- [React Native Safe Area Context](https://github.com/th3rdwave/react-native-safe-area-context)
- [React Native Platform Specific Code](https://reactnative.dev/docs/platform-specific-code)
- [Responsive Design in React Native](https://reactnative.dev/docs/flexbox)
