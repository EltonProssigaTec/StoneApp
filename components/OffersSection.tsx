import { AppColors, Fonts } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from './ui/Button';
import { IconSymbol } from './ui/icon-symbol';

import type { StyleProp, ViewStyle } from 'react-native';

export interface OffersSectionProps {
  /** Used to override the default root style. */
  style?: StyleProp<ViewStyle>;
  /** Used to locate this view in end-to-end tests. */
  testID?: string;
  /** Valor total das dívidas */
  amount: number;
  /** Data de atualização */
  updatedAt: string;
  /** Callback para o botão de pagar */
  onPayPress?: () => void;
  /** Callback para o menu (três pontos) */
  onMenuPress?: () => void;
}

export function OffersSection(props: OffersSectionProps) {
  const { amount, updatedAt, onPayPress, onMenuPress, style, testID } = props;

  return (
    <View testID={testID ?? "offers-section"} style={[styles.root, style]}>
      <LinearGradient
        colors={['#0195D8', '#0164AE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.background}
      >
        {/* Header com título centralizado */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.title}>Ofertas</Text>
          {onMenuPress ? (
            <TouchableOpacity onPress={onMenuPress} activeOpacity={0.7} style={styles.menuButton}>
              <IconSymbol name="ellipsis" size={24} color={AppColors.white} />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>

        {/* Card de dívidas */}
        <View style={styles.card}>
          <LinearGradient
            colors={['#0164AE', '#0195D8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cardBackground}
          />

          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>MINHAS DÍVIDAS</Text>

            <View style={styles.amountContainer}>
              <Text style={styles.amount}>
                R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              {onPayPress && (
                <Button
                  title="PAGAR"
                  variant="secondary"
                  compact
                  onPress={onPayPress}
                />
              )}
            </View>

            <Text style={styles.updatedAt}>
              Atualizado em {updatedAt}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  background: {
    width: '100%',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Platform.select({
      web: {
        maxWidth: 720,
        marginHorizontal: 'auto',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerSpacer: {
    width: 24,
  },
  menuButton: {
    width: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.semiBold,
    color: AppColors.white,
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContent: {
    padding: 14,
  },
  cardLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: AppColors.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.7,
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amount: {
    fontSize: 26,
    fontFamily: Fonts.medium,
    color: AppColors.white,
    letterSpacing: 1,
  },
  updatedAt: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: AppColors.white,
    letterSpacing: 1,
    opacity: 0.7,
  },
});
