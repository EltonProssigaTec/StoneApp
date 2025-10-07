import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LogoImage } from '@/components/LogoImage';
import { AppColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface Plan {
  id: string;
  name: string;
  period: string;
  price: number;
  discount?: string;
  featured?: boolean;
}

export default function PlanosScreen() {
  const router = useRouter();

  const plans: Plan[] = [
    {
      id: '1',
      name: 'Monitora Ano',
      period: 'PLANO ANUAL',
      price: 59.99,
      discount: 'VÁRIOS DESCONTOS',
      featured: true,
    },
    {
      id: '2',
      name: 'Monitora Trimestre',
      period: 'PLANO TRIMESTRAL',
      price: 35.00,
    },
    {
      id: '3',
      name: 'Monitora Mês',
      period: 'PLANO MENSAL',
      price: 15.00,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={AppColors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PLANOS</Text>
        <TouchableOpacity>
          <IconSymbol name="ellipsis" size={24} color={AppColors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Plans List */}
        <View style={styles.plansList}>
          {plans.map((plan) => (
            <Card key={plan.id} style={styles.planCard}>
              {plan.discount && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{plan.discount}</Text>
                </View>
              )}

              <View style={styles.planContent}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPeriod}>{plan.period}</Text>
                <Text style={styles.planPrice}>R$ {plan.price.toFixed(2)}</Text>
                <Text style={styles.planRenewal}>RENOVAÇÃO AUTOMÁTICA</Text>
              </View>

              <View style={styles.logoContainer}>
                <LogoImage size="small" />
              </View>
            </Card>
          ))}
        </View>

        {/* Subscribe Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="SIMULAR ASSINATURA"
            variant="secondary"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background.secondary,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.white,
  },
  content: {
    flex: 1,
  },
  plansList: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  planCard: {
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
  planContent: {
    paddingTop: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.primary,
    marginBottom: 4,
  },
  planPeriod: {
    fontSize: 12,
    color: AppColors.text.secondary,
    marginBottom: 12,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 8,
  },
  planRenewal: {
    fontSize: 11,
    color: AppColors.text.secondary,
  },
  logoContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
});
