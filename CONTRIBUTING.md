# Guia de Contribuição

Obrigado por considerar contribuir para o StoneApp! 🎉

## 📋 Código de Conduta

Ao participar deste projeto, você concorda em manter um ambiente respeitoso e colaborativo.

## 🚀 Como Começar

### 1. Fork e Clone
```bash
# Fork o repositório no GitHub
# Clone seu fork
git clone https://github.com/seu-usuario/StoneApp.git
cd StoneApp

# Adicione o repositório original como upstream
git remote add upstream https://github.com/stoneup/StoneApp.git
```

### 2. Configure o Ambiente
```bash
# Instale as dependências
npm install

# Rode o app em modo desenvolvimento
npm start
```

## 📝 Padrões de Código

### TypeScript
- Use TypeScript para todo código novo
- Sempre defina tipos explícitos
- Evite usar `any` - prefira `unknown` quando necessário

```typescript
// ✅ Bom
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = async (id: string): Promise<User> => {
  // ...
}

// ❌ Ruim
const getUser = async (id: any): Promise<any> => {
  // ...
}
```

### React Hooks
- Use hooks funcionais ao invés de classes
- Organize hooks na ordem: useState, useEffect, useCallback, useMemo, custom hooks

```typescript
// ✅ Bom
export default function MyComponent() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = useCallback(() => {
    // ...
  }, []);

  // ...
}
```

### Componentes
- Um componente por arquivo
- Use nomes descritivos em PascalCase
- Exporte como default
- Props devem ser tipadas com interface

```typescript
// components/ui/CustomButton.tsx
interface CustomButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function CustomButton({
  title,
  onPress,
  loading = false,
  disabled = false
}: CustomButtonProps) {
  // ...
}
```

### Estilos
- Use StyleSheet.create
- Organize estilos no final do arquivo
- Use constantes do tema (colors, fonts, spacing)

```typescript
import { AppColors, Fonts } from '@/constants/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: AppColors.text.primary,
  },
});
```

### Logs
- NUNCA use console.log em produção
- SEMPRE use condição `__DEV__`

```typescript
// ✅ Bom
if (__DEV__) {
  console.log('Debug info:', data);
}

// ❌ Ruim
console.log('Debug info:', data);
```

## 🌿 Branches e Commits

### Estrutura de Branches
```
main              # Branch principal (produção)
  ├─ develop      # Branch de desenvolvimento
      ├─ feature/nova-funcionalidade
      ├─ fix/correcao-bug
      └─ refactor/melhoria-codigo
```

### Padrão de Commits (Conventional Commits)

```bash
# Formato
<tipo>(<escopo>): <descrição>

# Tipos
feat:     # Nova funcionalidade
fix:      # Correção de bug
docs:     # Documentação
style:    # Formatação, ponto e vírgula, etc (não afeta código)
refactor: # Refatoração (não adiciona feature nem corrige bug)
perf:     # Melhoria de performance
test:     # Adiciona/corrige testes
chore:    # Tarefas de build, configs, etc

# Exemplos
feat(auth): adiciona login com biometria
fix(dividas): corrige cálculo de juros
docs(readme): atualiza instruções de instalação
refactor(api): melhora tratamento de erros
```

## 🔄 Fluxo de Trabalho

### 1. Crie uma Branch
```bash
# Para nova funcionalidade
git checkout -b feature/nome-da-funcionalidade

# Para correção de bug
git checkout -b fix/nome-do-bug
```

### 2. Faça suas Alterações
- Escreva código limpo e bem documentado
- Siga os padrões de código
- Teste suas alterações

### 3. Commit suas Mudanças
```bash
git add .
git commit -m "feat: adiciona nova funcionalidade"
```

### 4. Atualize com o Upstream
```bash
git fetch upstream
git rebase upstream/develop
```

### 5. Push para seu Fork
```bash
git push origin feature/nome-da-funcionalidade
```

### 6. Abra um Pull Request
- Vá para o GitHub
- Clique em "New Pull Request"
- Descreva suas mudanças detalhadamente
- Aguarde revisão

## 📋 Checklist de Pull Request

Antes de abrir um PR, verifique:

- [ ] Código segue os padrões do projeto
- [ ] Todos os testes passam
- [ ] Sem console.log em produção
- [ ] Componentes são tipados
- [ ] Código foi testado em Android e iOS (se aplicável)
- [ ] Documentação foi atualizada (se necessário)
- [ ] Commit messages seguem o padrão
- [ ] Não há conflitos com a branch base

## 🧪 Testes

### Executar Testes
```bash
npm test
```

### Escrever Testes
```typescript
// __tests__/utils/masks.test.ts
import { cpfMask } from '@/utils/masks';

describe('cpfMask', () => {
  it('deve formatar CPF corretamente', () => {
    expect(cpfMask('12345678900')).toBe('123.456.789-00');
  });

  it('deve retornar vazio para input inválido', () => {
    expect(cpfMask('')).toBe('');
  });
});
```

## 📖 Documentação

### Comentários em Código
- Use JSDoc para funções complexas
- Explique o "porquê", não o "o quê"
- Mantenha comentários atualizados

```typescript
/**
 * Calcula o valor total de uma dívida com juros
 *
 * @param valor - Valor principal da dívida
 * @param taxa - Taxa de juros mensal (ex: 0.05 para 5%)
 * @param meses - Número de meses
 * @returns Valor total com juros
 */
export function calcularDividaComJuros(
  valor: number,
  taxa: number,
  meses: number
): number {
  return valor * Math.pow(1 + taxa, meses);
}
```

## 🐛 Reportar Bugs

### Template de Issue
```markdown
## Descrição
[Descrição clara do bug]

## Passos para Reproduzir
1. Vá para '...'
2. Clique em '...'
3. Veja o erro

## Comportamento Esperado
[O que deveria acontecer]

## Comportamento Atual
[O que está acontecendo]

## Screenshots
[Se aplicável]

## Ambiente
- Dispositivo: [ex: iPhone 12, Samsung Galaxy S21]
- OS: [ex: iOS 15, Android 12]
- Versão do App: [ex: 1.0.0]
```

## 💡 Sugerir Funcionalidades

### Template de Feature Request
```markdown
## Problema a Resolver
[Descreva o problema ou necessidade]

## Solução Proposta
[Como você gostaria que fosse resolvido]

## Alternativas Consideradas
[Outras soluções que você pensou]

## Contexto Adicional
[Screenshots, links, etc]
```

## 🎨 Padrões de UI/UX

- Siga o design system do app
- Use componentes reutilizáveis
- Mantenha consistência visual
- Teste em diferentes tamanhos de tela
- Considere acessibilidade

## 🔒 Segurança

- NUNCA commite credenciais ou tokens
- Use variáveis de ambiente para dados sensíveis
- Valide inputs do usuário
- Trate erros adequadamente
- Use HTTPS para todas as chamadas de API

## 📞 Contato

Dúvidas? Entre em contato:
- Email: dev@stoneup.com.br
- Issues: [GitHub Issues](https://github.com/stoneup/StoneApp/issues)

---

Obrigado por contribuir! 🚀
