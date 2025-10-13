/**
 * StoneUP Monitora - Theme Configuration
 * Cores e estilos baseados no design do Figma
 */


// Cores principais do StoneUP Monitora
export const AppColors = {
  primary: '#0B7FBE', // Azul principal
  secondary: '#FF9500', // Laranja
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    placeholder: '#9CA3AF',
    white: '#FFFFFF',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    card: '#FFFFFF',
  },
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    dark: '#9CA3AF',
  },
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  error: '#EF4444',
};

// Compatibilidade com o sistema de cores do Expo (apenas modo claro)
export const Colors = {
  text: AppColors.text.primary,
  background: AppColors.white,
  tint: AppColors.primary,
  icon: AppColors.gray[600],
  tabIconDefault: AppColors.gray[400],
  tabIconSelected: AppColors.primary,
};

export const Fonts = {
  regular: 'Montserrat_400Regular',
  medium: 'Montserrat_500Medium',
  semiBold: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
};

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};

// Gradientes globais
export const Gradients = {
  primary: {
    colors: ['#0B7FBE', '#1E9FD8'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  secondary: {
    colors: ['#FF9500', '#FFB800'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  primaryVertical: {
    colors: ['#0B7FBE', '#1E9FD8'] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  secondaryVertical: {
    colors: ['#FF9500', '#FFB800'] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
};
