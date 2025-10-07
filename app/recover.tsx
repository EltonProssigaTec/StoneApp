import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LogoImage } from '@/components/LogoImage';
import { Input } from '@/components/ui/Input';
import { GradientButton } from '@/components/ui/GradientButton';
import { AppColors } from '@/constants/theme';

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Onda decorativa superior */}
      <View style={styles.waveTop} />
      <View style={styles.waveTopOrange} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <LogoImage size="medium" />
        </View>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  waveTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 120,
    height: 60,
    backgroundColor: AppColors.primary,
    borderBottomRightRadius: 60,
  },
  waveTopOrange: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 200,
    height: 50,
    backgroundColor: AppColors.secondary,
    borderBottomLeftRadius: 50,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
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
