import { AuthLayout } from '@/components/layouts/AuthLayout';
import { GradientButton } from '@/components/ui/GradientButton';
import { Input } from '@/components/ui/Input';
import { useAlert } from '@/components/ui/AlertModal';
import { AppColors, Fonts } from '@/constants/theme';
import { AuthService } from '@/services';
import { cpfMask, dateMask, phoneMask, removeMask, validateCPF, validateDate } from '@/utils/masks';
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

export default function RegisterScreen() {
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    data_nascimento: '',
    telefone: '',
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
    if (!formData.data_nascimento.trim()) {
      newErrors.data_nascimento = 'Data de nascimento é obrigatória';
    } else if (!validateDate(formData.data_nascimento)) {
      newErrors.data_nascimento = 'Data inválida';
    }
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (removeMask(formData.telefone).length < 10) {
      newErrors.telefone = 'Telefone inválido';
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
      showAlert('Erro', 'Por favor, preencha todos os campos corretamente', [{text: 'OK'}], 'error');
      return;
    }

    try {
      setLoading(true);

      // Converter data de DD/MM/YYYY para YYYY-MM-DD HH:mm:ss
      const [day, month, year] = formData.data_nascimento.split('/');
      const formattedDate = `${year}-${month}-${day} 00:00:00`;

      const registerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        cpf_cnpj: formData.cpf.replace(/\D/g, ''), // Remove caracteres não numéricos
        data_nascimento: formattedDate,
        telefone: formData.telefone.replace(/\D/g, ''),
        origem: 'mobile',
      };

      console.log('[Register] Enviando dados:', registerData);

      const response = await AuthService.preRegister(registerData);

      console.log('[Register] Cadastro criado:', response);

      showAlert(
        'Sucesso',
        'Cadastro realizado! Verifique seu email para confirmar.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login'),
          },
        ],
        'success'
      );
    } catch (error: any) {
      console.error('[Register] Erro:', error);

      const message =
        error?.response?.data?.message || 'Erro ao cadastrar. Tente novamente.';

      showAlert('Erro', message, [{text: 'OK'}], 'error');
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
      case 'telefone':
        formattedValue = phoneMask(value);
        break;
      case 'data_nascimento':
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
    <AuthLayout waveVariant="login">
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Formulário */}
            <View style={styles.formContainer}>
              <Input
                label="Nome"
                placeholder="Digite seu nome completo."
                icon="person.fill"
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                error={errors.name}
              />

              <Input
                label="Email"
                placeholder="Digite seu email."
                icon="envelope.fill"
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />

              <Input
                label="CPF"
                placeholder="Digite seu CPF."
                icon="creditcard.fill"
                value={formData.cpf}
                onChangeText={(value) => updateField('cpf', value)}
                keyboardType="number-pad"
                error={errors.cpf}
              />

              <Input
                label="Data de nascimento"
                placeholder="Digite sua data de nascimento."
                icon="calendar"
                value={formData.data_nascimento}
                onChangeText={(value) => updateField('data_nascimento', value)}
                keyboardType="phone-pad"
                error={errors.data_nascimento}
              />

              <Input
                label="Telefone"
                placeholder="Digite seu telefone."
                icon="phone.fill"
                value={formData.telefone}
                onChangeText={(value) => updateField('telefone', value)}
                keyboardType="phone-pad"
                error={errors.telefone}
              />

              <Input
                label="Senha"
                placeholder="Crie uma senha forte."
                icon="lock.fill"
                value={formData.password}
                onChangeText={(value) => updateField('password', value)}
                secureTextEntry
                error={errors.password}
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
      <AlertComponent />
    </AuthLayout>);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
    textDecorationLine: 'underline',
  },
});
