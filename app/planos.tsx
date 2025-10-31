import { PlanCard } from '@/components/cards/PlanCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { AppColors } from '@/constants/theme';
import React from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Plan {
  id: string;
  name: string;
  period: string;
  price: number;
  badge?: {
    text: string;
    color?: string;
  };
}

export default function PlanosScreen() {

  const plans: Plan[] = [
    {
      id: '1',
      name: 'Monitora Ano',
      period: 'PLANO ANUAL',
      price: 59.99,
      badge: {
        text: 'MAIOR DESCONTO',
        color: '#FF9500',
      },
    },
    {
      id: '2',
      name: 'Monitora Trimestre',
      period: 'PLANO TRIMESTRAL',
      price: 35.00,
      badge: {
        text: 'MAIS POPULAR',
        color: '#FF9500',
      },
    },
    {
      id: '3',
      name: 'Monitora Mês',
      period: 'PLANO MENSAL',
      price: 15.00,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar
        barStyle="light-content"
        translucent={true}
      />

      {/* Header */}
      <AppHeader title='Planos' />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Plans List */}
        <View style={styles.plansList}>
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              name={plan.name}
              period={plan.period}
              price={plan.price}
              badge={plan.badge}
              onPress={() => console.log('Plano selecionado:', plan.name)}
            />
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
    alignSelf: 'center',
    width: '100%',
    ...Platform.select({
      web: {
        maxWidth: 720,
      },
    }),
    backgroundColor: AppColors.background.primary,
  },
  content: {
    flex: 1,
  },
  plansList: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
});
