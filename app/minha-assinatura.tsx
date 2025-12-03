/**
 * Tela de Gerenciamento de Assinatura
 * Mostra detalhes da assinatura ativa e permite cancelamento
 */

import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { useAlert } from '@/components/ui/AlertModal';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import subscriptionService, { Subscription } from '@/services/subscription';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MinhaAssinaturaScreen() {
  const { updateUser } = useAuth();
  const { showAlert, AlertComponent } = useAlert();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    setLoading(true);
    const active = await subscriptionService.getActiveSubscription();
    setSubscription(active);
    setLoading(false);

    if (!active) {
      showAlert('Sem Assinatura', 'Você não possui uma assinatura ativa', [
        {
          text: 'Ver Planos',
          onPress: () => router.replace('/planos'),
        },
      ], 'info');
    }
  };

  const handleCancelSubscription = () => {
    showAlert(
      'Cancelar Assinatura',
      'Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos benefícios premium.',
      [
        {
          text: 'Não',
          style: 'cancel',
        },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await subscriptionService.cancelSubscription();
              await updateUser({ plano: undefined });
              showAlert(
                'Assinatura Cancelada',
                'Sua assinatura foi cancelada com sucesso',
                [
                  {
                    text: 'Ver Planos',
                    onPress: () => router.replace('/planos'),
                  },
                  {
                    text: 'Ir para Home',
                    onPress: () => router.replace('/(tabs)/home'),
                  },
                ],
                'success'
              );
            } catch (error) {
              showAlert('Erro', 'Não foi possível cancelar a assinatura', undefined, 'error');
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
      'warning'
    );
  };

  if (loading) {
    return (
      <View style={styles.wrapper}>
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <AppHeader title="Minha Assinatura" showBackButton />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AppColors.primary} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!subscription) {
    return null;
  }

  const daysRemaining = Math.ceil(
    (new Date(subscription.endDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar barStyle="light-content" translucent={true} />

        <AppHeader title="Minha Assinatura" showBackButton />

        <AlertComponent />

        <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>ATIVA</Text>
            </View>
            <Text style={styles.planName}>{subscription.planName}</Text>
            <Text style={styles.planPrice}>
              {subscriptionService.formatPrice(subscription.amount)}
            </Text>
          </View>

          {/* Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalhes da Assinatura</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Plano</Text>
              <Text style={styles.detailValue}>{subscription.planName}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={[styles.detailValue, styles.statusActive]}>
                {subscription.status === 'active' ? 'Ativo' : 'Inativo'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Data de Início</Text>
              <Text style={styles.detailValue}>
                {subscriptionService.formatDate(subscription.startDate)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Renovação</Text>
              <Text style={styles.detailValue}>
                {subscriptionService.formatDate(subscription.endDate)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Dias Restantes</Text>
              <Text style={styles.detailValue}>{daysRemaining} dias</Text>
            </View>

            {subscription.paymentMethod && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Método de Pagamento</Text>
                <Text style={styles.detailValue}>
                  {subscription.paymentMethod === 'pix'
                    ? 'PIX'
                    : subscription.paymentMethod === 'credit_card'
                    ? 'Cartão de Crédito'
                    : 'Boleto'}
                </Text>
              </View>
            )}
          </View>

          {/* Benefits Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Benefícios Ativos</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>
                  Consultas ilimitadas de pendências
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>
                  Notificações em tempo real
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>
                  Histórico completo de consultas
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>Suporte prioritário</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <Button
              title="Ver Outros Planos"
              variant="secondary"
              fullWidth
              onPress={() => router.push('/planos')}
            />
            <Button
              title={cancelling ? 'Cancelando...' : 'Cancelar Assinatura'}
              variant="outline"
              fullWidth
              onPress={handleCancelSubscription}
              disabled={cancelling}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    backgroundColor: AppColors.background.primary,
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: AppColors.primary,
  },
  statusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.primary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: AppColors.background.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: AppColors.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text.primary,
  },
  statusActive: {
    color: '#10B981',
  },
  benefitsList: {
    backgroundColor: AppColors.background.primary,
    borderRadius: 12,
    padding: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 18,
    color: '#10B981',
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    color: AppColors.text.primary,
    flex: 1,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
});
