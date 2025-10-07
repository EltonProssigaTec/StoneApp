import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { FloatingInput } from '@/components/ui/FloatingInput';
import { GradientButton } from '@/components/ui/GradientButton';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { AppColors, Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

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

    try {
      setLoading(true);

      // Fazer logout antes de tentar novo login (limpa tokens antigos)
      await signOut();

      const success = await signIn(email, password);

      if (success) {
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Erro', 'Email ou senha incorretos');
      }
    } catch (error) {
      console.error('[Login] Erro:', error);
      Alert.alert('Erro', 'Falha ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout waveVariant="login">
      <FloatingInput
        label="Login"
        placeholder="Digite seu email cadastrado."
        icon="person.fill"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <FloatingInput
        label="Senha"
        placeholder="Digite sua senha."
        icon="lock.fill"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secureTextEntry
      />

      <View style={styles.linksContainer}>
        <Text style={styles.linkText}>Lembrar senha.</Text>
        <TouchableOpacity onPress={() => router.push('/recover')}>
          <Text style={styles.linkText}>Esqueceu sua senha?</Text>
        </TouchableOpacity>
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
        />
      </View>

      <Text style={styles.termsText}>Ler termos de uso</Text>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    marginTop: -8,
  },
  linkText: {
    fontSize: 12,
    color: AppColors.text.secondary,
  },
  registerSection: {
    marginTop: 28,
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
    marginTop: 32,
    textDecorationLine: 'underline',
  },
});
