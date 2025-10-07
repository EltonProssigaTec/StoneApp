import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Card } from '@/components/ui/Card';
import { AppColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface DebtCardProps {
  amount: number;
  updatedAt?: string;
  showEyeIcon?: boolean;
  onEyePress?: () => void;
  variant?: 'primary' | 'card';
  style?: ViewStyle;
}

export function DebtCard({
  amount,
  updatedAt,
  showEyeIcon = true,
  onEyePress,
  variant = 'card',
  style,
}: DebtCardProps) {
  const isPrimary = variant === 'primary';

  const Container = isPrimary ? View : Card;
  const containerStyle = [
    isPrimary ? styles.primaryContainer : styles.cardContainer,
    style,
  ];

  return (
    <Container style={containerStyle}>
      <View style={styles.header}>
        <Text style={[styles.label, isPrimary && styles.labelPrimary]}>
          MINHAS DÍVIDAS
        </Text>
        {showEyeIcon && (
          <TouchableOpacity onPress={onEyePress}>
            <IconSymbol
              name="eye.fill"
              size={20}
              color={isPrimary ? AppColors.white : AppColors.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.amount, isPrimary && styles.amountPrimary]}>
        ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </Text>

      {updatedAt && (
        <Text style={[styles.date, isPrimary && styles.datePrimary]}>
          Atualizado em {updatedAt}
        </Text>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  primaryContainer: {
    backgroundColor: AppColors.primary,
    padding: 20,
    borderRadius: 12,
  },
  cardContainer: {
    backgroundColor: AppColors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.text.secondary,
  },
  labelPrimary: {
    color: AppColors.white,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  amountPrimary: {
    color: AppColors.white,
  },
  date: {
    fontSize: 12,
    color: AppColors.text.secondary,
  },
  datePrimary: {
    color: AppColors.white,
    opacity: 0.8,
  },
});
