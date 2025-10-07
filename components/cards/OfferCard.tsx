import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { AppColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface OfferCardProps {
  company: string;
  discount: number;
  originalAmount: number;
  discountedAmount: number;
  onPress?: () => void;
  onMenuPress?: () => void;
}

export function OfferCard({
  company,
  discount,
  originalAmount,
  discountedAmount,
  onPress,
  onMenuPress,
}: OfferCardProps) {
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.company}>{company}</Text>
        <TouchableOpacity onPress={onMenuPress}>
          <IconSymbol name="ellipsis" size={20} color={AppColors.gray[600]} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressBar, { width: `${discount}%` }]} />
        </View>
        <Text style={styles.discountText}>{discount}% de desconto</Text>
      </View>

      {/* Amount Info */}
      <View style={styles.amountInfo}>
        <Text style={styles.amountLabel}>
          De R$ {originalAmount.toFixed(2)} por{' '}
          <Text style={styles.amountHighlight}>
            R$ {discountedAmount.toFixed(2)}
          </Text>
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  company: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.text.primary,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBackground: {
    height: 8,
    backgroundColor: AppColors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: AppColors.secondary,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 14,
    color: AppColors.text.secondary,
  },
  amountInfo: {
    marginTop: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: AppColors.text.secondary,
  },
  amountHighlight: {
    fontWeight: 'bold',
    color: AppColors.primary,
  },
});
