/**
 * Tela de Checkout
 * Permite escolher método de pagamento e finalizar compra
 */

import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { useAlert } from '@/components/ui/AlertModal';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import notificationService from '@/services/notifications';
import subscriptionService, { Plan } from '@/services/subscription';
import googlePlayBilling from '@/services/googlePlayBilling';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';

type PaymentMethod = 'pix' | 'credit_card' | 'boleto' | 'google_play';

export default function CheckoutScreen() {
  const params = useLocalSearchParams<{ planId: string }>();
  const { updateUser } = useAuth();
  const { showAlert, AlertComponent } = useAlert();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('pix');
  const [loading, setLoading] = useState(false);

  // Estados para pagamento PIX
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeText: string } | null>(null);

  // Estados para cartão de crédito
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');

  useEffect(() => {
    if (params.planId) {
      const foundPlan = subscriptionService.getPlanById(params.planId);
      if (foundPlan) {
        setPlan(foundPlan);
      } else {
        showAlert('Erro', 'Plano não encontrado', [
          { text: 'OK', onPress: () => router.back() }
        ], 'error');
      }
    }

    // Inicializa Google Play Billing se disponível
    if (Platform.OS === 'android') {
      googlePlayBilling.initialize();
    }

    // Cleanup ao desmontar
    return () => {
      if (Platform.OS === 'android') {
        googlePlayBilling.disconnect();
      }
    };
  }, [params.planId]);

  const handlePixPayment = async () => {
    if (!plan) return;

    setLoading(true);
    try {
      // Gera o QR Code do PIX
      const data = await subscriptionService.processPixPayment(plan.id);
      setPixData(data);

      // Simula confirmação do pagamento (em produção, isso viria via webhook)
      showAlert(
        'Pagamento PIX',
        'Escaneie o QR Code ou copie o código PIX para pagar. Após o pagamento, clique em "Confirmar Pagamento".',
        [
          {
            text: 'Copiar Código',
            onPress: () => {
              // Em produção, copiar para clipboard
              showAlert('Código Copiado', 'Cole no seu app de banco para pagar', undefined, 'success');
            },
          },
          {
            text: 'Confirmar Pagamento',
            onPress: () => confirmPayment('pix'),
          },
        ],
        'info'
      );
    } catch (error) {
      showAlert('Erro', 'Não foi possível gerar o PIX', undefined, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreditCardPayment = async () => {
    if (!plan) return;

    // Validações básicas
    if (!cardNumber || !cardName || !cardExpiry || !cardCVV) {
      showAlert('Erro', 'Preencha todos os dados do cartão', undefined, 'error');
      return;
    }

    if (cardNumber.replace(/\s/g, '').length < 16) {
      showAlert('Erro', 'Número do cartão inválido', undefined, 'error');
      return;
    }

    if (cardCVV.length < 3) {
      showAlert('Erro', 'CVV inválido', undefined, 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await subscriptionService.processCreditCardPayment(plan.id, {
        number: cardNumber,
        name: cardName,
        expiry: cardExpiry,
        cvv: cardCVV,
      });

      if (result.transactionId) {
        await confirmPayment('credit_card');
      }
    } catch (error) {
      showAlert('Erro', 'Não foi possível processar o pagamento', undefined, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBoletoPayment = async () => {
    if (!plan) return;

    showAlert(
      'Pagamento via Boleto',
      'O boleto será enviado para seu email. Após o pagamento, a assinatura será ativada em até 2 dias úteis.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Gerar Boleto',
          onPress: () => confirmPayment('boleto'),
        },
      ],
      'info'
    );
  };

  const handleGooglePlayPayment = async () => {
    if (!plan) return;

    setLoading(true);
    try {
      // Mapeia ID do plano para SKU do Google Play
      const skuMap: Record<string, string> = {
        'monthly': 'br.com.stoneup.monitora.app.monitora',
        'quarterly': 'br.com.stoneup.monitora.app.monitora',  // Usando o mensal temporariamente
        'annual': 'br.com.stoneup.monitora.app.stoneupplus',
      };

      const sku = skuMap[plan.id];
      if (!sku) {
        showAlert('Erro', 'Plano não disponível no Google Play', undefined, 'error');
        return;
      }

      // Inicia o fluxo de compra (abre dialog do Google Play)
      const result = await googlePlayBilling.purchaseSubscription(sku);

      if (!result.success) {
        showAlert('Erro', result.error || 'Não foi possível processar a compra', undefined, 'error');
      }
      // Se sucesso, o listener do googlePlayBilling vai processar automaticamente
    } catch (error) {
      showAlert('Erro', 'Não foi possível iniciar a compra', undefined, 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (method: PaymentMethod) => {
    if (!plan) return;

    setLoading(true);
    try {
      // Cria a assinatura
      const subscription = await subscriptionService.createSubscription(plan.id, method);

      // Atualiza o contexto do usuário
      await updateUser({ plano: plan.name });

      // Cria notificações de sucesso
      await notificationService.notifySubscriptionCreated(plan.name);
      await notificationService.notifyPaymentConfirmed(plan.price);

      showAlert(
        'Pagamento Confirmado! 🎉',
        `Sua assinatura do ${plan.displayName} foi ativada com sucesso!`,
        [
          {
            text: 'Ver Minha Assinatura',
            onPress: () => {
              router.replace('/minha-assinatura');
            },
          },
          {
            text: 'Ir para Home',
            onPress: () => {
              router.replace('/(tabs)/home');
            },
          },
        ],
        'success'
      );
    } catch (error) {
      showAlert('Erro', 'Não foi possível confirmar o pagamento', undefined, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    setCardNumber(chunks.join(' '));
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      setCardExpiry(cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4));
    } else {
      setCardExpiry(cleaned);
    }
  };

  if (!plan) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar barStyle="light-content" translucent={true} />

        <AppHeader title="Checkout" showBackButton />

        <AlertComponent />

        <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
          {/* Resumo do Plano */}
          <View style={styles.planSummary}>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planPrice}>
              {subscriptionService.formatPrice(plan.price)}
            </Text>
            <Text style={styles.planPeriod}>{plan.period}</Text>
          </View>

          {/* Métodos de Pagamento */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Método de Pagamento</Text>

            <TouchableOpacity
              style={[
                styles.paymentMethod,
                selectedMethod === 'pix' && styles.paymentMethodSelected,
              ]}
              onPress={() => setSelectedMethod('pix')}
            >
              <View style={styles.paymentMethodContent}>
                <Text style={styles.paymentMethodTitle}>PIX</Text>
                <Text style={styles.paymentMethodSubtitle}>
                  Aprovação instantânea
                </Text>
              </View>
              {selectedMethod === 'pix' && (
                <View style={styles.radioSelected} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethod,
                selectedMethod === 'credit_card' && styles.paymentMethodSelected,
              ]}
              onPress={() => setSelectedMethod('credit_card')}
            >
              <View style={styles.paymentMethodContent}>
                <Text style={styles.paymentMethodTitle}>Cartão de Crédito</Text>
                <Text style={styles.paymentMethodSubtitle}>
                  Parcelamento disponível
                </Text>
              </View>
              {selectedMethod === 'credit_card' && (
                <View style={styles.radioSelected} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethod,
                selectedMethod === 'boleto' && styles.paymentMethodSelected,
              ]}
              onPress={() => setSelectedMethod('boleto')}
            >
              <View style={styles.paymentMethodContent}>
                <Text style={styles.paymentMethodTitle}>Boleto</Text>
                <Text style={styles.paymentMethodSubtitle}>
                  Compensação em até 2 dias úteis
                </Text>
              </View>
              {selectedMethod === 'boleto' && (
                <View style={styles.radioSelected} />
              )}
            </TouchableOpacity>

            {Platform.OS === 'android' && (
              <TouchableOpacity
                style={[
                  styles.paymentMethod,
                  selectedMethod === 'google_play' && styles.paymentMethodSelected,
                ]}
                onPress={() => setSelectedMethod('google_play')}
              >
                <View style={styles.paymentMethodContent}>
                  <Text style={styles.paymentMethodTitle}>Google Play</Text>
                  <Text style={styles.paymentMethodSubtitle}>
                    Pagamento seguro e renovação automática
                  </Text>
                </View>
                {selectedMethod === 'google_play' && (
                  <View style={styles.radioSelected} />
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Formulário de Cartão */}
          {selectedMethod === 'credit_card' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dados do Cartão</Text>

              <TextInput
                style={styles.input}
                placeholder="Número do cartão"
                placeholderTextColor={AppColors.text.secondary}
                value={cardNumber}
                onChangeText={formatCardNumber}
                keyboardType="numeric"
                maxLength={19}
              />

              <TextInput
                style={styles.input}
                placeholder="Nome no cartão"
                placeholderTextColor={AppColors.text.secondary}
                value={cardName}
                onChangeText={setCardName}
                autoCapitalize="characters"
              />

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.inputHalf]}
                  placeholder="MM/AA"
                  placeholderTextColor={AppColors.text.secondary}
                  value={cardExpiry}
                  onChangeText={formatExpiry}
                  keyboardType="numeric"
                  maxLength={5}
                />

                <TextInput
                  style={[styles.input, styles.inputHalf]}
                  placeholder="CVV"
                  placeholderTextColor={AppColors.text.secondary}
                  value={cardCVV}
                  onChangeText={setCardCVV}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>
          )}

          {/* QR Code PIX */}
          {selectedMethod === 'pix' && pixData && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>QR Code PIX</Text>
              <View style={styles.qrCodeContainer}>
                <QRCode
                  value={pixData.qrCodeText}
                  size={200}
                  color="#000"
                  backgroundColor="#fff"
                />
                <Text style={styles.pixCode}>{pixData.qrCodeText}</Text>
              </View>
            </View>
          )}

          {/* Botão de Pagamento */}
          <View style={styles.buttonContainer}>
            <Button
              title={
                loading
                  ? 'Processando...'
                  : selectedMethod === 'pix'
                  ? 'Gerar PIX'
                  : selectedMethod === 'credit_card'
                  ? 'Pagar com Cartão'
                  : selectedMethod === 'boleto'
                  ? 'Gerar Boleto'
                  : 'Comprar via Google Play'
              }
              variant="primary"
              fullWidth
              onPress={() => {
                if (selectedMethod === 'pix') {
                  handlePixPayment();
                } else if (selectedMethod === 'credit_card') {
                  handleCreditCardPayment();
                } else if (selectedMethod === 'boleto') {
                  handleBoletoPayment();
                } else if (selectedMethod === 'google_play') {
                  handleGooglePlayPayment();
                }
              }}
              disabled={loading}
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
    backgroundColor: AppColors.background.secondary,
  },
  planSummary: {
    backgroundColor: AppColors.background.primary,
    padding: 24,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: AppColors.primary,
    marginBottom: 4,
  },
  planPeriod: {
    fontSize: 14,
    color: AppColors.text.secondary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 12,
  },
  paymentMethod: {
    backgroundColor: AppColors.background.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentMethodSelected: {
    borderColor: AppColors.primary,
  },
  paymentMethodContent: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  paymentMethodSubtitle: {
    fontSize: 12,
    color: AppColors.text.secondary,
  },
  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: AppColors.primary,
  },
  input: {
    backgroundColor: AppColors.background.primary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: AppColors.text.primary,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputHalf: {
    width: '48%',
  },
  qrCodeContainer: {
    backgroundColor: AppColors.background.primary,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  qrCode: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  pixCode: {
    fontSize: 12,
    color: AppColors.text.secondary,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});
