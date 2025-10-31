import { AuthLayout } from '@/components/layouts/AuthLayout';
import { GradientButton } from '@/components/ui/GradientButton';
import { Input } from '@/components/ui/Input';
import { useAlert } from '@/components/ui/AlertModal';
import { AppColors, Fonts } from '@/constants/theme';
import api from '@/services/api.config';
import { cpfCnpjMask, removeMask, validateCPF, validateCNPJ } from '@/utils/masks';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';

type RecoverType = 'email' | 'password';
type RecoverStep = 'choose' | 'cpf' | 'contact' | 'code' | 'result';

interface UserContactInfo {
  email: string;
  phone: string;
}

export default function RecoverScreen() {
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert();

  // Estados
  const [recoverType, setRecoverType] = useState<RecoverType>('password');
  const [step, setStep] = useState<RecoverStep>('choose');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [contactInfo, setContactInfo] = useState<UserContactInfo>({ email: '', phone: '' });
  const [selectedContact, setSelectedContact] = useState<'email' | 'sms'>('email');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Timer para reenvio de código
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Formatar timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Passo 1: Escolher o que recuperar
  const renderChooseStep = () => (
    <View style={styles.content}>
      <Image
        source={require('@/assets/images/think.png')}
        style={styles.illustration}
        resizeMode="contain"
      />
      <Text style={styles.title}>O que deseja recuperar?</Text>

      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => {
          setRecoverType('email');
          setStep('cpf');
        }}
      >
        <Text style={styles.optionButtonText}>Recuperar e-mail</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionButton, styles.optionButtonSecondary]}
        onPress={() => {
          setRecoverType('password');
          setStep('cpf');
        }}
      >
        <Text style={styles.optionButtonText}>Recuperar senha</Text>
      </TouchableOpacity>
    </View>
  );

  // Passo 2: Informar CPF/CNPJ
  const handleVerifyCPF = async () => {
    const cleanValue = removeMask(cpfCnpj);

    if (!validateCPF(cleanValue) && !validateCNPJ(cleanValue)) {
      showAlert('Erro', 'CPF/CNPJ inválido.', [{ text: 'OK' }], 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/verificar_cpf_cnpj', {
        cpf_cnpj: cleanValue
      });

      const userData = response.data.data;
      setContactInfo({
        email: userData.email,
        phone: userData.telefone || '+55 ***0000'
      });

      setStep('contact');
    } catch (error: any) {
      showAlert(
        'Erro',
        'CPF/CNPJ não encontrado no sistema.',
        [{ text: 'OK' }],
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderCPFStep = () => (
    <View style={styles.content}>
      <Text style={styles.title}>Qual seu CPF/CNPJ cadastrado?</Text>

      <Input
        label="CPF ou CNPJ"
        placeholder="CPF ou CNPJ"
        value={cpfCnpj}
        onChangeText={(value) => setCpfCnpj(cpfCnpjMask(value))}
        keyboardType="number-pad"
        editable={!loading}
        icon="creditcard.fill"
      />

      <GradientButton
        title={loading ? 'Aguarde...' : 'Seguir'}
        onPress={handleVerifyCPF}
        loading={loading}
        disabled={loading}
        fullWidth
        style={styles.button}
      />
    </View>
  );

  // Passo 3: Escolher método de contato
  const handleSendCode = async () => {
    setLoading(true);
    try {
      await api.post('/confirmCodeEmail', {
        email: contactInfo.email,
        tipo: selectedContact
      });

      setTimer(90); // 1min e 30s
      setCanResend(false);
      setStep('code');
    } catch (error: any) {
      showAlert('Erro', 'Erro ao enviar código.', [{ text: 'OK' }], 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderContactStep = () => (
    <View style={styles.content}>
      <Text style={styles.title}>Selecione para onde enviar o Código de Segurança</Text>

      <TouchableOpacity
        style={[
          styles.contactOption,
          selectedContact === 'email' && styles.contactOptionSelected
        ]}
        onPress={() => setSelectedContact('email')}
      >
        <View style={styles.contactOptionContent}>
          <Text style={styles.contactOptionLabel}>Email</Text>
          <Text style={styles.contactOptionValue}>{contactInfo.email}</Text>
        </View>
        <View style={[
          styles.radio,
          selectedContact === 'email' && styles.radioSelected
        ]} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.contactOption,
          selectedContact === 'sms' && styles.contactOptionSelected
        ]}
        onPress={() => setSelectedContact('sms')}
      >
        <View style={styles.contactOptionContent}>
          <Text style={styles.contactOptionLabel}>SMS</Text>
          <Text style={styles.contactOptionValue}>{contactInfo.phone}</Text>
        </View>
        <View style={[
          styles.radio,
          selectedContact === 'sms' && styles.radioSelected
        ]} />
      </TouchableOpacity>

      <GradientButton
        title="Enviar"
        onPress={handleSendCode}
        loading={loading}
        disabled={loading}
        fullWidth
        style={styles.button}
      />
    </View>
  );

  // Passo 4: Digite o código
  const handleVerifyCode = async () => {
    const fullCode = code.join('');

    if (fullCode.length !== 6) {
      showAlert('Erro', 'Digite o código de 6 dígitos.', [{ text: 'OK' }], 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/confirmCodeEmail', {
        email: contactInfo.email,
        codigo: fullCode
      });

      if (recoverType === 'email') {
        // Mostrar email encontrado
        setStep('result');
      } else {
        // Ir para alteração de senha
        setStep('result');
      }
    } catch (error: any) {
      showAlert('Erro', 'Código inválido ou expirado.', [{ text: 'OK' }], 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    await handleSendCode();
  };

  const handleCodeChange = (value: string, index: number) => {
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus próximo input
    if (value && index < 5) {
      // Focus próximo campo (você precisará implementar refs)
    }
  };

  const renderCodeStep = () => (
    <View style={styles.content}>
      <Text style={styles.title}>Digite o código enviado</Text>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <View key={index} style={styles.codeDigit}>
            <Text style={styles.codeDigitText}>{digit}</Text>
          </View>
        ))}
      </View>

      <View style={styles.numpad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.numpadButton}
            onPress={() => {
              const emptyIndex = code.findIndex(d => d === '');
              if (emptyIndex !== -1) {
                handleCodeChange(num.toString(), emptyIndex);
              }
            }}
          >
            <Text style={styles.numpadText}>{num}</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.numpadButton} />
        <TouchableOpacity
          style={styles.numpadButton}
          onPress={() => {
            const emptyIndex = code.findIndex(d => d === '');
            if (emptyIndex !== -1) {
              handleCodeChange('0', emptyIndex);
            }
          }}
        >
          <Text style={styles.numpadText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.numpadButton}
          onPress={() => {
            const lastFilledIndex = code.findIndex(d => d === '') - 1;
            if (lastFilledIndex >= 0) {
              handleCodeChange('', lastFilledIndex);
            } else if (code[5] !== '') {
              handleCodeChange('', 5);
            }
          }}
        >
          <Text style={styles.numpadText}>⌫</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>
          Caso não tenha recebido o Código ainda, clique no botão abaixo:
        </Text>

        {timer > 0 ? (
          <Text style={styles.timerText}>Aguarde {formatTime(timer)}</Text>
        ) : (
          <TouchableOpacity onPress={handleResendCode} disabled={loading}>
            <Text style={styles.resendButton}>Reenviar código</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Passo 5: Resultado
  const handleChangePassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      showAlert('Erro', 'Preencha todos os campos.', [{ text: 'OK' }], 'error');
      return;
    }

    if (newPassword.length < 6) {
      showAlert('Erro', 'A senha deve ter pelo menos 6 caracteres.', [{ text: 'OK' }], 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert('Erro', 'As senhas não coincidem.', [{ text: 'OK' }], 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/recuperar_senha', {
        email: contactInfo.email,
        nova_senha: newPassword,
      });

      showAlert(
        'Sucesso',
        'Senha alterada com sucesso!',
        [{ text: 'OK', onPress: () => router.replace('/login') }],
        'success'
      );
    } catch (error: any) {
      showAlert('Erro', 'Não foi possível alterar a senha.', [{ text: 'OK' }], 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderResultStep = () => {
    if (recoverType === 'email') {
      return (
        <View style={styles.content}>
          <Image
            source={require('@/assets/images/ok.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
          <Text style={styles.title}>E-mail Encontrado!</Text>
          <Text style={styles.resultText}>
            Seu e-mail cadastrado é:{'\n\n'}
            <Text style={styles.resultEmail}>{contactInfo.email}</Text>
          </Text>

          <GradientButton
            title="Voltar para o login"
            onPress={() => router.replace('/login')}
            fullWidth
            style={styles.button}
          />
        </View>
      );
    }

    // Alterar senha
    return (
      <View style={styles.content}>
        <Text style={styles.title}>Alterar Senha</Text>

        <Input
          label="Nova Senha"
          placeholder="Nova Senha"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          editable={!loading}
          icon="lock.fill"
        />

        <Input
          label="Confirmar Senha"
          placeholder="Confirmar Senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
          icon="lock.fill"
        />

        <GradientButton
          title="Salvar"
          onPress={handleChangePassword}
          loading={loading}
          disabled={loading}
          fullWidth
          style={styles.button}
        />
      </View>
    );
  };

  return (
    <AuthLayout waveVariant="login">
      {AlertComponent}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            {step === 'choose' && renderChooseStep()}
            {step === 'cpf' && renderCPFStep()}
            {step === 'contact' && renderContactStep()}
            {step === 'code' && renderCodeStep()}
            {step === 'result' && renderResultStep()}

            {step !== 'choose' && step !== 'result' && (
              <TouchableOpacity
                style={styles.backLink}
                onPress={() => {
                  if (step === 'cpf') setStep('choose');
                  else if (step === 'contact') setStep('cpf');
                  else if (step === 'code') setStep('contact');
                }}
              >
                <Text style={styles.backLinkText}>← Voltar</Text>
              </TouchableOpacity>
            )}

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
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    paddingTop: 40,
  },
  illustration: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: AppColors.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: AppColors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  optionButtonSecondary: {
    backgroundColor: AppColors.secondary,
  },
  optionButtonText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: AppColors.white,
  },
  button: {
    marginTop: 24,
  },
  contactOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: AppColors.gray[200],
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  contactOptionSelected: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.gray[100],
  },
  contactOptionContent: {
    flex: 1,
  },
  contactOptionLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: AppColors.text.secondary,
    marginBottom: 4,
  },
  contactOptionValue: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: AppColors.text.primary,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: AppColors.gray[400],
  },
  radioSelected: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary,
    borderWidth: 6,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 40,
  },
  codeDigit: {
    width: 50,
    height: 60,
    backgroundColor: AppColors.gray[200],
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeDigitText: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: AppColors.primary,
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  numpadButton: {
    width: 80,
    height: 60,
    backgroundColor: AppColors.gray[100],
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numpadText: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: AppColors.primary,
  },
  resendContainer: {
    backgroundColor: AppColors.secondary,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: AppColors.white,
    textAlign: 'center',
    marginBottom: 12,
  },
  timerText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: AppColors.white,
  },
  resendButton: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: AppColors.white,
    textDecorationLine: 'underline',
  },
  resultText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: AppColors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  resultEmail: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: AppColors.primary,
  },
  backLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  backLinkText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: AppColors.primary,
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
    marginBottom: 40,
  },
});
