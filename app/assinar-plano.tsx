/**
 * Tela de Assinatura de Planos
 * Exemplo de uso do GooglePlayService
 */

import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { AppColors, Fonts } from '@/constants/theme';
import { GooglePlayService, SUBSCRIPTION_SKUS, SubscriptionProduct } from '@/services';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AssinarPlanoScreen() {
  const [produtos, setProdutos] = useState<SubscriptionProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    inicializarGooglePlay();

    return () => {
      // Cleanup ao sair da tela
      GooglePlayService.disconnect();
    };
  }, []);

  const inicializarGooglePlay = async () => {
    try {
      setLoading(true);

      // Inicializar conexão com Google Play
      const conectado = await GooglePlayService.initialize();

      if (!conectado) {
        Alert.alert('Erro', 'Não foi possível conectar ao Google Play');
        setLoading(false);
        return;
      }

      // Buscar produtos disponíveis
      const produtosDisponiveis = await GooglePlayService.getSubscriptions();

      if (produtosDisponiveis.length === 0) {
        Alert.alert('Aviso', 'Nenhum plano disponível no momento');
      }

      setProdutos(produtosDisponiveis);
    } catch (error: any) {
      Alert.alert('Erro', 'Falha ao carregar planos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const assinarPlano = async (productId: string, nomePlano: string) => {
    try {
      setPurchasing(true);

      Alert.alert(
        'Confirmar Assinatura',
        `Deseja assinar o plano ${nomePlano}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Assinar',
            onPress: async () => {
              const [resultado, erro] = await GooglePlayService.purchaseSubscription(productId);

              if (erro) {
                Alert.alert('Erro na Compra', erro);
                return;
              }

              if (resultado) {
                Alert.alert(
                  'Sucesso!',
                  'Assinatura realizada com sucesso!',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // TODO: Atualizar status do usuário no backend
                        // TODO: Navegar para tela de sucesso ou home
                      },
                    },
                  ]
                );
              }
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setPurchasing(false);
    }
  };

  const verificarAssinaturaAtiva = async () => {
    const temAssinatura = await GooglePlayService.hasActiveSubscription();

    Alert.alert(
      'Status da Assinatura',
      temAssinatura ? 'Você tem uma assinatura ativa!' : 'Você não tem assinatura ativa'
    );
  };

  const getPlanName = (productId: string): string => {
    if (productId.includes('anual')) return 'Plano Anual';
    if (productId.includes('02')) return 'Plano Premium';
    if (productId.includes('01')) return 'Plano Básico';
    return 'Plano Monitora';
  };

  const getPlanDescription = (productId: string): string => {
    if (productId.includes('anual')) {
      return 'Assinatura anual com desconto especial';
    }
    if (productId.includes('02')) {
      return 'Plano completo com todas as funcionalidades';
    }
    return 'Plano essencial para monitoramento';
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <AppHeader title="Assinar Plano" />

        <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
          {/* Botão de verificar assinatura */}
          <TouchableOpacity
            style={styles.checkButton}
            onPress={verificarAssinaturaAtiva}
            disabled={loading}
          >
            <Text style={styles.checkButtonText}>Verificar Assinatura Atual</Text>
          </TouchableOpacity>

          {/* Loading */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={AppColors.primary} />
              <Text style={styles.loadingText}>Carregando planos...</Text>
            </View>
          )}

          {/* Lista de Planos */}
          {!loading && produtos.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Nenhum plano disponível no momento
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={inicializarGooglePlay}
              >
                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && produtos.length > 0 && (
            <View style={styles.planosList}>
              {produtos.map((produto) => (
                <Card key={produto.productId} style={styles.planoCard}>
                  <View style={styles.planoHeader}>
                    <Text style={styles.planoNome}>
                      {getPlanName(produto.productId)}
                    </Text>
                    {produto.productId.includes('anual') && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>ECONOMIA</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.planoDescricao}>
                    {getPlanDescription(produto.productId)}
                  </Text>

                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Preço:</Text>
                    <Text style={styles.priceValue}>{produto.price}</Text>
                  </View>

                  <Text style={styles.planoPeriodo}>
                    {produto.subscriptionPeriod || 'Renovação automática'}
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.subscribeButton,
                      purchasing && styles.subscribeButtonDisabled,
                    ]}
                    onPress={() => assinarPlano(produto.productId, getPlanName(produto.productId))}
                    disabled={purchasing}
                  >
                    {purchasing ? (
                      <ActivityIndicator color={AppColors.white} />
                    ) : (
                      <Text style={styles.subscribeButtonText}>ASSINAR AGORA</Text>
                    )}
                  </TouchableOpacity>

                  <Text style={styles.disclaimer}>
                    ID: {produto.productId}
                  </Text>
                </Card>
              ))}
            </View>
          )}

          {/* Aviso importante */}
          <Card style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠️ Importante</Text>
            <Text style={styles.warningText}>
              • As assinaturas são renovadas automaticamente{'\n'}
              • Você pode cancelar a qualquer momento{'\n'}
              • O cancelamento terá efeito no próximo período{'\n'}
              • Gerenciar em: Google Play Store → Assinaturas
            </Text>
          </Card>
        </ScrollView>
      </View>
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
    paddingHorizontal: 20,
  },
  checkButton: {
    backgroundColor: AppColors.secondary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 16,
    alignItems: 'center',
  },
  checkButtonText: {
    color: AppColors.white,
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: AppColors.text.secondary,
  },
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: AppColors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: AppColors.white,
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  planosList: {
    paddingBottom: 20,
  },
  planoCard: {
    marginBottom: 16,
    padding: 20,
  },
  planoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planoNome: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: AppColors.text.primary,
  },
  badge: {
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: AppColors.white,
    fontSize: 10,
    fontFamily: Fonts.bold,
  },
  planoDescricao: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: AppColors.text.secondary,
    marginRight: 8,
  },
  priceValue: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: AppColors.primary,
  },
  planoPeriodo: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
    marginBottom: 16,
  },
  subscribeButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  disclaimer: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
    textAlign: 'center',
  },
  warningCard: {
    marginTop: 20,
    marginBottom: 40,
    padding: 16,
    backgroundColor: '#FFF9E6',
  },
  warningTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#B8860B',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#8B7500',
    lineHeight: 20,
  },
});
