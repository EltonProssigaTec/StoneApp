import { OffersSection } from '@/components/OffersSection';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppColors, Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { DividasService, OfertasService } from '@/services';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Offer {
  id: string;
  company: string;
  discount: number;
  originalAmount: number;
  discountedAmount: number;
}

export default function OfertasScreen() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [totalDebt, setTotalDebt] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.cpf_cnpj || !user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Carrega ofertas do plano
      const ofertasPlano = await OfertasService.listarOfertas(user.id);

      // Carrega ofertas de dívidas
      const ofertasDividas = await OfertasService.listarOfertasDividas(user.cpf_cnpj);

      // Converte ofertas para o formato da UI
      const ofertasFormatadas: Offer[] = [
        ...ofertasPlano.map(oferta => ({
          id: oferta.id,
          company: oferta.empresa,
          discount: oferta.desconto_percentual,
          originalAmount: oferta.valor_original || 0,
          discountedAmount: oferta.valor_com_desconto || 0,
        })),
        ...ofertasDividas.map(oferta => ({
          id: oferta.id,
          company: oferta.credor,
          discount: oferta.desconto_percentual,
          originalAmount: oferta.valor_original,
          discountedAmount: oferta.valor_desconto,
        }))
      ];

      setOffers(ofertasFormatadas);

      // Busca resumo de dívidas para o total
      const resumo = await DividasService.resumo(user.cpf_cnpj);
      setTotalDebt(resumo.total_dividas);
    } catch (error: any) {
      console.error('Erro ao carregar ofertas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar barStyle={'light-content'} translucent={true}/>
            {/* Offers Section with Debt Card */}
            <OffersSection
            amount={totalDebt}
            updatedAt="02/09/2025"
            onPayPress={() => console.log('Pagar pressionado')}
            onMenuPress={() => console.log('Menu pressionado')}
          />
        <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={AppColors.primary} />
              <Text style={styles.loadingText}>Carregando ofertas...</Text>
            </View>
          )}

          {!loading && offers.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma oferta disponível no momento</Text>
            </View>
          )}

          {!loading && offers.length > 0 && (
            <View style={styles.offersList}>
              {offers.map((offer) => (
                <Card key={offer.id} style={styles.offerCard}>
                  <View style={styles.offerHeader}>
                    <Text style={styles.offerCompany}>{offer.company}</Text>
                    <TouchableOpacity>
                      <IconSymbol
                        name="ellipsis"
                        size={20}
                        color={AppColors.gray[600]}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressContainer}>
                    <Text style={styles.discountText}>{offer.discount}% de desconto</Text>
                  </View>

                  {/* Amount Info */}
                  {offer.originalAmount > 0 && (
                    <View style={styles.amountInfo}>
                      <Text style={styles.amountLabel}>
                        De R$ {offer.originalAmount.toFixed(2)} por{' '}
                        <Text style={styles.amountHighlight}>
                          R$ {offer.discountedAmount.toFixed(2)}
                        </Text>
                      </Text>
                    </View>
                  )}
                </Card>
              ))}
            </View>
          )}
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
    alignSelf: "center",
    ...Platform.select({
      web: {
        maxWidth: 720,
      },
    }),
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  offersList: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  offerCard: {
    marginBottom: 16,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  offerCompany: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: AppColors.text.primary,
  },
  progressContainer: {
    marginBottom: 4,
  },
  progressBackground: {
    height: 8,
    backgroundColor: AppColors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: AppColors.secondary,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 14,
    color: AppColors.text.secondary,
  },
  amountInfo: {
  },
  amountLabel: {
    fontSize: 14,
    color: AppColors.text.secondary,
  },
  amountHighlight: {
    fontWeight: 'bold',
    color: AppColors.primary,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: AppColors.text.secondary,
    textAlign: 'center',
  },
});
