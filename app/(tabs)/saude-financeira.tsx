import { AppHeader } from '@/components';
import { AppColors } from '@/constants/theme';
import React from 'react';
import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SaudeFinanceiraScreen() {
  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar
          barStyle="light-content"
          translucent={true}
        />

        {/* Header */}
        <AppHeader title='Saúde Financeira' />
        <View style={styles.content}>
          <Text style={styles.title}>Saúde Financeira</Text>
          <Text style={styles.subtitle}>Em desenvolvimento...</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: AppColors.background.secondary,
  },
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    ...Platform.select({
      web: {
        maxWidth: 720,
      },
    }),
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.text.secondary,
  },
});
