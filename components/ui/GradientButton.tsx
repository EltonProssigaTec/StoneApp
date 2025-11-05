import { AppColors, Fonts, Gradients } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';

interface GradientButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  fullWidth?: boolean;
  halfWidth?: boolean;
  variant?: 'primary' | 'secondary';
}

export function GradientButton({
  title,
  loading = false,
  fullWidth = false,
  halfWidth = false,
  variant = 'primary',
  disabled,
  style,
  ...props
}: GradientButtonProps) {
  const gradientConfig = variant === 'secondary' ? Gradients.secondary : Gradients.primary;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
        halfWidth && styles.halfWidth,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      <LinearGradient
        {...gradientConfig}
        style={[styles.gradient, disabled && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color={AppColors.white} />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  fullWidth: {
    width: '100%',

  },
  halfWidth: {
    width: '50%',
    alignSelf: 'center',
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: AppColors.white,
  },
});
