import { PlanCard } from '@/components/cards/PlanCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { AppColors, Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
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
  const { user, updateUser } = useAuth();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

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
      price: 34.99,
      badge: {
        text: 'MAIS POPULAR',
        color: '#FF9500',
      },
    },
    {
      id: '3',
      name: 'Monitora Mês',
      period: 'PLANO MENSAL',
      price: 14.99,
    },
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleSubscribe = () => {
    if (!selectedPlanId) {
      Alert.alert('Atenção', 'Por favor, selecione um plano primeiro.');
      return;
    }

    const selectedPlan = plans.find(p => p.id === selectedPlanId);
    if (!selectedPlan) return;

    Alert.alert(
      'Confirmar Assinatura',
      `Deseja assinar o plano ${selectedPlan.name} por R$ ${selectedPlan.price.toFixed(2)}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              // Atualiza o plano do usuário no contexto
              await updateUser({ plano: selectedPlan.name });

              Alert.alert(
                'Sucesso!',
                `Sua assinatura do ${selectedPlan.name} foi ativada com sucesso!`,
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível processar sua assinatura.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar
          barStyle="light-content"
          translucent={true}
        />

        {/* Header */}
        <AppHeader title='Planos' />

        <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
          {/* Current Plan Info */}
          {user?.plano && (
            <View style={styles.currentPlanContainer}>
              <Text style={styles.currentPlanLabel}>Plano Atual:</Text>
              <Text style={styles.currentPlanName}>{user.plano}</Text>
            </View>
          )}

          {/* Plans List */}
          <View style={styles.plansList}>
            {plans.map((plan) => (
              <View key={plan.id}>
                <PlanCard
                  name={plan.name}
                  period={plan.period}
                  price={plan.price}
                  badge={plan.badge}
                  onPress={() => handleSelectPlan(plan.id)}
                />
                {selectedPlanId === plan.id && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedText}>✓ Selecionado</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Subscribe Button */}
          <View style={styles.buttonContainer}>
            <Button
              title="ASSINAR PLANO"
              variant="secondary"
              fullWidth
              onPress={handleSubscribe}
              disabled={!selectedPlanId}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: AppColors.background.secondary,
  },
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    ...Platform.select({
      web: {
        maxWidth: 720,
      },
    }),
  },
  content: {
    flex: 1,
  },
  currentPlanContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  currentPlanLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
    marginBottom: 4,
  },
  currentPlanName: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: AppColors.primary,
  },
  plansList: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  selectedIndicator: {
    marginTop: -12,
    marginBottom: 16,
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: AppColors.primary,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
});
