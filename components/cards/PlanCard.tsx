import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/Logo';
import { AppColors } from '@/constants/theme';

interface PlanCardProps {
  name: string;
  period: string;
  price: number;
  discount?: string;
}

export function PlanCard({ name, period, price, discount }: PlanCardProps) {
  return (
    <Card style={styles.container}>
      {discount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{discount}</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.period}>{period}</Text>
        <Text style={styles.price}>
          R$ {price.toFixed(2)}
        </Text>
        <Text style={styles.renewal}>RENOVAÇÃO AUTOMÁTICA</Text>
      </View>

      <View style={styles.logoContainer}>
        <Logo size="small" showSubtitle={false} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    overflow: 'visible',
    position: 'relative',
  },
  discountBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: AppColors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
    zIndex: 1,
    transform: [{ rotate: '2deg' }],
  },
  discountText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: AppColors.white,
  },
  content: {
    paddingTop: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.primary,
    marginBottom: 4,
  },
  period: {
    fontSize: 12,
    color: AppColors.text.secondary,
    marginBottom: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 8,
  },
  renewal: {
    fontSize: 11,
    color: AppColors.text.secondary,
  },
  logoContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
