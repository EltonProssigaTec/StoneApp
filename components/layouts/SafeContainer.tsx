import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';

interface SafeContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function SafeContainer({
  children,
  style,
}: SafeContainerProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.webContainer}>
        <View style={styles.content}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webContainer: {
    flex: 1,
    ...Platform.select({
      web: {
        justifyContent: 'center',
        alignItems: 'center',
      },
    }),
  },
  content: {
    flex: 1,
    width: '100%',
    ...Platform.select({
      web: {
        maxWidth: 720,
      },
    }),
  },
});
