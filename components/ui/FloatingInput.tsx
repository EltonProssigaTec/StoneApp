import { AppColors, Fonts } from '@/constants/theme';
import React, { useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from './icon-symbol';

interface FloatingInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: any;
  secureTextEntry?: boolean;
}

export function FloatingInput({
  label,
  error,
  icon,
  secureTextEntry,
  style,
  value,
  onFocus,
  onBlur,
  ...props
}: FloatingInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [labelAnimation] = useState(new Animated.Value(value ? 1 : 0));

  const hasValue = value && value.toString().length > 0;
  const showFloatingLabel = isFocused || hasValue;

  React.useEffect(() => {
    Animated.timing(labelAnimation, {
      toValue: showFloatingLabel ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [showFloatingLabel]);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur && onBlur(e);
  };

  const labelTop = labelAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, -8],
  });

  const labelFontSize = labelAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12],
  });

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
      >
        {icon && (
          <View style={styles.iconContainer}>
            <IconSymbol
              size={20}
              name={icon}
              color={showFloatingLabel ? AppColors.primary : AppColors.gray[400]}
            />
          </View>
        )}

        <View style={styles.inputWrapper}>
          {label && (
            <Animated.View
              style={[
                styles.floatingLabelContainer,
                {
                  top: labelTop,
                },
              ]}
              pointerEvents="none"
            >
              <Animated.Text
                style={[
                  styles.floatingLabel,
                  {
                    fontSize: labelFontSize,
                    color: showFloatingLabel ? AppColors.primary : AppColors.text.placeholder,
                  },
                ]}
              >
                {label}
              </Animated.Text>
            </Animated.View>
          )}

          <TextInput
            style={[styles.input, style]}
            placeholderTextColor="transparent"
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={value}
            {...props}
          />
        </View>

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeIcon}
          >
            <IconSymbol
              size={20}
              name={isPasswordVisible ? 'eye.slash' : 'eye'}
              color={AppColors.gray[400]}
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
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: AppColors.border.light,
    borderRadius: 8,
    paddingHorizontal: 16,
    minHeight: 56,
    position: 'relative',
  },
  inputFocused: {
    borderColor: AppColors.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: AppColors.status.error,
  },
  iconContainer: {
    marginRight: 12,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  floatingLabelContainer: {
    position: 'absolute',
    backgroundColor: AppColors.white,
  },
  floatingLabel: {
    fontFamily: Fonts.semiBold,
  },
  input: {
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: AppColors.text.primary,
    minHeight: 24,
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: AppColors.status.error,
  },
});
