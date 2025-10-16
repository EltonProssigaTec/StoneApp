import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Button } from '@/components/ui/Button';

import { GradientButton } from '@/components/ui/GradientButton';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { AppColors, Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import Checkbox from 'expo-checkbox';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, BackHandler, Platform, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  // Previne voltar para splash screen APENAS quando a tela login está focada
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
          // Bloqueia voltar ao splash quando estiver no login
          return true;
        });

        return () => backHandler.remove();
      }
    }, [])
  );

  const handleLogin = async () => {
    const newErrors = { email: '', password: '' };

    // Validações
    if (!email) {
      newErrors.email = 'Digite seu email';
    }
    if (!password) {
      newErrors.password = 'Digite sua senha';
    }

    setErrors(newErrors);

    // Se houver erros, não prosseguir
    if (newErrors.email || newErrors.password) {
      return;
    }

    setLoading(true);

    try {
      // Fazer logout antes de tentar novo login (limpa tokens antigos)
      await signOut();

      const success = await signIn(email, password, keepLoggedIn);

      if (success) {
        // Aguarda um tick para garantir que o estado foi atualizado
        setTimeout(() => {
          router.replace('/(tabs)/home');
        }, 100);
      } else {
        // Mostra erro de forma segura
        setTimeout(() => {
          Alert.alert('Erro de Login', 'Email ou senha incorretos. Verifique seus dados e tente novamente.');
        }, 100);
      }
    } catch (error) {
      // Tratamento de erro mais robusto
      if (__DEV__) {
        console.error('[Login] Erro:', error);
      }

      setTimeout(() => {
        Alert.alert(
          'Erro de Conexão',
          'Não foi possível realizar o login. Verifique sua conexão com a internet e tente novamente.'
        );
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout waveVariant="login">
      <StatusBar barStyle={'dark-content'} translucent={true} />
      <View style={styles.container}>
        <Input
          label="Login"
          placeholder="Digite seu email cadastrado."
          icon="person.fill"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <Input
          label="Senha"
          placeholder="Digite sua senha."
          icon="lock.fill"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
          editable={!loading}
        />
        <View style={styles.containerCheckbox}>
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={keepLoggedIn}
              onValueChange={setKeepLoggedIn}
              color={keepLoggedIn ? AppColors.primary : undefined}
              style={styles.checkbox}
              disabled={loading}
            />
            <TouchableOpacity
              onPress={() => setKeepLoggedIn(!keepLoggedIn)}
              disabled={loading}
            >
              <Text style={[styles.checkboxLabel, loading && styles.disabledText]}>
                Manter logado
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.linksContainer}>
            <View />
            <TouchableOpacity
              onPress={() => router.push('/recover')}
              disabled={loading}
            >
              <Text style={[styles.linkText, loading && styles.disabledText]}>
                Esqueceu sua senha?
              </Text>
            </TouchableOpacity>
          </View>
        </View>


        <GradientButton
          title="Acessar"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          fullWidth
        />

        <View style={styles.registerSection}>
          <Text style={styles.registerQuestion}>Não tem uma conta ainda?</Text>
          <Button
            title="Criar conta"
            variant="outline"
            onPress={() => router.push('/register')}
            fullWidth
            style={styles.createAccountButton}
            disabled={loading}
          />
        </View>
        <TouchableOpacity onPress={() => undefined}>
          <Text style={styles.termsText}>Ler termos de uso</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => undefined}>
          <Text style={styles.termsText}>Política de privacidade</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  containerCheckbox: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linkText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
    textDecorationLine: 'underline',
  },
  registerSection: {
    marginTop: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  registerQuestion: {
    fontSize: 13,
    color: AppColors.text.secondary,
    marginBottom: 16,
  },
  createAccountButton: {
    borderWidth: 1.5,
  },
  termsText: {
    fontSize: 12,
    color: AppColors.text.secondary,
    textAlign: 'center',
    marginBottom: 10,
    textDecorationLine: 'underline',
    fontFamily: Fonts.regular,
  },
  disabledText: {
    opacity: 0.5,
  },
});
