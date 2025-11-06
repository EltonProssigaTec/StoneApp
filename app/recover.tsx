import { AuthLayout } from '@/components/layouts/AuthLayout';
import { useAlert } from '@/components/ui/AlertModal';
import { Button } from '@/components/ui/Button';
import { GradientButton } from '@/components/ui/GradientButton';
import { Input } from '@/components/ui/Input';
import { AppColors, Fonts } from '@/constants/theme';
import api from '@/services/api.config';
import { cpfCnpjMask, removeMask, validateCNPJ, validateCPF } from '@/utils/masks';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type RecoverType = 'email' | 'password';
type RecoverStep = 'choose' | 'cpf' | 'contact' | 'code' | 'result';

interface UserContactInfo {
  email: string;
  phone: string;
}

export default function RecoverScreen() {
  // Função para mascarar e-mail: mostra 3 primeiros e 3 últimos caracteres do usuário
function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [user, domain] = email.split('@');
  if (user.length <= 6) {
    return `${user[0]}***@${domain}`;
  }
  const prefix = user.slice(0, 3);
  const suffix = user.slice(-3);
  return `${prefix}***${suffix}@${domain}`;
}

// Função para mascarar telefone: mantém DDD e últimos 3 dígitos
function maskPhone(phone: string): string {
  if (!phone) return '';
  // Remove tudo que não for número
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) return phone;

  const ddd = digits.slice(0, 2);
  const middle = digits.slice(2, -3);
  const end = digits.slice(-3);
  const maskedMiddle = middle.slice(0, 3) + '***';
  return `${ddd} ${maskedMiddle}${end}`;
}
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
  const [userData, setUserData] = useState<any>(null);

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

      <GradientButton
        title="Recuperar e-mail"
        onPress={() => {
          setRecoverType('email');
          setStep('cpf');
        }}
        fullWidth
        style={styles.button}

      />
      <GradientButton
        title="Recuperar senha"
        onPress={() => {
          setRecoverType('password');
          setStep('cpf');
        }}
        style={styles.button}
        variant='secondary'
      />
      <Button
        title="Voltar"
        variant="outline"
        onPress={() => router.push('/login')}
        fullWidth
        style={[styles.createAccountButton, { position: 'relative', bottom: 0 }]}
        disabled={loading}
      />
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

      if (__DEV__) {
        console.log('[Recover] Dados do usuário:', userData);
      }

      setUserData(response.data.data);

      setContactInfo({
        email: maskEmail(userData.email || ''),
        phone: maskPhone(userData.telefone || '')
      });      

      setStep('contact');
    } catch (error: any) {
      if (__DEV__) console.error('[Recover] Erro ao verificar CPF:', error);
      showAlert(
        'Erro',
        error.response?.data?.message || 'CPF/CNPJ não encontrado no sistema.',
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
      // Use dados reais, removendo máscara se necessário
      if (selectedContact === 'email') {
        await api.post('/sendCodeEmail', {
          email: userData.email // <-- guarde o valor original aqui
        });
      } else {
        await api.post('/sendCodeSms', {
          telefone: userData.telefone // <-- idem
        });
      }
  
      setTimer(120);
      setCanResend(false);
      setStep('code');
    } catch (error: any) {
      if (__DEV__) console.error('[Recover] Erro ao enviar código:', error);
      showAlert('Erro', 'Erro ao enviar código. Tente novamente.', [{ text: 'OK' }], 'error');
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
          <Text style={styles.contactOptionValue}>
            {contactInfo.phone ? `${contactInfo.phone}` : 'Telefone não cadastrado'}
          </Text>
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
  const handleVerifyCode = async (codeToVerify?: string) => {
    const fullCode = codeToVerify || code.join('');

    if (fullCode.length !== 6) {
      showAlert('Erro', 'Digite o código de 6 dígitos.', [{ text: 'OK' }], 'error');
      return;
    }

    setLoading(true);
    try {
      // Usar endpoint correto baseado no tipo de contato usado, com dados originais
      let response;
      if (selectedContact === 'email') {
        response = await api.post('/confirmCodeEmail', {
          email: userData.email, // Usar email original, não mascarado
          codigo: fullCode
        });
      } else {
        response = await api.post('/confirmCodeSms', {
          telefone: userData.telefone, // Usar telefone original, não mascarado
          codigo: fullCode
        });
      }

      // Verificar resposta do servidor
      if (__DEV__) console.log('[Recover] Resposta da verificação de código:', response.data);

      if (response.data?.message === 'Confirmado com sucesso!' || response.status === 200) {
        if (recoverType === 'email') {
          // Mostrar email encontrado
          setStep('result');
        } else {
          // Ir para alteração de senha
          setStep('result');
        }
      } else {
        throw new Error('Código inválido');
      }
    } catch (error: any) {
      if (__DEV__) console.error('[Recover] Erro ao verificar código:', error);

      // Mensagem mais específica baseada no erro
      const errorMessage = error.response?.data?.message || 'Código inválido ou expirado. Tente novamente.';
      showAlert('Código Incorreto', errorMessage, [{ text: 'OK' }], 'error');

      // Limpar código em caso de erro
      setCode(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setCode(['', '', '', '', '', '']); // Limpar código anterior
    await handleSendCode();
  };

  const handleCodeChange = (value: string, index: number) => {
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Verificar se o código está completo e validar automaticamente
    const fullCode = newCode.join('');
    if (fullCode.length === 6) {
      // Aguarda um momento para o usuário ver o código completo
      setTimeout(() => {
        handleVerifyCode(fullCode);
      }, 300);
    }
  };

  const renderCodeStep = () => (
    <View style={styles.codeStepContainer}>
      <View style={styles.codeHeaderSection}>
        <Text style={styles.title}>Digite o código enviado</Text>
        <Text style={styles.subtitle}>
          Enviado via {selectedContact === 'email' ? 'Email' : 'SMS'} para{' '}
          {selectedContact === 'email' ? contactInfo.email : `+55 ${contactInfo.phone}`}
        </Text>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <View key={index} style={styles.codeDigit}>
              <Text style={styles.codeDigitText}>{digit}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.numpad}>
        {/* Linha 1: 1, 2, 3 */}
        {[1, 2, 3].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.numpadButton}
            onPress={() => {
              const emptyIndex = code.findIndex(d => d === '');
              if (emptyIndex !== -1) {
                handleCodeChange(num.toString(), emptyIndex);
              }
            }}
            disabled={loading}
          >
            <Text style={styles.numpadText}>{num}</Text>
          </TouchableOpacity>
        ))}

        {/* Linha 2: 4, 5, 6 */}
        {[4, 5, 6].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.numpadButton}
            onPress={() => {
              const emptyIndex = code.findIndex(d => d === '');
              if (emptyIndex !== -1) {
                handleCodeChange(num.toString(), emptyIndex);
              }
            }}
            disabled={loading}
          >
            <Text style={styles.numpadText}>{num}</Text>
          </TouchableOpacity>
        ))}

        {/* Linha 3: 7, 8, 9 */}
        {[7, 8, 9].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.numpadButton}
            onPress={() => {
              const emptyIndex = code.findIndex(d => d === '');
              if (emptyIndex !== -1) {
                handleCodeChange(num.toString(), emptyIndex);
              }
            }}
            disabled={loading}
          >
            <Text style={styles.numpadText}>{num}</Text>
          </TouchableOpacity>
        ))}

        {/* Linha 4: vazio, 0, backspace */}
        <View style={styles.numpadButton} />
        <TouchableOpacity
          style={styles.numpadButton}
          onPress={() => {
            const emptyIndex = code.findIndex(d => d === '');
            if (emptyIndex !== -1) {
              handleCodeChange('0', emptyIndex);
            }
          }}
          disabled={loading}
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
          disabled={loading}
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
          <GradientButton
            title="Reenviar código"
            onPress={handleResendCode}
            loading={loading}
            disabled={loading}
            variant="secondary"
            fullWidth
            style={styles.resendButtonGradient}
          />
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
        email: userData.email, // Usar email original, não mascarado
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
            <Text style={styles.resultEmail}>{userData.email}</Text>
          </Text>
          <Button
            title="Voltar"
            variant="outline"
            onPress={() => router.push('/login')}
            fullWidth
            style={[styles.createAccountButton, { position: 'absolute', bottom: 75 }]}
            disabled={loading}
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
        <Button
          title="Voltar"
          variant="outline"
          onPress={() => router.push('/login')}
          fullWidth
          style={[styles.createAccountButton, { position: 'absolute', bottom: 75 }]}
          disabled={loading}
        />
      </View>
    );
  };

  return (
    <AuthLayout waveVariant="login">
      <AlertComponent />
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
              <Button
                title="Voltar"
                variant="outline"
                onPress={() => {
                  if (step === 'cpf') setStep('choose');
                  else if (step === 'contact') setStep('cpf');
                  else if (step === 'code') setStep('contact');
                }}
                fullWidth
                style={[styles.createAccountButton, { position: 'relative', marginTop: 0, marginBottom: 20 }]}
                disabled={loading}
              />
            )}
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
  content: {
    flex: 1,
  },
  illustration: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: AppColors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: AppColors.primary,
    paddingVertical: 16,
    borderRadius: 12,
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
    marginBottom: 16,
    width: 250,
  },
  createAccountButton: {
    borderWidth: 1.5,
    alignSelf: 'center',
    width: 250,
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
    gap: 8,
  },
  codeDigit: {
    width: Platform.OS === 'web' ? 50 : 45,
    height: Platform.OS === 'web' ? 60 : 55,
    backgroundColor: AppColors.gray[200],
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeDigitText: {
    fontSize: Platform.OS === 'web' ? 28 : 24,
    fontFamily: Fonts.bold,
    color: AppColors.primary,
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: Platform.OS === 'web' ? 280 : 250,
    alignSelf: 'center',
    marginVertical: 24,
  },
  numpadButton: {
    width: Platform.OS === 'web' ? 80 : 70,
    height: Platform.OS === 'web' ? 60 : 55,
    backgroundColor: AppColors.gray[100],
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    margin: Platform.OS === 'web' ? 6 : 5,
  },
  numpadText: {
    fontSize: Platform.OS === 'web' ? 24 : 22,
    fontFamily: Fonts.bold,
    color: AppColors.primary,
  },
  resendContainer: {
    borderRadius: 16,
    marginTop: 0,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: AppColors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
    },
  timerText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: AppColors.secondary,
  },
  resendButton: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: AppColors.white,
    textDecorationLine: 'underline',
  },
  resendButtonGradient: {
    marginTop: 0,
    maxWidth: 250,
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
  codeStepContainer: {
    ...Platform.select({
      web: {
        paddingVertical: 20,
      },
      default: {
        paddingVertical: 20,
      },
    }),
  },
  codeHeaderSection: {
  },
});
