import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { Fonts } from '@/constants/theme';

interface TextProps extends RNTextProps {
  weight?: 'regular' | 'medium' | 'semiBold' | 'bold';
}

export function Text({ style, weight = 'regular', ...props }: TextProps) {
  const fontFamily = Fonts[weight];

  return (
    <RNText
      style={[styles.text, { fontFamily }, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: Fonts.regular,
  },
});
