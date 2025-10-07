import { DebtCard, MenuItem } from '@/components/cards';
import { Card, ScreenHeader, SideMenu } from '@/components/ui';
import { AppColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  const menuItems = [
    { icon: 'creditcard.fill', title: 'Meu CPF/CNPJ', route: '/my-cpf' },
    { icon: 'exclamationmark.triangle.fill', title: 'Pendências Financeiras', route: '/pendencias' },
    { icon: 'tag.fill', title: 'Ofertas', route: '/ofertas' },
    { icon: 'doc.text.fill', title: 'Meus Acordos', route: '/acordos' },
    { icon: 'person.fill', title: 'Meu Plano', route: '/planos' },
    { icon: 'chart.bar.fill', title: 'Geração de Acordos', route: '/gerar-acordos' },
  ];

  return (
    <ScrollView style={styles.container}>

        <ScreenHeader
          title="Home"
          showMenu
          showAvatar
          onMenuPress={() => setMenuVisible(true)}
        />        
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Bem vindo, RAFAEL</Text>
          <Text style={styles.planText}>Plano Premium</Text>
        </View>
        <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
        {/* Welcome Section */}

      <View style={styles.wrapper}>
        <View style={styles.contentWrapper}>
          <View style={styles.scrollContainer}>


            {/* Debt Card */}
            <View style={styles.content}>
              <DebtCard
                amount={2500.00}
                updatedAt="02/09/2025"
                variant="primary"
                showEyeIcon
                style={styles.debtCard}
              />

              {/* Menu Grid */}
              <View style={styles.menuGrid}>
                {menuItems.map((item, index) => (
                  <MenuItem
                    key={index}
                    icon={item.icon}
                    title={item.title}
                    onPress={() => router.push(item.route as any)}
                  />
                ))}
              </View>

              {/* Promo Banner */}
              <Card style={styles.promoBanner}>
                <View style={styles.promoContent}>
                  <View style={styles.promoIcon}>
                    <Text style={styles.promoIconText}>B</Text>
                  </View>
                  <View style={styles.promoText}>
                    <Text style={styles.promoTitle}>Aproveite nossas ofertas</Text>
                    <Text style={styles.promoSubtitle}>e limpe já o seu nome!</Text>
                  </View>
                </View>
              </Card>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background.secondary,
  },
  safeArea: {
    backgroundColor: AppColors.primary,
  },
  wrapper: {
    flex: 1,
    ...Platform.select({
      web: {
        justifyContent: 'center',
        alignItems: 'center',
      },
    }),
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    ...Platform.select({
      web: {
        maxWidth: 720,
      },
    }),
  },
  scrollContainer: {
    flex: 1,
  },
  welcomeSection: {
    backgroundColor: "transparent",
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.white,
  },
  planText: {
    fontSize: 14,
    color: AppColors.white,
    opacity: 0.9,
    marginTop: 4,
  },
  content: {
    flex: 1,
    backgroundColor: AppColors.background.secondary,
  },
  debtCard: {
    marginHorizontal: 20,
    marginTop: -12,
    marginBottom: 20,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  promoBanner: {
    backgroundColor: AppColors.primary,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: AppColors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  promoIconText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: AppColors.white,
  },
  promoText: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.white,
  },
  promoSubtitle: {
    fontSize: 14,
    color: AppColors.white,
    marginTop: 2,
  },
});
