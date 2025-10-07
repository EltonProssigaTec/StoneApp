import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppColors } from '@/constants/theme';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showSubtitle?: boolean;
}

export function Logo({ size = 'medium', showSubtitle = true }: LogoProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          iconSize: 40,
          titleSize: 20,
          subtitleSize: 12,
        };
      case 'large':
        return {
          iconSize: 80,
          titleSize: 40,
          subtitleSize: 18,
        };
      default:
        return {
          iconSize: 60,
          titleSize: 32,
          subtitleSize: 16,
        };
    }
  };

  const sizes = getSizeStyles();

  return (
    <View style={styles.container}>
      {/* Logo Icon - Simplificado com Text pois não temos SVG */}
      <View
        style={[
          styles.iconContainer,
          {
            width: sizes.iconSize,
            height: sizes.iconSize,
            borderRadius: sizes.iconSize * 0.2,
          },
        ]}
      >
        <Text
          style={[
            styles.iconText,
            { fontSize: sizes.iconSize * 0.6 },
          ]}
        >
          $
        </Text>
      </View>

      {/* Logo Text */}
      <View style={styles.textContainer}>
        <Text style={[styles.title, { fontSize: sizes.titleSize }]}>
          <Text style={styles.stoneText}>Stone</Text>
          <Text style={styles.upText}>UP</Text>
        </Text>
        {showSubtitle && (
          <Text style={[styles.subtitle, { fontSize: sizes.subtitleSize }]}>
            monitora
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconText: {
    color: AppColors.secondary,
    fontWeight: 'bold',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
  },
  stoneText: {
    color: AppColors.primary,
  },
  upText: {
    color: AppColors.secondary,
  },
  subtitle: {
    color: AppColors.primary,
    marginTop: 4,
  },
});
