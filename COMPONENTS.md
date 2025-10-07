# 📦 Componentes StoneUP Monitora

Este documento detalha todos os componentes reutilizáveis da aplicação.

## 🎨 UI Components (`components/ui/`)

### Button
Botão padrão com múltiplas variantes.

```tsx
import { Button } from '@/components/ui';

<Button
  title="Clique aqui"
  variant="primary" // primary | secondary | outline
  loading={false}
  fullWidth={true}
  onPress={() => {}}
/>
```

### GradientButton
Botão com gradiente azul (usado principalmente em CTAs).

```tsx
import { GradientButton } from '@/components/ui';

<GradientButton
  title="Acessar"
  fullWidth
  onPress={() => {}}
/>
```

### FloatingInput
Input com label flutuante animada (Material Design).

```tsx
import { FloatingInput } from '@/components/ui';

<FloatingInput
  label="Email"
  placeholder="Digite seu email"
  icon="envelope.fill"
  value={email}
  onChangeText={setEmail}
  error={errors.email}
  secureTextEntry={false}
/>
```

**Características:**
- Label anima para cima quando focado ou preenchido
- Ícone à esquerda (opcional)
- Toggle de visibilidade para senhas
- Validação com mensagem de erro

### Card
Container com sombra e bordas arredondadas.

```tsx
import { Card } from '@/components/ui';

<Card elevated={true} style={styles.custom}>
  {children}
</Card>
```

### WaveDecoration
Ondas decorativas para headers.

```tsx
import { WaveDecoration } from '@/components/ui';

<WaveDecoration variant="login" /> // login | splash | small
```

**Variantes:**
- `login`: Ondas sutis no topo (azul + laranja)
- `splash`: Ondas grandes para splash screen
- `small`: Ondas pequenas para telas secundárias

### ScreenHeader
Header padrão para telas internas.

```tsx
import { ScreenHeader } from '@/components/ui';

<ScreenHeader
  title="Título"
  showBack={true}
  showMenu={false}
  showAvatar={false}
  onBackPress={() => router.back()}
/>
```

### IconSymbol
Wrapper para ícones SF Symbols (iOS) e equivalentes.

```tsx
import { IconSymbol } from '@/components/ui';

<IconSymbol
  name="person.fill"
  size={24}
  color={AppColors.primary}
/>
```

## 🃏 Card Components (`components/cards/`)

### DebtCard
Card para exibir informações de dívidas.

```tsx
import { DebtCard } from '@/components/cards';

<DebtCard
  amount={2500.00}
  updatedAt="02/09/2025"
  variant="primary" // primary | card
  showEyeIcon={true}
  onEyePress={() => {}}
/>
```

**Variantes:**
- `primary`: Fundo azul (para dashboard)
- `card`: Fundo branco (para listagens)

### MenuItem
Item do menu em grid na home.

```tsx
import { MenuItem } from '@/components/cards';

<MenuItem
  icon="creditcard.fill"
  title="Meu CPF/CNPJ"
  onPress={() => router.push('/my-cpf')}
/>
```

### OfferCard
Card de oferta com progress bar de desconto.

```tsx
import { OfferCard } from '@/components/cards';

<OfferCard
  company="STONE TESTE"
  discount={67}
  originalAmount={8000}
  discountedAmount={2640}
  onPress={() => {}}
  onMenuPress={() => {}}
/>
```

### PlanCard
Card de plano de assinatura.

```tsx
import { PlanCard } from '@/components/cards';

<PlanCard
  name="Monitora Ano"
  period="PLANO ANUAL"
  price={59.99}
  discount="VÁRIOS DESCONTOS"
/>
```

## 🏗️ Layout Components (`components/layouts/`)

### AuthLayout
Layout padrão para telas de autenticação.

```tsx
import { AuthLayout } from '@/components/layouts';

<AuthLayout
  showLogo={true}
  logoSize="medium"
  waveVariant="login"
>
  {/* Conteúdo da tela */}
</AuthLayout>
```

**Características:**
- KeyboardAvoidingView integrado
- ScrollView com keyboard handling
- Logo centralizado (opcional)
- WaveDecoration no topo

## 🎭 Other Components

### Logo
Logo StoneUP Monitora componentizado.

```tsx
import { Logo } from '@/components';

<Logo
  size="small" // small | medium | large
  showSubtitle={true}
/>
```

**Tamanhos:**
- `small`: Ícone 40px, texto 20px
- `medium`: Ícone 60px, texto 32px
- `large`: Ícone 80px, texto 40px

## 📥 Importações

### Importação Individual
```tsx
import { Button } from '@/components/ui/Button';
import { DebtCard } from '@/components/cards/DebtCard';
```

### Importação via Index
```tsx
// Melhor prática - via index
import { Button, FloatingInput, GradientButton } from '@/components/ui';
import { DebtCard, MenuItem } from '@/components/cards';
import { AuthLayout } from '@/components/layouts';
import { Logo } from '@/components';
```

### Importação Global
```tsx
// Importa tudo
import * as UI from '@/components/ui';
import * as Cards from '@/components/cards';

<UI.Button title="Click" />
<Cards.DebtCard amount={1000} />
```

## 🎨 Convenções de Design

### Cores
Todos os componentes utilizam o tema centralizado:

```tsx
import { AppColors } from '@/constants/theme';

AppColors.primary      // #0B7FBE (Azul)
AppColors.secondary    // #FF9500 (Laranja)
AppColors.white        // #FFFFFF
AppColors.gray[400]    // Cinzas em escala
AppColors.text.primary // Texto principal
```

### Espaçamentos
- Padding interno dos cards: 16px
- Margin entre elementos: 16-24px
- Border radius padrão: 8-12px

### Tipografia
- Títulos: 20-32px, bold
- Subtítulos: 14-18px, semibold
- Corpo: 14-16px, regular
- Pequeno: 11-12px, regular

## 🔄 Reutilização

Todos os componentes foram projetados para máxima reutilização:

1. **Props flexíveis**: Aceita props customizadas
2. **Estilização**: Permite `style` prop para override
3. **Composição**: Pode ser combinado com outros componentes
4. **TypeScript**: Totalmente tipado para melhor DX

## 📝 Exemplos de Uso

### Tela de Login Completa
```tsx
import { AuthLayout, FloatingInput, GradientButton, Button } from '@/components';

export default function LoginScreen() {
  return (
    <AuthLayout waveVariant="login">
      <FloatingInput label="Email" icon="person.fill" />
      <FloatingInput label="Senha" icon="lock.fill" secureTextEntry />
      <GradientButton title="Acessar" fullWidth />
      <Button title="Criar conta" variant="outline" fullWidth />
    </AuthLayout>
  );
}
```

### Dashboard Home
```tsx
import { DebtCard, MenuItem } from '@/components/cards';
import { ScreenHeader } from '@/components/ui';

export default function HomeScreen() {
  return (
    <>
      <ScreenHeader title="Home" showMenu showAvatar />
      <DebtCard amount={2500} variant="primary" />
      <View style={styles.grid}>
        <MenuItem icon="creditcard.fill" title="Meu CPF" onPress={...} />
        <MenuItem icon="tag.fill" title="Ofertas" onPress={...} />
      </View>
    </>
  );
}
```

## 🚀 Performance

- Componentes otimizados com React.memo quando necessário
- Animações usando useNativeDriver para 60fps
- Lazy loading de componentes pesados
- Memoização de callbacks e valores computados
