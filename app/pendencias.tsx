import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppColors, Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { DividasService, Divida } from '@/services/dividas.service';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Debt {
  id: string;
  company: string;
  amount: number;
  logo: ImageSourcePropType;
}

// Mapeamento de logos por credor
const LOGO_MAP: Record<string, any> = {
  'BEMOL': require('@/assets/images/bemol1.png'),
  'TIM': require('@/assets/images/tim.png'),
  'AMERICANAS': require('@/assets/images/americanas.png'),
  'MARISA': require('@/assets/images/marisa.png'),
  'RIACHUELO': require('@/assets/images/riachuelo.png'),
};

export default function PendenciasScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'tudo' | 'negociacoes' | 'promocoes'>('tudo');
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDividas();
  }, [user]);

  const loadDividas = async () => {
    if (!user?.cpf_cnpj) {
      setError('CPF/CNPJ não encontrado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await DividasService.listar(user.cpf_cnpj);
      setDividas(data);
    } catch (err: any) {
      console.error('Erro ao carregar dívidas:', err);
      setError('Erro ao carregar pendências');
    } finally {
      setLoading(false);
    }
  };

  // Converte dívidas da API para o formato Debt
  const debts: Debt[] = dividas.map((divida) => ({
    id: divida.id,
    company: divida.credor?.toUpperCase() || 'EMPRESA',
    amount: divida.valor || 0,
    logo: LOGO_MAP[divida.credor?.toUpperCase()] || require('@/assets/images/bemol1.png'),
  }));

  const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar
        barStyle="light-content"
        translucent={true}
      />

      {/* Header */}
      <AppHeader title='Pendências Financeiras' />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AppColors.primary} />
            <Text style={styles.loadingText}>Carregando pendências...</Text>
          </View>
        )}

        {/* Error State */}
        {!loading && error && (
          <View style={styles.errorContainer}>
            <IconSymbol name="exclamationmark.triangle" size={48} color={AppColors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadDividas}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {!loading && !error && debts.length === 0 && (
          <View style={styles.emptyContainer}>
            <IconSymbol name="checkmark.circle" size={64} color={AppColors.success} />
            <Text style={styles.emptyTitle}>Nenhuma pendência encontrada</Text>
            <Text style={styles.emptyText}>Você não possui dívidas no momento.</Text>
          </View>
        )}

        {/* Content - só renderiza se não estiver carregando, sem erro e com dívidas */}
        {!loading && !error && debts.length > 0 && (
          <>
            {/* Tabs */}
            <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tudo' && styles.activeTab]}
            onPress={() => setActiveTab('tudo')}
          >
            <Text style={[styles.tabText, activeTab === 'tudo' && styles.activeTabText]}>
              Tudo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'negociacoes' && styles.activeTab]}
            onPress={() => setActiveTab('negociacoes')}
          >
            <Text style={[styles.tabText, activeTab === 'negociacoes' && styles.activeTabText]}>
              Negociações
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'promocoes' && styles.activeTab]}
            onPress={() => setActiveTab('promocoes')}
          >
            <Text style={[styles.tabText, activeTab === 'promocoes' && styles.activeTabText]}>
              Promoções
            </Text>
          </TouchableOpacity>
        </View>

        {/* Debt List */}
        <View style={styles.debtList}>
          {debts.map((debt) => (
            <View key={debt.id} style={styles.debtCardWrapper}>
              <Pressable
                style={({ pressed }) => [
                  styles.pressableContainer,
                  pressed && styles.debtCardPressed,
                ]}
                android_ripple={null}
                android_disableSound={true}
              >
                <Card style={styles.debtCard} elevated={false}>
                  <View style={styles.debtContent}>
                    <View style={styles.debtIcon}>
                      <Image
                        source={debt.logo}
                        style={styles.debtLogo}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.debtInfo}>
                      <Text style={styles.debtCompany}>{debt.company}</Text>
                      <Text style={styles.debtAmount}>
                        R$ {debt.amount.toFixed(2)}
                      </Text>
                    </View>
                    <IconSymbol
                      name="chevron.right"
                      size={20}
                      color={AppColors.gray[400]}
                    />
                  </View>
                </Card>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Total Section */}
        <View style={styles.containerTotalSection}>
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Dívida total:</Text>
              <Text style={styles.totalAmount}>R$ {totalDebt.toFixed(2)}</Text>
            </View>
            <Button
              title="GERAR BOLETO"
              variant="secondary"
              fullWidth
              style={styles.generateButton}
            />
          </View>
        </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    flex: 1,
    width: '100%',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.white,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 4,
    gap: 8
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: AppColors.background.primary,
  },
  activeTab: {
    backgroundColor: AppColors.secondary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: AppColors.text.secondary,
  },
  activeTabText: {
    color: AppColors.white,
  },
  debtList: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  debtCardWrapper: {
    marginBottom: 6,
  },
  pressableContainer: {
    borderWidth: 0,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      android: {
        elevation: 0,
        borderColor: 'transparent',
        outlineWidth: 0,
        outlineColor: 'transparent',
      },
      ios: {
        borderWidth: 0,
      },
    }),
  },
  debtCardPressed: {
    opacity: 0.7,
  },
  debtCard: {
    borderWidth: 0,
  },
  debtContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  debtIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  debtLogo: {
    width: 48,
    height: 48,
  },
  debtInfo: {
    flex: 1,
  },
  debtCompany: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  debtAmount: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
  },
  totalSection: {
    padding: 20,
  },
  containerTotalSection: {
    backgroundColor: AppColors.background.primary,
    borderRadius: 16,
    marginTop: 16,
    marginHorizontal: 20,
    elevation: 1,
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: AppColors.text.primary,
  },
  totalAmount: {
    fontSize: 20,
    fontFamily: Fonts.semiBold,
    color: AppColors.primary,
  },
  generateButton: {
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: AppColors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: AppColors.text.secondary,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: AppColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  retryButtonText: {
    color: AppColors.white,
    fontSize: 14,
    fontFamily: Fonts.semiBold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: AppColors.text.primary,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
    textAlign: 'center',
  },
});
