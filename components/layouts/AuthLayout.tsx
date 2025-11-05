import { LogoImage } from '@/components/LogoImage';
import { WaveDecoration } from '@/components/ui/WaveDecoration';
import { AppColors } from '@/constants/theme';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AuthLayoutProps {
  children: React.ReactNode;
  showLogo?: boolean;
  logoSize?: 'small' | 'medium' | 'large';
  waveVariant?: 'login' | 'splash' | 'small';
}

export function AuthLayout({
  children,
  showLogo = true,
  logoSize = 'large',
  waveVariant = 'small',
}: AuthLayoutProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.waveContainer}>
          <WaveDecoration variant={waveVariant} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.responsiveContainer}>
            {showLogo && (
              <View style={styles.logoContainer}>
                <LogoImage size={logoSize} />
              </View>
            )}

            <View style={styles.content}>{children}</View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  wrapper: {
    flex: 1,
    ...Platform.select({
      web: {
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: 720,
        marginHorizontal: 'auto',
        width: '100%',
      },
    }),
  },
  waveContainer: {
    width: '100%',
    height: 65,
    backgroundColor: AppColors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  responsiveContainer: {
    paddingHorizontal: 32,
    ...Platform.select({
      web: {
        maxWidth: 720,
      },
    }),
  },
  logoContainer: {
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
});
