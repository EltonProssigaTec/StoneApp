/**
 * TESTE SIMPLES - Checkout sem crash
 * Use este para testar se o problema é no componente
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function TestCheckoutScreen() {
  useEffect(() => {
    console.log('[TestCheckout] 🔵 Tela de teste carregada');

    // Tenta importar googlePlayBilling de forma segura
    const testGooglePlayBilling = async () => {
      try {
        console.log('[TestCheckout] 🔵 Tentando importar googlePlayBilling...');

        const googlePlayBilling = require('@/services/googlePlayBilling').default;

        console.log('[TestCheckout] ✅ googlePlayBilling importado!');
        console.log('[TestCheckout] 🔵 Available?', googlePlayBilling.available);

        if (Platform.OS === 'android' && googlePlayBilling.available) {
          console.log('[TestCheckout] 🔵 Inicializando...');

          const success = await googlePlayBilling.initBilling();

          if (success) {
            console.log('[TestCheckout] ✅ Billing inicializado!');
          } else {
            console.log('[TestCheckout] ⚠️ Falha ao inicializar');
          }
        } else {
          console.log('[TestCheckout] ⚠️ Não disponível (iOS ou Expo Go)');
        }
      } catch (error: any) {
        console.error('[TestCheckout] ❌ Erro ao importar:', error.message);
        console.error('[TestCheckout] Stack:', error.stack);
      }
    };

    testGooglePlayBilling();
  }, []);

  const handleTest = async () => {
    try {
      const googlePlayBilling = require('@/services/googlePlayBilling').default;

      console.log('[TestCheckout] 🔍 Executando diagnóstico...');
      await googlePlayBilling.runDiagnostics();

      Alert.alert('Sucesso', 'Diagnóstico executado! Veja os logs.');
    } catch (error: any) {
      console.error('[TestCheckout] ❌ Erro:', error);
      Alert.alert('Erro', error.message || 'Erro desconhecido');
    }
  };

  const handleBuy = async () => {
    try {
      const googlePlayBilling = require('@/services/googlePlayBilling').default;

      console.log('[TestCheckout] 🛒 Testando compra...');
      const result = await googlePlayBilling.purchaseSubscription('monthly');

      if (result.success) {
        Alert.alert('Sucesso', 'Compra iniciada!');
      } else {
        Alert.alert('Erro', result.error || 'Erro ao comprar');
      }
    } catch (error: any) {
      console.error('[TestCheckout] ❌ Erro:', error);
      Alert.alert('Erro', error.message || 'Erro desconhecido');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🧪 Teste Google Play Billing</Text>
        <Text style={styles.subtitle}>Versão 74</Text>

        <TouchableOpacity style={styles.button} onPress={handleTest}>
          <Text style={styles.buttonText}>🔍 Executar Diagnóstico</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleBuy}>
          <Text style={styles.buttonText}>🛒 Testar Compra (Mensal)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.info}>
          Verifique os logs em:{'\n'}
          .\ver-logs-billing.bat
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    marginBottom: 12,
  },
  backButton: {
    backgroundColor: '#666',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  info: {
    marginTop: 40,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
