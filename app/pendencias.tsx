import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Debt {
  id: string;
  company: string;
  amount: number;
  icon: string;
}

export default function PendenciasScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'tudo' | 'negociacoes' | 'promocoes'>('tudo');

  const debts: Debt[] = [
    { id: '1', company: 'BEMOL', amount: 1000.00, icon: 'B' },
    { id: '2', company: 'TIM', amount: 1044.00, icon: 'T' },
    { id: '3', company: 'AMERICANAS', amount: 1000.00, icon: 'A' },
    { id: '4', company: 'MARISA', amount: 1000.00, icon: 'M' },
    { id: '5', company: 'RIACHUELO', amount: 1100.00, icon: 'R' },
  ];

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
            <TouchableOpacity key={debt.id}>
              <Card style={styles.debtCard}>
                <View style={styles.debtContent}>
                  <View style={styles.debtIcon}>
                    <Text style={styles.debtIconText}>{debt.icon}</Text>
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
            </TouchableOpacity>
          ))}
        </View>

        {/* Total Section */}
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
      </ScrollView>
    </SafeAreaView >
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: AppColors.white,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: AppColors.secondary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text.secondary,
  },
  activeTabText: {
    color: AppColors.white,
  },
  debtList: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  debtCard: {
    marginBottom: 12,
  },
  debtContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  debtIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  debtIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  debtInfo: {
    flex: 1,
  },
  debtCompany: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  debtAmount: {
    fontSize: 14,
    color: AppColors.text.secondary,
  },
  totalSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text.primary,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  generateButton: {
    marginTop: 8,
  },
});
