import { MenuItem } from '@/components/cards';
import { PropagandaDeOferta } from '@/components/PropagandaDeOferta';
import { Section } from '@/components/section';
import { SideMenu } from '@/components/ui';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { DividasService, ResumoFinanceiro } from '@/services/dividas.service';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, Platform, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [loading, setLoading] = useState(true);

  // Previne voltar para splash screen APENAS quando a tela home está focada
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
          // Bloqueia voltar ao splash quando estiver na home
          return true;
        });

        return () => backHandler.remove();
      }
    }, [])
  );

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
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <StatusBar
        barStyle={'light-content'}
        translucent={true}
      />

      <ScrollView style={styles.container}>
        {/* Section com Header e Card de Dívidas */}
        <Section
        amount={loading ? 0 : (resumo?.total_dividas || 0)}
        updatedAt={new Date().toLocaleDateString('pt-BR')}
        onMenuPress={() => setMenuVisible(true)}
      />
        <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

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
                  {/* Promo Banner */}
                  <PropagandaDeOferta style={styles.promoBanner} />
                </View>

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
    ...Platform.select({
      web: {
        paddingBottom: 60,
        marginBottom: 0
      },
    }),
    backgroundColor: AppColors.background.secondary,
  },
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background.primary,
    ...Platform.select({
      web: {

      },
    }),
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
    ...Platform.select({
      web: {
        width: '100%',
        maxWidth: 665,
        alignSelf: 'center',
      },
    }),

    marginTop: 20,
    marginBottom: 100,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
