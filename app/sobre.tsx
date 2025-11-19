import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppColors, Fonts } from '@/constants/theme';
import Constants from 'expo-constants';
import React from 'react';
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SobreScreen() {
  const appVersion = Constants.expoConfig?.version || '3.1.0';

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error('Erro ao abrir link:', err)
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" translucent={true} />

      <AppHeader title="Sobre" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo e Nome do App */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/res/mipmap-hdpi/ic_launcher.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>StoneApp Monitora</Text>
          <Text style={styles.version}>Versão {appVersion}</Text>
        </View>

        {/* Descrição */}
        <Card style={styles.card}>
          <Text style={styles.description}>
            O StoneApp é sua solução completa para gerenciar pendências financeiras,
            negociar dívidas e manter sua saúde financeira em dia. Com uma interface
            intuitiva e recursos poderosos, ajudamos você a retomar o controle de suas
            finanças.
          </Text>
        </Card>

        {/* Funcionalidades */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Funcionalidades</Text>

          <Card style={styles.featureCard}>
            <View style={styles.feature}>
              <IconSymbol name="doc.text.fill" size={24} color={AppColors.primary} />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Consulta de Pendências</Text>
                <Text style={styles.featureDescription}>
                  Visualize todas as suas dívidas em um só lugar
                </Text>
              </View>
            </View>
          </Card>

          <Card style={styles.featureCard}>
            <View style={styles.feature}>
              <IconSymbol name="chart.bar.fill" size={24} color={AppColors.primary} />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Saúde Financeira</Text>
                <Text style={styles.featureDescription}>
                  Acompanhe sua evolução financeira
                </Text>
              </View>
            </View>
          </Card>

          <Card style={styles.featureCard}>
            <View style={styles.feature}>
              <IconSymbol name="hand.raised.fill" size={24} color={AppColors.primary} />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Negociação de Dívidas</Text>
                <Text style={styles.featureDescription}>
                  Negocie condições especiais diretamente pelo app
                </Text>
              </View>
            </View>
          </Card>

          <Card style={styles.featureCard}>
            <View style={styles.feature}>
              <IconSymbol name="bell.fill" size={24} color={AppColors.primary} />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Notificações</Text>
                <Text style={styles.featureDescription}>
                  Receba alertas sobre prazos e ofertas
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Contato e Suporte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contato e Suporte</Text>

          <Card style={[styles.card, styles.contactCard]}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleOpenLink('mailto:suporte@stoneapp.com.br')}
            >
              <IconSymbol name="envelope.fill" size={20} color={AppColors.primary} />
              <Text style={styles.contactText}>suporte@stoneapp.com.br</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleOpenLink('tel:08001234567')}
            >
              <IconSymbol name="phone.fill" size={20} color={AppColors.primary} />
              <Text style={styles.contactText}>0800 123 4567</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleOpenLink('https://www.stoneapp.com.br')}
            >
              <IconSymbol name="globe" size={20} color={AppColors.primary} />
              <Text style={styles.contactText}>www.stoneapp.com.br</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Redes Sociais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Redes Sociais</Text>

          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleOpenLink('https://facebook.com/stoneapp')}
            >
              <IconSymbol name="person.2.fill" size={24} color={AppColors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleOpenLink('https://instagram.com/stoneapp')}
            >
              <IconSymbol name="camera.fill" size={24} color={AppColors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleOpenLink('https://twitter.com/stoneapp')}
            >
              <IconSymbol name="bubble.left.and.bubble.right.fill" size={24} color={AppColors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleOpenLink('https://linkedin.com/company/stoneapp')}
            >
              <IconSymbol name="briefcase.fill" size={24} color={AppColors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Informações Legais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Legais</Text>

          <Card style={styles.card}>
            <Text style={styles.legalText}>
              <Text style={styles.legalBold}>Empresa:</Text> StoneApp Tecnologia Ltda.
            </Text>
            <Text style={styles.legalText}>
              <Text style={styles.legalBold}>CNPJ:</Text> 12.345.678/0001-90
            </Text>
            <Text style={styles.legalText}>
              <Text style={styles.legalBold}>Endereço:</Text> Rua das Flores, 123 - Centro
            </Text>
            <Text style={styles.legalText}>
              São Paulo - SP, CEP: 01234-567
            </Text>
          </Card>
        </View>

        {/* Copyright */}
        <View style={styles.footer}>
          <Text style={styles.copyright}>
            © 2025 StoneApp. Todos os direitos reservados.
          </Text>
          <Text style={styles.copyright}>
            Desenvolvido com ❤️ para sua saúde financeira
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    ...Platform.select({
      web: {
        maxWidth: 720,
      },
    }),
    backgroundColor: AppColors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
  },
  card: {
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: AppColors.text.primary,
    marginBottom: 16,
  },
  featureCard: {
    marginBottom: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
    lineHeight: 18,
  },
  contactCard: {
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: AppColors.text.primary,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppColors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.gray[200],
  },
  legalText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  legalBold: {
    fontFamily: Fonts.semiBold,
    color: AppColors.text.primary,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
    gap: 4,
  },
  copyright: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
    textAlign: 'center',
  },
});
