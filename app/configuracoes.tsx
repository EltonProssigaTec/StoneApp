import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppColors } from '@/constants/theme';

export default function ConfiguracoesScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title="Configurações"
        showBack
        onBackPress={() => router.back()}
      />

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
                  <Text style={styles.settingTitle}>Biometria</Text>
                  <Text style={styles.settingDescription}>
                    Usar biometria para acessar o app
                  </Text>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: AppColors.gray[300], true: AppColors.primary }}
                thumbColor={AppColors.white}
              />
            </View>
          </Card>

          <Card style={[styles.card, styles.cardButton]}>
            <TouchableOpacity style={styles.settingItemButton}>
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
            <TouchableOpacity style={styles.settingItemButton}>
              <View style={styles.settingLeft}>
                <IconSymbol name="person.fill" size={24} color={AppColors.primary} />
                <Text style={styles.settingTitle}>Editar Perfil</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={AppColors.gray[400]} />
            </TouchableOpacity>
          </Card>

          <Card style={[styles.card, styles.cardButton]}>
            <TouchableOpacity style={styles.settingItemButton}>
              <View style={styles.settingLeft}>
                <IconSymbol name="doc.text.fill" size={24} color={AppColors.primary} />
                <Text style={styles.settingTitle}>Termos de Uso</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={AppColors.gray[400]} />
            </TouchableOpacity>
          </Card>

          <Card style={[styles.card, styles.cardButton]}>
            <TouchableOpacity style={styles.settingItemButton}>
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
              onPress={() => router.replace('/login')}
            >
              <View style={styles.settingLeft}>
                <IconSymbol name="arrow.right.square.fill" size={24} color={AppColors.error} />
                <Text style={[styles.settingTitle, styles.logoutText]}>Sair da Conta</Text>
              </View>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background.secondary,
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
