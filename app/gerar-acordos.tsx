import { AppHeader } from '@/components/ui/AppHeader';
import { AppColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GerarAcordosScreen() {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar
          barStyle="light-content"
          translucent={true}
        />

        {/* Header */}
        <AppHeader title='Geração de Acordos' />
        <View style={styles.content}>
        <Text style={styles.title}>Geração de Acordos</Text>
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
  header: {
    backgroundColor: AppColors.primary,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.white,
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
