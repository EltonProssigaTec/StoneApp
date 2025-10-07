import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LogoImage } from '@/components/LogoImage';
import { Input } from '@/components/ui/Input';
import { GradientButton } from '@/components/ui/GradientButton';
import { AppColors, Fonts } from '@/constants/theme';
import { AuthService } from '@/services';
import { cpfMask, phoneMask, dateMask, removeMask, validateCPF, validateDate } from '@/utils/masks';

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    birthDate: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }
    if (!formData.birthDate.trim()) {
      newErrors.birthDate = 'Data de nascimento é obrigatória';
    } else if (!validateDate(formData.birthDate)) {
      newErrors.birthDate = 'Data inválida';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (removeMask(formData.phone).length < 10) {
      newErrors.phone = 'Telefone inválido';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos corretamente');
      return;
    }

    try {
      setLoading(true);

      // Converter data de DD/MM/YYYY para YYYY-MM-DD HH:mm:ss
      const [day, month, year] = formData.birthDate.split('/');
      const formattedDate = `${year}-${month}-${day} 00:00:00`;

      const registerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        cpf_cnpj: formData.cpf.replace(/\D/g, ''), // Remove caracteres não numéricos
        data_nascimento: formattedDate,
        telefone: formData.phone.replace(/\D/g, ''),
        origem: 'mobile',
      };

      console.log('[Register] Enviando dados:', registerData);

      const response = await AuthService.preRegister(registerData);

      console.log('[Register] Cadastro criado:', response);

      Alert.alert(
        'Sucesso',
        'Cadastro realizado! Verifique seu email para confirmar.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (error: any) {
      console.error('[Register] Erro:', error);

      const message =
        error?.response?.data?.message || 'Erro ao cadastrar. Tente novamente.';

      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    let formattedValue = value;

    // Aplicar máscara conforme o campo
    switch (field) {
      case 'cpf':
        formattedValue = cpfMask(value);
        break;
      case 'phone':
        formattedValue = phoneMask(value);
        break;
      case 'birthDate':
        formattedValue = dateMask(value);
        break;
      default:
        formattedValue = value;
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }));

    // Limpar erro do campo quando usuário digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
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
          <LogoImage size="small" />
        </View>

        {/* Formulário */}
        <View style={styles.formContainer}>
          <Input
            label="Nome"
            placeholder="Digite seu nome completo."
            icon="person.fill"
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
          />

          <Input
            label="Email"
            placeholder="Digite seu email."
            icon="envelope.fill"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="CPF"
            placeholder="Digite seu CPF."
            icon="creditcard.fill"
            value={formData.cpf}
            onChangeText={(value) => updateField('cpf', value)}
            keyboardType="number-pad"
          />

          <Input
            label="Data de nascimento"
            placeholder="Digite sua data de nascimento."
            icon="calendar"
            value={formData.birthDate}
            onChangeText={(value) => updateField('birthDate', value)}
          />

          <Input
            label="Telefone"
            placeholder="Digite seu telefone."
            icon="phone.fill"
            value={formData.phone}
            onChangeText={(value) => updateField('phone', value)}
            keyboardType="phone-pad"
          />

          <Input
            label="Senha"
            placeholder="Crie uma senha forte."
            icon="lock.fill"
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            secureTextEntry
          />

          <GradientButton
            title="Cadastrar"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            fullWidth
            style={styles.button}
          />

          <TouchableOpacity style={styles.termsContainer}>
            <Text style={styles.termsText}>Ler termos de uso</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  keyboardView: {
    flex: 1,
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
    marginBottom: 32,
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
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
    textDecorationLine: 'underline',
  },
});
