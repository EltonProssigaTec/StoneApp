import { useAlert } from '@/components/ui/AlertModal';
import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppColors, Fonts } from '@/constants/theme';
import api from '@/services/api.config';
import { Divida } from '@/services/dividas.service';
import { cpfCnpjMask, dateMask, removeMask } from '@/utils/masks';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UserData {
  id: string;
  name: string;
  cpf_cnpj: string;
  email?: string;
  telefone?: string;
  data_nascimento?: string;
}

export default function MyCpfScreen() {
  const { showAlert, AlertComponent } = useAlert();
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handlePesquisar = async () => {
    // Validação básica
    if (!cpfCnpj.trim()) {
      showAlert('Atenção', 'Por favor, informe o CPF/CNPJ para realizar a busca.', [{ text: 'OK' }], 'warning');
      return;
    }

    try {
      setLoading(true);
      setSearchPerformed(true);
      setUserData(null);
      setDividas([]);

      const cleanCpf = removeMask(cpfCnpj);

      // Calcula a data do período (2000-12-12 = todo o período)
      const periodDate = '2000-12-12 00:00:00';

      console.log('Buscando monitoramento:', `monitora/monitoramento/${cleanCpf}/${periodDate}`);

      // Busca monitoramento completo (dívidas + consultas) usando o endpoint correto
      const monitoramentoResponse = await api.get(`monitora/monitoramento/${cleanCpf}/${periodDate}`);

      if (!monitoramentoResponse.data) {
        showAlert('Não encontrado', 'Nenhum registro encontrado com este CPF/CNPJ.', [{ text: 'OK' }], 'info');
        return;
      }

      // Processa a resposta do monitoramento
      const { data: restricoes, consultas } = monitoramentoResponse.data;

      // Filtra as restrições que devem ser exibidas
      const dividasFiltradas = restricoes
        .map((item: any) => ({
          ...item,
          exibe_monitora: item.exibe_monitora?.length ? item.exibe_monitora : 1,
        }))
        .filter((item: any) => parseInt(item.exibe_monitora, 10) === 1);

      console.log('Restrições encontradas:', dividasFiltradas.length);
      console.log('Consultas encontradas:', consultas?.length || 0);

      // Define os dados do usuário (usa os dados do form preenchido)
      setUserData({
        id: cleanCpf,
        name: nomeCompleto || 'Usuário',
        cpf_cnpj: cleanCpf,
        data_nascimento: dataNascimento,
      });

      setDividas(dividasFiltradas);

    } catch (error: any) {
      console.error('Erro ao pesquisar:', error);
      const errorMessage = error.response?.data?.message || 'Ocorreu um erro ao realizar a pesquisa. Tente novamente.';
      showAlert('Erro', errorMessage, [{ text: 'OK' }], 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.container} edges={[]}>
        <StatusBar
          barStyle="light-content"
          translucent={true}
        />

        {/* Header */}
        <AppHeader title='Meu CPF' />

        {/* Content */}
        <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Ilustração */}
          <View style={styles.illustrationContainer}>
            <Image
              source={require('@/assets/images/flutuante.png')}
              style={styles.illustrationImage}
              resizeMode="contain"
            />
          </View>

          {/* Campo CPF/CNPJ */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <IconSymbol name="number" size={24} color={AppColors.primary} />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>CPF/CNPJ:</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite o CPF ou CNPJ"
                placeholderTextColor={AppColors.gray[400]}
                value={cpfCnpj}
                onChangeText={(text) => setCpfCnpj(cpfCnpjMask(text))}
                keyboardType="numeric"
                maxLength={18}
              />
            </View>
          </View>

          {/* Campo Nome Completo */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <IconSymbol name="person.fill" size={24} color={AppColors.primary} />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>NOME COMPLETO:</Text>
              <TextInput
                style={styles.input}
                placeholder="Escreva seu nome completo."
                placeholderTextColor={AppColors.gray[400]}
                value={nomeCompleto}
                onChangeText={setNomeCompleto}
              />
            </View>
          </View>

          {/* Campo Data de Nascimento */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <IconSymbol name="calendar" size={24} color={AppColors.primary} />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>DATA DE NASCIMENTO:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex.: 20/04/1990"
                placeholderTextColor={AppColors.gray[400]}
                value={dataNascimento}
                onChangeText={(text) => setDataNascimento(dateMask(text))}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>

          {/* Botão Pesquisar */}
          <TouchableOpacity
            style={[styles.searchButton, loading && styles.searchButtonDisabled]}
            onPress={handlePesquisar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={AppColors.white} />
            ) : (
              <Text style={styles.searchButtonText}>PESQUISAR</Text>
            )}
          </TouchableOpacity>

          {/* Resultados da Pesquisa */}
          {searchPerformed && !loading && userData && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsTitle}>Resultados da Pesquisa</Text>

              {/* Card com dados do usuário */}
              <Card style={styles.userCard}>
                <View style={styles.userInfoRow}>
                  <Text style={styles.userInfoLabel}>Nome:</Text>
                  <Text style={styles.userInfoValue}>{userData.name}</Text>
                </View>
                <View style={styles.userInfoRow}>
                  <Text style={styles.userInfoLabel}>CPF/CNPJ:</Text>
                  <Text style={styles.userInfoValue}>{cpfCnpjMask(userData.cpf_cnpj)}</Text>
                </View>
                {userData.email && (
                  <View style={styles.userInfoRow}>
                    <Text style={styles.userInfoLabel}>Email:</Text>
                    <Text style={styles.userInfoValue}>{userData.email}</Text>
                  </View>
                )}
                {userData.telefone && (
                  <View style={styles.userInfoRow}>
                    <Text style={styles.userInfoLabel}>Telefone:</Text>
                    <Text style={styles.userInfoValue}>{userData.telefone}</Text>
                  </View>
                )}
              </Card>

              {/* Resumo de Dívidas */}
              {dividas.length > 0 ? (
                <>
                  <Text style={styles.debtTitle}>Pendências Encontradas ({dividas.length})</Text>
                  {dividas.map((divida) => (
                    <Card key={divida.id} style={styles.debtCard}>
                      <View style={styles.debtCardContent}>
                        <View style={styles.debtCardInfo}>
                          <Text style={styles.debtCardCredor}>{divida.credor}</Text>
                          <Text style={styles.debtCardDescricao}>{divida.descricao}</Text>
                          <Text style={styles.debtCardValor}>
                            R$ {divida.valor?.toFixed(2) || '0,00'}
                          </Text>
                        </View>
                        <View style={[
                          styles.debtCardStatus,
                          divida.status === 'quitado' && styles.debtCardStatusPaid
                        ]}>
                          <Text style={styles.debtCardStatusText}>
                            {divida.status || 'Pendente'}
                          </Text>
                        </View>
                      </View>
                    </Card>
                  ))}
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalValue}>
                      R$ {dividas.reduce((sum, d) => sum + (d.valor || 0), 0).toFixed(2)}
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.noDividas}>
                  <IconSymbol name="checkmark.circle" size={48} color={AppColors.success} />
                  <Text style={styles.noDividasText}>Nenhuma pendência encontrada</Text>
                </View>
              )}
            </View>
          )}

          {searchPerformed && !loading && !userData && (
            <View style={styles.noResults}>
              <IconSymbol name="magnifyingglass" size={48} color={AppColors.gray[400]} />
              <Text style={styles.noResultsText}>Nenhum resultado encontrado</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <AlertComponent />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: AppColors.background.secondary,
  },
  container: {
    flex: 1,
    width: '100%',
    alignSelf: "center",
    ...Platform.select({
      web: {
        maxWidth: 720,
      },
    }),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  illustrationContainer: {
    width: '100%',
    height: 300,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    left: '15%',
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: AppColors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.gray[200],
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    gap: 12,
    minHeight: 100,
  },
  inputIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: AppColors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  inputContent: {
    flex: 1,
    gap: 7,
  },
  inputLabel: {
    color: AppColors.text.primary,
    fontFamily: Fonts.medium,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
  },
  input: {
    color: AppColors.gray[400],
    fontFamily: Fonts.regular,
    fontSize: 11,
    letterSpacing: 1,
    padding: 0,
  },
  searchButton: {
    backgroundColor: AppColors.secondary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    alignSelf: 'center',
    minWidth: 128,
  },
  searchButtonText: {
    color: AppColors.white,
    fontFamily: Fonts.regular,
    fontSize: 15,
    letterSpacing: 1,
    textAlign: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  resultsContainer: {
    marginTop: 32,
    gap: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: AppColors.text.primary,
    marginBottom: 8,
  },
  userCard: {
    padding: 16,
    gap: 12,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  userInfoLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: AppColors.text.secondary,
  },
  userInfoValue: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: AppColors.text.primary,
    flex: 1,
    textAlign: 'right',
  },
  debtTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: AppColors.text.primary,
    marginTop: 8,
  },
  debtCard: {
    padding: 12,
  },
  debtCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  debtCardInfo: {
    flex: 1,
    gap: 4,
  },
  debtCardCredor: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: AppColors.text.primary,
  },
  debtCardDescricao: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
  },
  debtCardValor: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: AppColors.primary,
    marginTop: 4,
  },
  debtCardStatus: {
    backgroundColor: AppColors.error + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  debtCardStatusPaid: {
    backgroundColor: AppColors.success + '20',
  },
  debtCardStatusText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: AppColors.error,
    textTransform: 'capitalize',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: AppColors.background.primary,
    padding: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: AppColors.text.primary,
  },
  totalValue: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: AppColors.primary,
  },
  noDividas: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  noDividasText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: AppColors.success,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  noResultsText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: AppColors.text.secondary,
  },
});
