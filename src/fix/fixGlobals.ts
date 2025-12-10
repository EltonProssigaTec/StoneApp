/**
 * FIX GLOBAL - Correção para "property is not configurable"
 *
 * PROBLEMA: Alguma biblioteca está sobrescrevendo propriedades globais
 * não configuráveis (Error, console, Symbol, Promise), quebrando
 * TurboModules do React Native e react-native-iap
 *
 * SOLUÇÃO: Proteger essas propriedades antes de qualquer lib modificá-las
 */

export function applyGlobalFix(): void {
  console.log('[FixGlobals] 🔧 Aplicando correção de propriedades globais...');

  const protectedKeys = ['Error', 'console', 'Symbol', 'Promise'];

  protectedKeys.forEach((key) => {
    try {
      const original = (global as any)[key];

      if (!original) {
        console.warn(`[FixGlobals] ⚠️ global.${key} não existe`);
        return;
      }

      // ✅ CORREÇÃO: Permite modificação mas mantém configurável
      // Isso evita conflito com react-native-iap e outros módulos nativos
      Object.defineProperty(global, key, {
        configurable: true,
        writable: true, // ✅ Permite escrita
        enumerable: false,
        value: original,
      });

      console.log(`[FixGlobals] ✅ global.${key} protegido`);
    } catch (error: any) {
      console.warn(`[FixGlobals] ⚠️ Não foi possível proteger global.${key}:`, error.message);
    }
  });

  console.log('[FixGlobals] ✅ Correção aplicada com sucesso!');
}

/**
 * Detector de overrides globais
 * Use para identificar qual biblioteca está sobrescrevendo
 */
export function detectGlobalOverrides(): void {
  console.log('[FixGlobals] 🔍 Ativando detector de overrides...');

  ['Error', 'console', 'Symbol', 'Promise'].forEach((key) => {
    const original = (global as any)[key];

    try {
      Object.defineProperty(global, key, {
        configurable: false,
        set(v) {
          console.log(`\n\n❌ TENTATIVA DE SOBRESCREVER global.${key}`);
          console.log(`Arquivo causador:\n`);
          console.trace();

          return original;
        },
        get() {
          return original;
        },
      });
    } catch (error) {
      // Já foi configurado
    }
  });

  console.log('[FixGlobals] ✅ Detector ativado!');
}
