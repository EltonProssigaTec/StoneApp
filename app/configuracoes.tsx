import { AppHeader } from '@/components';
import { useAlert } from '@/components/ui/AlertModal';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { BiometricAuthService } from '@/services/biometric-auth.service';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConfiguracoesScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { showAlert, AlertComponent } = useAlert();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');

  useEffect(() => {
    loadBiometricSettings();
  }, []);

  const loadBiometricSettings = async () => {
    try {
      const available = await BiometricAuthService.isAvailable();
      setBiometricAvailable(available);

      if (available) {
        const type = await BiometricAuthService.getBiometricType();
        setBiometricType(type);
      }

      const enabled = await BiometricAuthService.isBiometricEnabled();
      setBiometricEnabled(enabled);
    } catch (error) {
      console.error('Erro ao carregar configurações de biometria:', error);
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (!biometricAvailable) {
      showAlert(
        'Biometria Indisponível',
        'Seu dispositivo não possui biometria disponível ou não está configurada.',
        [{ text: 'OK' }],
        'warning'
      );
      return;
    }

    if (value) {
      // Ativar biometria - solicitar autenticação
      try {
        const result = await BiometricAuthService.authenticate(
          'Autentique-se para ativar a biometria'
        );

        if (result.success) {
          await BiometricAuthService.setBiometricEnabled(true);
          setBiometricEnabled(true);
          showAlert('Sucesso', 'Biometria ativada com sucesso!', [{ text: 'OK' }], 'success');
        } else {
          showAlert('Falha', 'Autenticação biométrica falhou.', [{ text: 'OK' }], 'error');
        }
      } catch (error) {
        console.error('Erro ao autenticar:', error);
        showAlert('Erro', 'Erro ao ativar biometria.', [{ text: 'OK' }], 'error');
      }
    } else {
      // Desativar biometria
      await BiometricAuthService.setBiometricEnabled(false);
      setBiometricEnabled(false);
      showAlert('Desativado', 'Biometria desativada.', [{ text: 'OK' }], 'info');
    }
  };

  const handleSignOut = () => {
    showAlert(
      'Sair da Conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            signOut();
            router.replace('/login');
          },
        },
      ],
      'warning'
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar
        barStyle="light-content"
        translucent={true}
      />

      {/* Header */}
      <AppHeader title='Configurações' />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Notificações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificações</Text>
          <Card style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <IconSymbol name="bell.fill" size={24} color={AppColors.primary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Notificações Push</Text>
                  <Text style={styles.settingDescription}>
                    Receber notificações sobre pendências
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: AppColors.gray[300], true: AppColors.primary }}
                thumbColor={AppColors.white}
              />
            </View>
          </Card>
        </View>

        {/* Segurança */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Segurança</Text>
          <Card style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <IconSymbol name="faceid" size={24} color={AppColors.primary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>
                    {biometricType || 'Biometria'}
                  </Text>
                  <Text style={styles.settingDescription}>
                    {biometricAvailable
                      ? 'Usar biometria para acessar o app'
                      : 'Não disponível neste dispositivo'}
                  </Text>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                disabled={!biometricAvailable}
                trackColor={{ false: AppColors.gray[300], true: AppColors.primary }}
                thumbColor={AppColors.white}
              />
            </View>
          </Card>

          <Card style={[styles.card, styles.cardButton]}>
            <TouchableOpacity
              style={styles.settingItemButton}
              onPress={() => router.push('/change-password')}
            >
              <View style={styles.settingLeft}>
                <IconSymbol name="lock.fill" size={24} color={AppColors.primary} />
                <Text style={styles.settingTitle}>Alterar Senha</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={AppColors.gray[400]} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Conta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          <Card style={[styles.card, styles.cardButton]}>
            <TouchableOpacity
              style={styles.settingItemButton}
              onPress={() => router.push('/perfil')}
            >
              <View style={styles.settingLeft}>
                <IconSymbol name="person.fill" size={24} color={AppColors.primary} />
                <Text style={styles.settingTitle}>Editar Perfil</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={AppColors.gray[400]} />
            </TouchableOpacity>
          </Card>

          <Card style={[styles.card, styles.cardButton]}>
            <TouchableOpacity
              style={styles.settingItemButton}
              onPress={() => router.push('/termos-uso')}
            >
              <View style={styles.settingLeft}>
                <IconSymbol name="doc.text.fill" size={24} color={AppColors.primary} />
                <Text style={styles.settingTitle}>Termos de Uso</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={AppColors.gray[400]} />
            </TouchableOpacity>
          </Card>

          <Card style={[styles.card, styles.cardButton]}>
            <TouchableOpacity
              style={styles.settingItemButton}
              onPress={() => router.push('/sobre')}
            >
              <View style={styles.settingLeft}>
                <IconSymbol name="info.circle.fill" size={24} color={AppColors.primary} />
                <Text style={styles.settingTitle}>Sobre</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={AppColors.gray[400]} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Sair */}
        <View style={styles.section}>
          <Card style={[styles.card, styles.cardButton, styles.logoutCard]}>
            <TouchableOpacity
              style={styles.settingItemButton}
              onPress={handleSignOut}
            >
              <View style={styles.settingLeft}>
                <IconSymbol name="arrow.right.square.fill" size={24} color={AppColors.error} />
                <Text style={[styles.settingTitle, styles.logoutText]}>Sair da Conta</Text>
              </View>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>

      <AlertComponent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    flex: 1,
    width: '100%',
    ...Platform.select({
      web: {
        maxWidth: 720,
      },
    }),
    backgroundColor: AppColors.background.primary,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text.secondary,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  card: {
    marginBottom: 12,
  },
  cardButton: {
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: AppColors.text.primary,
  },
  settingDescription: {
    fontSize: 13,
    color: AppColors.text.secondary,
    marginTop: 2,
  },
  logoutCard: {
    borderWidth: 1,
    borderColor: AppColors.error,
  },
  logoutText: {
    color: AppColors.error,
  },
});
