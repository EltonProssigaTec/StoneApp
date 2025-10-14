import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { AppColors, Fonts } from '@/constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  fullWidth?: boolean;
  compact?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  compact = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        fullWidth && styles.fullWidth,
        compact && styles.compact,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? AppColors.white : AppColors.primary}
        />
      ) : (
        <Text style={[styles.text, compact && styles.compactText, getTextStyle()]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  fullWidth: {
    width: '100%',
  },
  compact: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 24,
    minHeight: 36,
  },
  primaryButton: {
    backgroundColor: AppColors.primary,
  },
  secondaryButton: {
    backgroundColor: AppColors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: AppColors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
  compactText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  primaryText: {
    color: AppColors.white,
  },
  secondaryText: {
    color: AppColors.white,
  },
  outlineText: {
    color: AppColors.primary,
  },
});
