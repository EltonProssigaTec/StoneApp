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

interface AuthLayoutProps {
  children: React.ReactNode;
  showLogo?: boolean;
  logoSize?: 'small' | 'medium' | 'large';
  waveVariant?: 'login' | 'splash' | 'small';
}

export function AuthLayout({
  children,
  showLogo = true,
  logoSize = 'medium',
  waveVariant = 'small',
}: AuthLayoutProps) {
  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <WaveDecoration variant={waveVariant} />

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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
    </View>
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
  scrollContent: {
    flexGrow: 1,
  },
  responsiveContainer: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  content: {
    flex: 1,
  },
});
