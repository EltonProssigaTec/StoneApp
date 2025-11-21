import { useAlert } from '@/components/ui/AlertModal';
import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AppColors, Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api.config';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { showAlert, AlertComponent } = useAlert();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePasswords = (): boolean => {
    if (!currentPassword.trim()) {
      showAlert('Atenção', 'Digite sua senha atual.', [{ text: 'OK' }], 'warning');
      return false;
    }

    if (!newPassword.trim()) {
      showAlert('Atenção', 'Digite a nova senha.', [{ text: 'OK' }], 'warning');
      return false;
    }

    if (newPassword.length < 6) {
      showAlert('Atenção', 'A nova senha deve ter no mínimo 6 caracteres.', [{ text: 'OK' }], 'warning');
      return false;
    }

    if (newPassword !== confirmPassword) {
      showAlert('Atenção', 'As senhas não conferem.', [{ text: 'OK' }], 'warning');
      return false;
    }

    if (currentPassword === newPassword) {
      showAlert('Atenção', 'A nova senha deve ser diferente da senha atual.', [{ text: 'OK' }], 'warning');
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePasswords()) return;

    try {
      setLoading(true);

      const response = await api.put('/monitora/user/alterarsenha', {
        userId: user?.id,
        senhaAtual: currentPassword,
        novaSenha: newPassword,
      });

      if (response.status === 200) {
        showAlert(
          'Sucesso',
          'Senha alterada com sucesso! Faça login novamente.',
          [
            {
              text: 'OK',
              onPress: () => {
                signOut();
                router.replace('/login');
              }
            }
          ],
          'success'
        );
      }
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);

      if (error.response?.status === 401) {
        showAlert('Erro', 'Senha atual incorreta.', [{ text: 'OK' }], 'error');
      } else {
        showAlert('Erro', 'Não foi possível alterar a senha. Tente novamente.', [{ text: 'OK' }], 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar barStyle="light-content" translucent={true} />

        <AppHeader title="Alterar Senha" />

        <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Redefinir Senha</Text>
            <Text style={styles.description}>
              Digite sua senha atual e escolha uma nova senha para sua conta.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Senha Atual"
              placeholder="Digite sua senha atual"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Input
              label="Nova Senha"
              placeholder="Digite a nova senha"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Input
              label="Confirmar Nova Senha"
              placeholder="Digite a nova senha novamente"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>Requisitos da senha:</Text>
              <Text style={styles.requirement}>• Mínimo de 6 caracteres</Text>
              <Text style={styles.requirement}>• Deve ser diferente da senha atual</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Button
              title="Alterar Senha"
              onPress={handleChangePassword}
              loading={loading}
              disabled={loading}
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

        <AlertComponent />
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: AppColors.text.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
    lineHeight: 20,
  },
  form: {
    gap: 16,
  },
  passwordRequirements: {
    backgroundColor: AppColors.background.secondary,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: AppColors.text.primary,
    marginBottom: 8,
  },
  requirement: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
    marginTop: 4,
  },
  footer: {
    marginTop: 32,
  },
});
