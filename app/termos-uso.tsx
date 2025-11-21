import { AppHeader } from '@/components/ui/AppHeader';
import { AppColors, Fonts } from '@/constants/theme';
import React from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermosUsoScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" translucent={true} />

      <AppHeader title="Termos de Uso" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Termos de Uso do StoneApp</Text>
          <Text style={styles.lastUpdate}>Última atualização: Janeiro de 2025</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Aceitação dos Termos</Text>
          <Text style={styles.paragraph}>
            Ao acessar e usar o StoneApp, você concorda em cumprir e estar vinculado aos
            seguintes termos e condições de uso. Se você não concordar com qualquer parte
            destes termos, não use o aplicativo.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Descrição do Serviço</Text>
          <Text style={styles.paragraph}>
            O StoneApp é uma plataforma digital que permite aos usuários:
          </Text>
          <Text style={styles.bulletPoint}>• Consultar pendências financeiras</Text>
          <Text style={styles.bulletPoint}>• Negociar dívidas</Text>
          <Text style={styles.bulletPoint}>• Acompanhar acordos</Text>
          <Text style={styles.bulletPoint}>• Gerenciar informações pessoais</Text>
          <Text style={styles.bulletPoint}>• Receber ofertas e promoções</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Cadastro e Conta</Text>
          <Text style={styles.paragraph}>
            Para usar o StoneApp, você deve:
          </Text>
          <Text style={styles.bulletPoint}>• Fornecer informações precisas e completas</Text>
          <Text style={styles.bulletPoint}>• Manter suas informações atualizadas</Text>
          <Text style={styles.bulletPoint}>• Manter a confidencialidade de sua senha</Text>
          <Text style={styles.bulletPoint}>• Ser responsável por todas as atividades em sua conta</Text>
          <Text style={styles.bulletPoint}>• Ter pelo menos 18 anos de idade</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Privacidade e Proteção de Dados</Text>
          <Text style={styles.paragraph}>
            Levamos sua privacidade a sério. Coletamos, usamos e protegemos suas informações
            pessoais de acordo com a Lei Geral de Proteção de Dados (LGPD). Suas informações
            são usadas para:
          </Text>
          <Text style={styles.bulletPoint}>• Fornecer e melhorar nossos serviços</Text>
          <Text style={styles.bulletPoint}>• Processar transações</Text>
          <Text style={styles.bulletPoint}>• Enviar notificações importantes</Text>
          <Text style={styles.bulletPoint}>• Prevenir fraudes</Text>
          <Text style={styles.bulletPoint}>• Cumprir obrigações legais</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Uso Aceitável</Text>
          <Text style={styles.paragraph}>Você concorda em NÃO:</Text>
          <Text style={styles.bulletPoint}>• Usar o app para fins ilegais</Text>
          <Text style={styles.bulletPoint}>• Tentar acessar contas de outros usuários</Text>
          <Text style={styles.bulletPoint}>• Transmitir vírus ou códigos maliciosos</Text>
          <Text style={styles.bulletPoint}>• Fazer engenharia reversa do aplicativo</Text>
          <Text style={styles.bulletPoint}>• Usar o app para spam ou fraude</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Informações Financeiras</Text>
          <Text style={styles.paragraph}>
            As informações sobre dívidas e pendências financeiras são fornecidas por terceiros
            credores. Não garantimos a precisão absoluta dessas informações. Recomendamos que
            você verifique diretamente com os credores em caso de dúvidas.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Negociações e Acordos</Text>
          <Text style={styles.paragraph}>
            As negociações e acordos realizados através do app são vinculantes. Você é
            responsável por cumprir com os termos de qualquer acordo firmado. O não pagamento
            pode resultar em ações de cobrança.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Propriedade Intelectual</Text>
          <Text style={styles.paragraph}>
            Todo o conteúdo do StoneApp, incluindo textos, gráficos, logos, ícones e software,
            é propriedade da StoneApp ou de seus licenciadores e está protegido por leis de
            direitos autorais.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Limitação de Responsabilidade</Text>
          <Text style={styles.paragraph}>
            O StoneApp é fornecido "como está". Não garantimos que o serviço será
            ininterrupto, seguro ou livre de erros. Não somos responsáveis por:
          </Text>
          <Text style={styles.bulletPoint}>• Danos indiretos ou consequenciais</Text>
          <Text style={styles.bulletPoint}>• Perda de dados</Text>
          <Text style={styles.bulletPoint}>• Problemas técnicos</Text>
          <Text style={styles.bulletPoint}>• Ações de terceiros</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Modificações dos Termos</Text>
          <Text style={styles.paragraph}>
            Reservamo-nos o direito de modificar estes termos a qualquer momento. As mudanças
            entrarão em vigor imediatamente após a publicação. O uso continuado do app após
            as modificações constitui aceitação dos novos termos.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Cancelamento de Conta</Text>
          <Text style={styles.paragraph}>
            Você pode solicitar o cancelamento de sua conta a qualquer momento através das
            configurações do app. O cancelamento pode resultar na perda de acesso a informações
            e serviços.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Lei Aplicável</Text>
          <Text style={styles.paragraph}>
            Estes termos são regidos pelas leis brasileiras. Quaisquer disputas serão resolvidas
            nos tribunais do Brasil.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Contato</Text>
          <Text style={styles.paragraph}>
            Para questões sobre estes termos, entre em contato:
          </Text>
          <Text style={styles.bulletPoint}>• Email: suporte@stoneapp.com.br</Text>
          <Text style={styles.bulletPoint}>• Telefone: 0800 123 4567</Text>
          <Text style={styles.bulletPoint}>• Horário: Segunda a Sexta, 9h às 18h</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Ao usar o StoneApp, você confirma que leu, compreendeu e concorda com estes Termos
            de Uso.
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
    backgroundColor: AppColors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
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
  lastUpdate: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: AppColors.text.primary,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
    lineHeight: 22,
    marginLeft: 8,
    marginBottom: 4,
  },
  footer: {
    backgroundColor: AppColors.background.secondary,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  footerText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: AppColors.text.primary,
    lineHeight: 20,
    textAlign: 'center',
  },
});
