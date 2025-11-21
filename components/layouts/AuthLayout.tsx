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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.wrapper}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.waveContainer}>
            <WaveDecoration variant={waveVariant} />
          </View>

          <ScrollView
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background.secondary,
  },
  wrapper: {
    flex: 1,
    ...Platform.select({
      web: {
        justifyContent: 'center',
        alignItems: 'center',
      },
    }),
  },
  keyboardView: {
    flex: 1,
    width: '100%',
    ...Platform.select({
      web: {
        maxWidth: 720,
      },
    }),
  },
  waveContainer: {
    width: '100%',
    height: 70,
    backgroundColor: AppColors.background.secondary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  responsiveContainer: {
    flex: 1,
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
});
