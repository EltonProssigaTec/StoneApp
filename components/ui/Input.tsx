import { AppColors, Fonts } from '@/constants/theme';
import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from './icon-symbol';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: any;
  secureTextEntry?: boolean;
  disabled?: boolean;
}

export function Input({
  label,
  error,
  icon,
  secureTextEntry,
  style,
  disabled,
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          {icon && (
            <IconSymbol
              size={18}
              name={icon}
              color={AppColors.primary}
              style={styles.labelIcon}
            />
          )}
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          (disabled || props.editable === false) && styles.inputDisabled,
        ]}
      >
        <TextInput
          // @ts-ignore - Web-specific styles for autofill
          style={[
            styles.input,
            style,
            Platform.OS === 'web' && {
              WebkitBoxShadow: '0 0 0 1000px white inset',
              WebkitTextFillColor: AppColors.text.primary,
              outline: 'none',
            },
          ]}
          placeholderTextColor={AppColors.text.placeholder}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeIcon}
            disabled={disabled || props.editable === false}
          >
            <IconSymbol
              size={20}
              name={isPasswordVisible ? 'eye.slash' : 'eye'}
              color={disabled || props.editable === false ? AppColors.gray[300] : AppColors.gray[400]}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelIcon: {
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: AppColors.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.primary,
    overflow: 'hidden',
  },
  inputFocused: {
    borderColor: AppColors.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: AppColors.status.error,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: AppColors.text.primary,
    borderWidth: 0,
  },
  eyeIcon: {
    padding: 12,
    paddingRight: 14,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: Fonts.regular,
  },
});
