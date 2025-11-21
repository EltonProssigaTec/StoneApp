import { useAlert } from '@/components/ui/AlertModal';
import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Input } from '@/components/ui/Input';
import { AppColors, Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api.config';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DeletionReason {
  id: number;
  descricao: string;
  ativo: number | string; // Pode vir como string da API
  sequencia: number | string; // Pode vir como string da API
}

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { showAlert, AlertComponent } = useAlert();
  const [loading, setLoading] = useState(false);
  const [loadingReasons, setLoadingReasons] = useState(true);
  const [reasons, setReasons] = useState<DeletionReason[]>([]);
  const [selectedReason, setSelectedReason] = useState<number | null>(null);
  const [selectedReasonText, setSelectedReasonText] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [password, setPassword] = useState('');

  // Carregar motivos de exclusão
  useEffect(() => {
    loadReasons();
  }, []);

  const loadReasons = async () => {
    try {
      setLoadingReasons(true);
      if (__DEV__) console.log('[DeleteAccount] Buscando motivos de exclusão...');

      const response = await api.get('/monitora/user/motivosexclusao');

      if (__DEV__) {
        console.log('[DeleteAccount] Resposta da API:', {
          status: response.status,
          data: response.data,
          dataType: typeof response.data,
          isArray: Array.isArray(response.data),
        });
      }

      if (response.status === 200 && response.data) {
        // A API pode retornar os dados em diferentes formatos
        let reasonsData = response.data;

        // Se vier dentro de um objeto .data
        if (response.data.data && Array.isArray(response.data.data)) {
          reasonsData = response.data.data;
        }

        if (__DEV__) console.log('[DeleteAccount] Dados extraídos:', reasonsData);

        if (Array.isArray(reasonsData)) {
          const activeReasons = reasonsData
            .filter((item: DeletionReason) => item.ativo === 1 || item.ativo === '1')
            .sort((a: DeletionReason, b: DeletionReason) => {
              const seqA = typeof a.sequencia === 'string' ? parseInt(a.sequencia, 10) : a.sequencia;
              const seqB = typeof b.sequencia === 'string' ? parseInt(b.sequencia, 10) : b.sequencia;
              return seqA - seqB;
            });

          if (__DEV__) console.log('[DeleteAccount] Motivos ativos filtrados:', activeReasons);
          setReasons(activeReasons);
        } else {
          if (__DEV__) console.warn('[DeleteAccount] Dados não são um array:', reasonsData);
          showAlert('Atenção', 'Formato de dados inesperado da API.', [{ text: 'OK' }], 'warning');
        }
      }
    } catch (error: any) {
      if (__DEV__) {
        console.error('[DeleteAccount] Erro ao carregar motivos:', error);
        console.error('[DeleteAccount] Detalhes do erro:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
      }
      showAlert('Erro', 'Não foi possível carregar os motivos de exclusão.', [{ text: 'OK' }], 'error');
    } finally {
      setLoadingReasons(false);
    }
  };

  const handleSelectReason = (reason: DeletionReason) => {
    setSelectedReason(reason.id);
    setSelectedReasonText(reason.descricao);
    setShowDropdown(false);

    // Se não for "Outros", limpa o campo customizado
    if (!reason.descricao.toLowerCase().includes('outro')) {
      setCustomReason('');
    }
  };

  const isOtherReason = () => {
    return selectedReasonText.toLowerCase().includes('outro');
  };

  const handleDeleteAccount = async () => {
    if (!selectedReason) {
      showAlert('Atenção', 'Por favor, selecione um motivo para a exclusão.', [{ text: 'OK' }], 'warning');
      return;
    }

    // Se for "Outros", validar se preencheu o comentário
    if (isOtherReason() && !customReason.trim()) {
      showAlert('Atenção', 'Por favor, informe o motivo da exclusão.', [{ text: 'OK' }], 'warning');
      return;
    }

    if (!password.trim()) {
      showAlert('Atenção', 'Por favor, informe sua senha para confirmar.', [{ text: 'OK' }], 'warning');
      return;
    }

    showAlert(
      'Confirmar exclusão',
      'Esse processo é irreversível.',
      [
        {
          text: 'Fechar',
          style: 'cancel',
        },
        {
          text: 'Excluir conta',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              const selectedReasonData = reasons.find((r) => r.id === selectedReason);

              // Se for "Outros", usa o customReason, senão usa a descrição do motivo selecionado
              const observacao = isOtherReason() ? customReason.trim() : (selectedReasonData?.descricao || '');

              const body = {
                motivo_id: selectedReason,
                observacao,
                senha: password,
              };

              if (__DEV__) console.log('[DeleteAccount] Enviando solicitação:', body);

              const response = await api.put('/monitora/user/solictarexlusao', body);

              if (response.status === 200) {
                showAlert(
                  'Recebemos sua solicitação',
                  'Em até 30 dias você receberá um e-mail confirmando a exclusão dos seus dados.',
                  [
                    {
                      text: 'OK',
                      onPress: async () => {
                        await signOut();
                        router.replace('/login');
                      },
                    },
                  ],
                  'success'
                );
              }
            } catch (error: any) {
              if (__DEV__) console.error('[DeleteAccount] Erro:', error);

              const message = error?.response?.data?.message ||
                             'Não foi possível processar sua solicitação. Verifique sua senha e tente novamente.';

              showAlert('Erro', message, [{ text: 'OK' }], 'error');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      'warning'
    );
  };

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar barStyle="light-content" translucent={true} />

        <AppHeader title="Exclusão de conta" showBack onBackPress={() => router.back()} />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.description}>
            Lamentamos por qualquer inconveniente. Antes de prosseguir, poderia nos informar o
            motivo da sua saída?
          </Text>

          <Card style={styles.card}>
            {loadingReasons ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={AppColors.primary} />
              </View>
            ) : (
              <>
                <Text style={styles.label}>Motivo da exclusão</Text>

                {/* Dropdown */}
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowDropdown(true)}
                >
                  <Text style={selectedReason ? styles.dropdownTextSelected : styles.dropdownPlaceholder}>
                    {selectedReasonText || 'Selecione o motivo'}
                  </Text>
                  <IconSymbol name="chevron.down" size={20} color={AppColors.text.secondary} />
                </TouchableOpacity>

                {/* Se for "Outros", mostra campo de texto */}
                {isOtherReason() && (
                  <Input
                    label="Descreva o motivo"
                    placeholder="Digite aqui o motivo da exclusão"
                    icon="text.alignleft"
                    value={customReason}
                    onChangeText={setCustomReason}
                    multiline
                    numberOfLines={4}
                    style={styles.customReasonInput}
                  />
                )}

                <Input
                  label="Informe sua senha"
                  placeholder="Digite sua senha"
                  icon="lock.fill"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                <View style={styles.warningBox}>
                  <Text style={styles.warningTitle}>⚠️ Atenção</Text>
                  <Text style={styles.warningText}>
                    • Esta ação é irreversível{'\n'}
                    • Você receberá confirmação por e-mail em até 30 dias{'\n'}
                    • Todos os seus dados serão permanentemente removidos
                  </Text>
                </View>

                <Button
                  title="Excluir conta"
                  variant="primary"
                  onPress={handleDeleteAccount}
                  disabled={!selectedReason || !password.trim() || loading}
                  loading={loading}
                  fullWidth
                  style={[styles.deleteButton, { backgroundColor: '#DC3545' }]}
                />

                <Button
                  title="Cancelar"
                  variant="secondary"
                  onPress={() => router.back()}
                  disabled={loading}
                  fullWidth
                  style={{ marginTop: 12 }}
                />
              </>
            )}
          </Card>
        </View>
      </ScrollView>

      {/* Modal Dropdown */}
      <Modal
        visible={showDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione o motivo</Text>

            <ScrollView style={styles.modalScroll}>
              {reasons.map((reason) => (
                <TouchableOpacity
                  key={reason.id}
                  style={[
                    styles.modalOption,
                    selectedReason === reason.id && styles.modalOptionSelected,
                  ]}
                  onPress={() => handleSelectReason(reason)}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      selectedReason === reason.id && styles.modalOptionTextSelected,
                    ]}
                  >
                    {reason.descricao}
                  </Text>
                  {selectedReason === reason.id && (
                    <IconSymbol name="checkmark.circle.fill" size={20} color={AppColors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowDropdown(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Alert Modal */}
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
    alignSelf: 'center',
    ...Platform.select({
      web: {
        maxWidth: 720,
      },
    }),
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  card: {
    padding: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: AppColors.text.primary,
    marginBottom: 12,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 12,
    backgroundColor: AppColors.white,
    marginBottom: 20,
  },
  dropdownPlaceholder: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
  },
  dropdownTextSelected: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: AppColors.text.primary,
  },
  customReasonInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: AppColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Fonts.semiBold,
    color: AppColors.text.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: AppColors.background.primary,
    marginBottom: 12,
  },
  modalOptionSelected: {
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: AppColors.primary,
  },
  modalOptionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: AppColors.text.primary,
    marginRight: 12,
  },
  modalOptionTextSelected: {
    fontFamily: Fonts.medium,
    color: AppColors.primary,
  },
  modalCancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: AppColors.text.secondary,
  },
  warningBox: {
    backgroundColor: '#FFF3CD',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  warningTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: '#856404',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#856404',
    lineHeight: 22,
  },
  deleteButton: {
    marginTop: 8,
  },
});
