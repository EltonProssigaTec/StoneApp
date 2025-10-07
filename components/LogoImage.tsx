import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface LogoImageProps {
  size?: 'small' | 'medium' | 'large';
}

export function LogoImage({ size = 'medium' }: LogoImageProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 80, height: 80 };
      case 'large':
        return { width: 200, height: 200 };
      default:
        return { width: 120, height: 120 };
    }
  };

  const dimensions = getSizeStyles();

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/logo.png')}
        style={[styles.logo, dimensions]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    // Dimensions set dynamically
  },
});
