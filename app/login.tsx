import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Button } from '@/components/ui/Button';

import { useAlert } from '@/components/ui/AlertModal';
import { GradientButton } from '@/components/ui/GradientButton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { AppColors, Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { BiometricAuthService } from '@/services/biometric-auth.service';
import Checkbox from 'expo-checkbox';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, Linking, Platform, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signOut, setUser } = useAuth();
  const { showAlert, AlertComponent } = useAlert();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [hasLastUser, setHasLastUser] = useState(false);

  // Carrega informações de biometria e último usuário ao montar
  useEffect(() => {
    initializeBiometric();
  }, []);

  const initializeBiometric = async () => {
    try {
      // Verifica disponibilidade de biometria
      const available = await BiometricAuthService.isAvailable();
      setBiometricAvailable(available);

      let enabled = false;
      let type = '';

      if (available) {
        type = await BiometricAuthService.getBiometricType();
        setBiometricType(type);

        // Verifica se biometria está habilitada
        try {
          enabled = await BiometricAuthService.isBiometricEnabled();
          setBiometricEnabled(enabled);
        } catch (err) {
          console.error('Erro ao verificar biometria habilitada:', err);
          setBiometricEnabled(false);
        }
      }

      // Carrega último usuário
      const lastUser = await BiometricAuthService.getLastUser();
      if (lastUser) {
        setEmail(lastUser.email);
        setHasLastUser(true);

        // Carrega preferência "Lembrar-me"
        const rememberMe = await BiometricAuthService.getRememberMe();
        setKeepLoggedIn(rememberMe);

        // Se biometria está habilitada e há último usuário, sugere login automático
        if (available && enabled && rememberMe) {
          setTimeout(() => {
            showAlert(
              `Login com ${type}`,
              `Deseja entrar como ${lastUser.email}?`,
              [
                { text: 'Não', style: 'cancel' },
                {
                  text: `Usar ${type}`,
                  onPress: () => handleBiometricLogin(),
                },
              ],
              'info'
            );
          }, 500);
        }
      }
    } catch (error) {
      console.error('Erro ao inicializar biometria:', error);
    }
  };

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

  const handleBiometricLogin = async () => {
    if (!biometricAvailable) {
      showAlert(
        'Biometria Indisponível',
        'A biometria não está disponível neste dispositivo.',
        [{ text: 'OK' }],
        'warning'
      );
      return;
    }

    setLoading(true);

    try {
      const result = await BiometricAuthService.authenticate(
        `Use ${biometricType} para fazer login`
      );

      if (result.success) {
        // Busca o token salvo do último login
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const savedToken = await AsyncStorage.getItem('@Auth:token');
        const savedUser = await AsyncStorage.getItem('@Auth:user');

        if (!savedToken || !savedUser) {
          showAlert(
            'Sessão Expirada',
            'Sua sessão expirou. Por favor, faça login novamente com sua senha.',
            [{ text: 'OK' }],
            'warning'
          );
          return;
        }

        // Restaura o token e usuário no contexto
        const apiModule = await import('@/services/api.config');
        apiModule.default.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;

        // Parse e atualiza o usuário
        try {
          const user = JSON.parse(savedUser);
          setUser(user);

          setTimeout(() => {
            router.replace('/(tabs)/home');
          }, 100);
        } catch (parseError) {
          throw new Error('Erro ao recuperar dados do usuário');
        }
      } else {
        showAlert(
          'Autenticação Falhou',
          result.error || 'Não foi possível autenticar com biometria.',
          [{ text: 'OK' }],
          'error'
        );
      }
    } catch (error) {
      console.error('Erro no login biométrico:', error);
      showAlert(
        'Erro',
        'Ocorreu um erro ao tentar fazer login com biometria. Por favor, use sua senha.',
        [{ text: 'OK' }],
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

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
        // Salva informações do último usuário
        await BiometricAuthService.saveLastUser(email);
        await BiometricAuthService.setRememberMe(keepLoggedIn);

        // Aguarda um tick para garantir que o estado foi atualizado
        setTimeout(() => {
          router.replace('/(tabs)/home');
        }, 100);
      } else {
        // Mostra erro de forma segura
        setTimeout(() => {
          showAlert('Erro de Login', 'Email ou senha incorretos. Verifique seus dados e tente novamente.', [{ text: 'OK' }], 'error');
        }, 100);
      }
    } catch (error) {
      // Tratamento de erro mais robusto
      if (__DEV__) {
        console.error('[Login] Erro:', error);
      }

      setTimeout(() => {
        showAlert(
          'Erro de Conexão',
          'Não foi possível realizar o login. Verifique sua conexão com a internet e tente novamente.',
          [{ text: 'OK' }],
          'error'
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
          style={styles.input}
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
          style={styles.input}
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
          style={styles.button}
        />

        {/* Botão de Login Biométrico - sempre visível quando disponível */}
        {biometricAvailable && hasLastUser && (
          <>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricLogin}
              disabled={loading}
              activeOpacity={0.7}
            >
              <View style={styles.biometricIconContainer}>
                <IconSymbol
                  name={biometricType === 'Face ID' ? 'faceid' : 'touchid'}
                  size={32}
                  color={AppColors.white}
                />
              </View>
              <View style={styles.biometricTextContainer}>
                <Text style={styles.biometricButtonTitle}>
                  Entrar com {biometricType}
                </Text>
                <Text style={styles.biometricButtonSubtitle}>
                  {email}
                </Text>
              </View>
            </TouchableOpacity>
          </>
        )}

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
        <TouchableOpacity
          onPress={() => {
            const url = 'https://api.stoneup.com.br/storage/termos/CONTRATO_DE%20PRESTAC%CC%A7A%CC%83O_DE%20SERVIC%CC%A7OS_STONE_UP_MONITORA.pdf';
            if (Platform.OS === 'web') {
              window.open(url, '_blank');
            } else {
              Linking.openURL(url);
            }
          }}
          disabled={loading}
        >
          <Text style={[styles.termsText,  loading && styles.disabledText]}>Ler termos de uso</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={() => {
            const url = 'https://api.stoneup.com.br/storage/termos/CONTRATO_DE%20PRESTAC%CC%A7A%CC%83O_DE%20SERVIC%CC%A7OS_STONE_UP_MONITORA.pdf';
            if (Platform.OS === 'web') {
              window.open(url, '_blank');
            } else {
              Linking.openURL(url);
            }
          }}
          disabled={loading}
        >
          <Text style={[styles.termsText,  loading && styles.disabledText]}>Política de privacidade</Text>
        </TouchableOpacity> */}
      </View>

      {/* Alert Modal */}
      <AlertComponent />
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
  button: {
    width: 250,
  },
  input: {
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
    width: 250,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: AppColors.gray[300],
  },
  dividerText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderRadius: 14,
    backgroundColor: AppColors.primary,
    ...Platform.select({
      ios: {
        shadowColor: AppColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  biometricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricTextContainer: {
    flex: 1,
    gap: 2,
  },
  biometricButtonTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: AppColors.white,
  },
  biometricButtonSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
