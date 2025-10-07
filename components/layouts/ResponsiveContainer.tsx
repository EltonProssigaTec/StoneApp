import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  centered?: boolean;
}

export function ResponsiveContainer({
  children,
  style,
  centered = true,
}: ResponsiveContainerProps) {
  return (
    <View style={[styles.wrapper, centered && styles.centered]}>
      <View style={[styles.container, style]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
  },
  centered: Platform.select({
    web: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    default: {},
  }),
  container: {
    flex: 1,
    width: '100%',
    ...Platform.select({
      web: {
        maxWidth: 720,
      },
    }),
  },
});
