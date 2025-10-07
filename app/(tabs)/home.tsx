import { DebtCard, MenuItem } from '@/components/cards';
import { Card, ScreenHeader, SideMenu } from '@/components/ui';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { DividasService, ResumoFinanceiro } from '@/services/dividas.service';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Section } from '@/components/teste';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [loading, setLoading] = useState(true);

  // Busca resumo financeiro
  useEffect(() => {
    const fetchResumo = async () => {
      if (user?.cpf_cnpj) {
        setLoading(true);
        const data = await DividasService.resumo(user.cpf_cnpj);
        setResumo(data);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    fetchResumo();
  }, [user]);

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
      <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

      {/* Section com Header e Card de Dívidas */}
      <Section
        amount={loading ? 0 : (resumo?.total_dividas || 0)}
        updatedAt={new Date().toLocaleDateString('pt-BR')}
        onMenuPress={() => setMenuVisible(true)}
      />

      <View style={styles.wrapper}>
        <View style={styles.contentWrapper}>
          <View style={styles.scrollContainer}>
            <View style={styles.content}>

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
    justifyContent: "center",
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
