import { LogoImage } from '@/components/LogoImage';
import { AppColors, Gradients } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();
  const { isLogged, loading } = useAuth();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const [hasNavigated, setHasNavigated] = useState(false);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Só navegar quando o loading terminar e ainda não tiver navegado
    if (!loading && !hasNavigated) {
      navigationTimeoutRef.current = setTimeout(() => {
        setHasNavigated(true);

        if (isLogged) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/login');
        }
      }, 2500);
    }

    // Cleanup: limpar o timeout se o componente for desmontado
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [loading, isLogged, hasNavigated, router]);

  return (
    <View style={styles.container}>
      {/* Onda decorativa superior com gradiente laranja */}
      <LinearGradient
        {...Gradients.secondary}
        style={styles.waveTopOrange}
      />

      {/* Onda decorativa superior com gradiente azul */}
      <LinearGradient
        {...Gradients.primary}
        style={styles.waveTop}
      />

      {/* Logo animado */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <LogoImage size="extra" />
      </Animated.View>

      {/* Onda decorativa inferior com gradiente azul */}
      <LinearGradient
        {...Gradients.primary}
        style={styles.waveBottom}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveTop: {
    position: 'absolute',
    top: -40,
    left: -10,
    right: 0,
    height: 120,
    width: "120%",
    transform: "rotate(-6deg)"
  },
  waveTopOrange: {
    position: 'absolute',
    top: 0,
    right: -40,
    width: '120%',
    height: 120,
    transform: "rotate(10deg)"
  },
  waveBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 110,
    transform: [{ scaleX: 2 }],
  },
});
