import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppColors, Fonts } from '@/constants/theme';
import React, { useState } from 'react';
import {
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

export default function PendenciasScreen() {
  const [activeTab, setActiveTab] = useState<'tudo' | 'negociacoes' | 'promocoes'>('tudo');

  const debts: Debt[] = [
    { id: '1', company: 'BEMOL', amount: 1000.00, logo: require('@/assets/images/bemol1.png') },
    { id: '2', company: 'TIM', amount: 1044.00, logo: require('@/assets/images/tim.png') },
    { id: '3', company: 'AMERICANAS', amount: 1000.00, logo: require('@/assets/images/americanas.png') },
    { id: '4', company: 'MARISA', amount: 1000.00, logo: require('@/assets/images/marisa.png') },
    { id: '5', company: 'RIACHUELO', amount: 1100.00, logo: require('@/assets/images/riachuelo.png') },
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
    backgroundColor: AppColors.background.secondary,
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
});
