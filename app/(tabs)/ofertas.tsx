import { AppHeader, DebtCard } from '@/components';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppColors } from '@/constants/theme';
import { router } from 'expo-router';
import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Offer {
  id: string;
  company: string;
  discount: number;
  originalAmount: number;
  discountedAmount: number;
}

export default function OfertasScreen() {
  const offers: Offer[] = [
    {
      id: '1',
      company: 'STONE TESTE',
      discount: 67,
      originalAmount: 8000,
      discountedAmount: 2640,
    },
    {
      id: '2',
      company: 'STONE TESTE',
      discount: 67,
      originalAmount: 8000,
      discountedAmount: 2640,
    },
    {
      id: '3',
      company: 'STONE TESTE',
      discount: 67,
      originalAmount: 8000,
      discountedAmount: 2640,
    },
  ];

  const totalDebt = 2500.00;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}

      <AppHeader title='Ofertas' onBackPress={() => router.back()} onMenuPress={undefined} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
              {/* Debt Card */}
      <DebtCard amount={totalDebt} updatedAt={'14/10/2025'} />

        {/* Offers List */}
        <View style={styles.offersList}>
          {offers.map((offer) => (
            <Card key={offer.id} style={styles.offerCard}>
              <View style={styles.offerHeader}>
                <Text style={styles.offerCompany}>{offer.company}</Text>
                <TouchableOpacity>
                  <IconSymbol
                    name="ellipsis"
                    size={20}
                    color={AppColors.gray[600]}
                  />
                </TouchableOpacity>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBackground}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${offer.discount}%` },
                    ]}
                  />
                </View>
                <Text style={styles.discountText}>{offer.discount}% de desconto</Text>
              </View>

              {/* Amount Info */}
              <View style={styles.amountInfo}>
                <Text style={styles.amountLabel}>
                  De R$ {offer.originalAmount.toFixed(2)} por{' '}
                  <Text style={styles.amountHighlight}>
                    R$ {offer.discountedAmount.toFixed(2)}
                  </Text>
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignSelf: "center",
    ...Platform.select({
      web: {
        maxWidth: 720,
      },
    }),
    backgroundColor: AppColors.background.primary,
  },
  header: {
    backgroundColor: AppColors.primary,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.white,
  },
  debtCard: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  debtLabel: {
    fontSize: 12,
    color: AppColors.white,
    fontWeight: '600',
  },
  payButton: {
    backgroundColor: AppColors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  payButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: AppColors.white,
  },
  debtAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: AppColors.white,
    marginBottom: 4,
  },
  debtDate: {
    fontSize: 12,
    color: AppColors.white,
    opacity: 0.8,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  offersList: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  offerCard: {
    marginBottom: 16,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  offerCompany: {
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
