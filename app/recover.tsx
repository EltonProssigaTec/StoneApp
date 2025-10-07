import { AuthLayout } from '@/components/layouts/AuthLayout';
import { GradientButton } from '@/components/ui/GradientButton';
import { Input } from '@/components/ui/Input';
import { AppColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function RecoverScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleRecover = () => {
    // Aqui você implementaria a lógica de recuperação
    console.log('Recuperando senha para:', email);
    router.back();
  };

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
          {/* Formulário */}
          <View style={styles.formContainer}>
            <Input
              label="Email"
              placeholder="Digite seu email."
              icon="envelope.fill"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Confirme seu email"
              placeholder="Digite o código enviado para o seu email."
              icon="checkmark.circle.fill"
              value={confirmEmail}
              onChangeText={setConfirmEmail}
            />

            <Input
              label="Digite sua nova senha"
              placeholder="Digite uma senha forte."
              icon="lock.fill"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <GradientButton
              title="Recuperar"
              onPress={handleRecover}
              fullWidth
              style={styles.button}
            />

            <TouchableOpacity style={styles.termsContainer}>
              <Text style={styles.termsText}>Ler termos de uso</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthLayout>);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  formContainer: {
    flex: 1,
  },
  button: {
    marginTop: 8,
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
