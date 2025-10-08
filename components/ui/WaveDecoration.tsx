import { AppColors, Gradients } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet } from 'react-native';

interface WaveDecorationProps {
  variant?: 'login' | 'splash' | 'small';
}

export function WaveDecoration({ variant = 'login' }: WaveDecorationProps) {
  if (variant === 'splash') {
    return (
      <>
        {/* Onda decorativa superior com gradiente laranja */}
        <LinearGradient
          {...Gradients.secondary}
          style={styles.splashTopOrange}
        />

        {/* Onda decorativa superior com gradiente azul */}
        <LinearGradient
          {...Gradients.primary}
          style={styles.splashTop}
        />
        {/* Onda decorativa inferior com gradiente azul */}
        <LinearGradient
          {...Gradients.primary}
          style={styles.splashBottom}
        />
        {/* <View style={styles.splashTop} />
        <View style={styles.splashTopOrange} />
        <View style={styles.splashBottom} /> */}
      </>
    );
  }

  if (variant === 'small') {
    return (
      <>
        {/* Onda decorativa superior com gradiente laranja */}
        <LinearGradient
          {...Gradients.secondary}
          style={styles.smallOrange}
        />

        {/* Onda decorativa superior com gradiente azul */}
        <LinearGradient
          {...Gradients.primary}
          style={styles.smallBlue}
        />
        {/* <View style={styles.smallBlue} />
        <View style={styles.smallOrange} /> */}
      </>
    );
  }

  return (
    <>
      {/* Onda decorativa superior com gradiente laranja */}
      <LinearGradient
        {...Gradients.secondary}
        style={styles.loginOrange}
      />

      {/* Onda decorativa superior com gradiente azul */}
      <LinearGradient
        {...Gradients.primary}
        style={styles.loginBlue}
      />
      {/* <View style={styles.loginOrange} />
      <View style={styles.loginBlue} /> */}
    </>
  );
}

const styles = StyleSheet.create({
  // Login variant
  loginBlue: {
    position: 'absolute',
    top: -5,
    left: 0,
    width: "35%",
    height: 40,
    backgroundColor: AppColors.primary,
    transform: "rotate(3deg)"
  },
  loginOrange: {
    position: 'absolute',
    top: 10,
    left: 0,
    width: "24%",
    height: 40,
    backgroundColor: AppColors.secondary,
    transform: "rotate(5deg)"
  },

  // Splash variant
  splashTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: AppColors.primary,
    borderBottomLeftRadius: 120,
    borderBottomRightRadius: 120,
    transform: [{ scaleX: 2 }],
  },
  splashTopOrange: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '50%',
    height: 100,
    backgroundColor: AppColors.secondary,
    borderBottomLeftRadius: 100,
    transform: [{ scaleY: 0.8 }],
  },
  splashBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: AppColors.primary,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    transform: [{ scaleX: 2 }],
  },

  // Small variant
  smallBlue: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 120,
    height: 60,
    backgroundColor: AppColors.primary,
    borderBottomRightRadius: 60,
  },
  smallOrange: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 200,
    height: 50,
    backgroundColor: AppColors.secondary,
    borderBottomLeftRadius: 50,
  },
});
