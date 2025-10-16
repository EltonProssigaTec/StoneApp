import { AuthLayout } from '@/components/layouts/AuthLayout';
import { GradientButton } from '@/components/ui/GradientButton';
import { Input } from '@/components/ui/Input';
import { AppColors, Fonts } from '@/constants/theme';
import api from '@/services/api.config';
import { cpfMask, removeMask, validateCPF } from '@/utils/masks';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type RecoverStep = 'cpf' | 'code' | 'password';

export default function RecoverScreen() {
  const router = useRouter();
  const [cpf, setCpf] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<RecoverStep>('cpf');
  const [userEmail, setUserEmail] = useState('');

  // Verifica CPF e solicita código
  const handleVerifyCPF = async () => {
    const cleanCPF = removeMask(cpf);

    if (!validateCPF(cpf)) {
      Alert.alert('Erro', 'CPF inválido.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/verificar_cpf_cnpj', {
        cpf_cnpj: cleanCPF
      });

      const userData = response.data.data;
      setUserEmail(userData.email);

      // Envia código de recuperação para o email
      await api.post('/confirmCodeEmail', {
        email: userData.email,
      });

      Alert.alert('Sucesso', `Um código foi enviado para ${userData.email}`);
      setStep('code');
    } catch (error: any) {
      if (__DEV__) console.error('[Recover] Erro ao verificar CPF:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'CPF não encontrado ou erro ao enviar código.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Verifica código e avança para alteração de senha
  const handleVerifyCode = async () => {
    if (!code.trim()) {
      Alert.alert('Erro', 'Digite o código recebido.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/confirmCodeEmail', {
        email: userEmail,
        codigo: code.trim(),
      });

      setStep('password');
    } catch (error: any) {
      if (__DEV__) console.error('[Recover] Erro ao verificar código:', error);
      Alert.alert('Erro', 'Código inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  // Altera a senha
  const handleChangePassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/recuperar_senha', {
        email: userEmail,
        nova_senha: newPassword,
      });

      Alert.alert(
        'Sucesso',
        'Senha alterada com sucesso!',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    } catch (error: any) {
      if (__DEV__) console.error('[Recover] Erro ao alterar senha:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Não foi possível alterar a senha.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderCPFStep = () => (
    <>
      <Text style={styles.title}>Recuperar Senha</Text>
      <Text style={styles.description}>
        Digite seu CPF para recuperar o acesso.
      </Text>

      <Input
        label="CPF"
        placeholder="Digite seu CPF"
        icon="creditcard.fill"
        value={cpf}
        onChangeText={(value) => setCpf(cpfMask(value))}
        keyboardType="number-pad"
        editable={!loading}
      />

      <GradientButton
        title="Continuar"
        onPress={handleVerifyCPF}
        loading={loading}
        disabled={loading}
        fullWidth
        style={styles.button}
      />
    </>
  );

  const renderCodeStep = () => (
    <>
      <Text style={styles.title}>Digite o Código</Text>
      <Text style={styles.description}>
        Um código foi enviado para {userEmail}
      </Text>

      <Input
        label="Código de Verificação"
        placeholder="Digite o código de 6 dígitos"
        icon="checkmark.circle.fill"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
        editable={!loading}
      />

      <GradientButton
        title="Verificar Código"
        onPress={handleVerifyCode}
        loading={loading}
        disabled={loading}
        fullWidth
        style={styles.button}
      />

      <TouchableOpacity
        onPress={() => setStep('cpf')}
        style={styles.backButton}
        disabled={loading}
      >
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>
    </>
  );

  const renderPasswordStep = () => (
    <>
      <Text style={styles.title}>Nova Senha</Text>
      <Text style={styles.description}>
        Digite sua nova senha
      </Text>

      <Input
        label="Nova Senha"
        placeholder="Digite uma senha forte"
        icon="lock.fill"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        editable={!loading}
      />

      <Input
        label="Confirmar Senha"
        placeholder="Digite a senha novamente"
        icon="lock.fill"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        editable={!loading}
      />

      <GradientButton
        title="Alterar Senha"
        onPress={handleChangePassword}
        loading={loading}
        disabled={loading}
        fullWidth
        style={styles.button}
      />

      <TouchableOpacity
        onPress={() => setStep('code')}
        style={styles.backButton}
        disabled={loading}
      >
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <AuthLayout waveVariant="login">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            {step === 'cpf' && renderCPFStep()}
            {step === 'code' && renderCodeStep()}
            {step === 'password' && renderPasswordStep()}

            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => router.back()}
            >
              <Text style={styles.backText}>Voltar para o login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontFamily: Fonts.semiBold,
    color: AppColors.text.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginBottom: 24,
    lineHeight: 20,
    fontFamily: Fonts.medium,
  },
  button: {
    marginTop: 8,
  },
  backButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  backText: {
    fontSize: 14,
    color: AppColors.primary,
    fontFamily: Fonts.medium,
    textDecorationLine: 'underline',
  },
  termsContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  termsText: {
    fontSize: 12,
    color: AppColors.text.secondary,
    textDecorationLine: 'underline',
  },
});
