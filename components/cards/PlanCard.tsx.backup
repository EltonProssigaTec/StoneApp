import { Card } from '@/components/ui/Card';
import { AppColors, Fonts } from '@/constants/theme';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PlanCardProps {
  name: string;
  period: string;
  price: number;
  badge?: {
    text: string;
    color?: string;
  };
  onPress?: () => void;
  autoRenewal?: boolean;
}

export function PlanCard({ name, period, price, badge, onPress, autoRenewal = true }: PlanCardProps) {
  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      style={styles.wrapper}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Card style={styles.container}>
        {/* Badge Diagonal */}
        {badge && (
          <View style={[styles.diagonalBadge, { backgroundColor: badge.color || '#FF9500' }]}>
            <Text style={styles.badgeText}>{badge.text}</Text>
          </View>
        )}

        {/* Conteúdo Principal */}
        <View style={styles.content}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.period}>{period}</Text>
          <Text style={styles.price}>R$ {price.toFixed(2).replace('.', ',')}</Text>
          {autoRenewal && (
            <Text style={styles.renewal}>RENOVAÇÃO AUTOMÁTICA</Text>
          )}
        </View>

        {/* Logo StoneUP */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </Card>
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  container: {
    overflow: 'hidden',
    position: 'relative',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  diagonalBadge: {
    position: 'absolute',
    top: 30,
    right: -110,
    width: 320,
    paddingVertical: 6,
    paddingHorizontal: 8,
    zIndex: 10,
    transform: [{ rotate: '35deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 6,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: AppColors.black,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  content: {
    paddingRight: 0,
  },
  name: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: AppColors.primary,
    marginBottom: 4,
  },
  period: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  price: {
    fontSize: 24,
    fontFamily: Fonts.medium,
    color: AppColors.text.primary,
    marginBottom: 12,
  },
  renewal: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: AppColors.text.secondary,
    letterSpacing: 0.3,
  },
  logoContainer: {
    position: 'absolute',
    right: 20,
    bottom: 24,
  },
  logo: {
    width: 90,
    height: 50,
  },
});
