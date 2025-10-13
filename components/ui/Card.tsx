import { AppColors } from '@/constants/theme';
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  elevated?: boolean;
}

export function Card({ children, elevated = true, style, ...props }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        elevated && styles.elevated,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.white,
    borderRadius: 12,
    padding: 16,
  },
  elevated: {
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
});
