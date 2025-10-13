import { MenuItem } from '@/components/cards';
import { PropagandaDeOferta } from '@/components/PropagandaDeOferta';
import { Section } from '@/components/teste';
import { SideMenu } from '@/components/ui';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { DividasService, ResumoFinanceiro } from '@/services/dividas.service';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <StatusBar
        backgroundColor={AppColors.primary}
        barStyle="light-content"
        translucent={false}
      />
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
                <PropagandaDeOferta style={styles.promoBanner} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 100,
    ...Platform.select({
      web: {
        paddingBottom: 60,
        marginBottom: 0
      },
    }),
    backgroundColor: AppColors.background.secondary,
  },
  safeArea: {
    backgroundColor: AppColors.primary,
    flex: 1,
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
    marginTop: 20
  },
  promoBanner: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
