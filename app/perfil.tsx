import { useAlert } from '@/components/ui/AlertModal';
import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Input } from '@/components/ui/Input';
import { AppColors, Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import api, { settings } from '@/services/api.config';
import { cepMask, cpfMask, dateMask, phoneMask } from '@/utils/masks';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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

// Helper para obter avatar padrão da API
const getDefaultAvatar = (userName?: string) => {
  if (userName) {
    // Gera avatar baseado no nome do usuário
    return `https://avatar.iran.liara.run/username?username=${encodeURIComponent(userName)}`;
  }
  // Avatar público aleatório
  return 'https://avatar.iran.liara.run/public';
};

export default function PerfilScreen() {
  const router = useRouter();
  const { user, updateUser, setUser } = useAuth();
  const { showAlert, AlertComponent } = useAlert();
  const [editing, setEditing] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    telefone: user?.telefone || '',
    data_nascimento: '', // Será preenchido pelo useEffect
    cep: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: '',
    complemento: '',
  });
  const [loadingAddress, setLoadingAddress] = useState(false);

  // Carregar endereço do usuário e dados pessoais
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;

      // Converter data_nascimento de YYYY-MM-DD para DD/MM/AAAA
      let dataNascimentoFormatted = '';
      if (user.data_nascimento) {
        const [year, month, day] = user.data_nascimento.split('-');
        dataNascimentoFormatted = `${day}/${month}/${year}`;
      }

      try {
        // Buscar endereço da API
        const response = await api.post('/monitora/endereco_usuario', { id: user.id });
        if (response.status === 200 && response.data?.data?.length > 0) {
          const addressData = response.data.data[0];

          setFormData((prev) => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
            telefone: user.telefone || '',
            data_nascimento: dataNascimentoFormatted,
            cep: addressData.cep || '',
            endereco: addressData.endereco || '',
            numero: addressData.numero || '',
            bairro: addressData.bairro || '',
            cidade: addressData.municipio || '',
            uf: addressData.uf || '',
            complemento: addressData.complemento || '',
          }));
        } else {
          // Sem endereço cadastrado, usar apenas dados do usuário
          setFormData((prev) => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
            telefone: user.telefone || '',
            data_nascimento: dataNascimentoFormatted,
          }));
        }
      } catch (error: any) {
        // Se erro 400 ou 404, significa que não tem endereço cadastrado ainda (comportamento esperado para novos usuários)
        // Apenas loga se for um erro diferente de 400/404
        const status = error?.response?.status;
        if (__DEV__ && status !== 400 && status !== 404) {
          console.error('[Perfil] Erro inesperado ao carregar endereço:', error);
        }

        // Preencher apenas com dados pessoais do usuário
        setFormData((prev) => ({
          ...prev,
          name: user.name || '',
          email: user.email || '',
          telefone: user.telefone || '',
          data_nascimento: dataNascimentoFormatted,
        }));
      }
    };

    loadUserData();
  }, [user?.id, user?.data_nascimento, user?.telefone, user?.name, user?.email]);

  // Buscar endereço por CEP
  const handleCEPSearch = async (cep: string) => {
    // Aplicar máscara
    const maskedCEP = cepMask(cep);
    const cleanCEP = cep.replace(/\D/g, '');
    setFormData((prev) => ({ ...prev, cep: maskedCEP }));

    if (cleanCEP.length === 8) {
      setLoadingAddress(true);
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        if (response.data && !response.data.erro) {
          setFormData((prev) => ({
            ...prev,
            endereco: response.data.logradouro || '',
            bairro: response.data.bairro || '',
            cidade: response.data.localidade || '',
            uf: response.data.uf || '',
          }));
        }
      } catch (error) {
        if (__DEV__) console.error('[Perfil] Erro ao buscar CEP:', error);
      } finally {
        setLoadingAddress(false);
      }
    }
  };

  // Upload de foto para o servidor
  const uploadPhotoToServer = async (uriLocal: string): Promise<string | null> => {
    if (uploading) {
      if (__DEV__) console.log('[Perfil] Upload já em andamento, ignorando...');
      return null;
    }

    try {
      if (__DEV__) console.log('[Perfil] Iniciando upload da imagem:', uriLocal);
      setUploading(true);

      if (!user?.email) {
        if (__DEV__) console.error('[Perfil] Email do usuário não encontrado');
        showAlert('Erro', 'Dados do usuário não encontrados', [{ text: 'OK' }], 'error');
        return null;
      }

      // Criar FormData seguindo o padrão do monitora_mobile
      const formData = new FormData();
      formData.append('doc', {
        uri: uriLocal,
        name: 'perfil.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append('email', user.email);

      if (__DEV__) console.log('[Perfil] Enviando para API...');

      // Fazer upload para o servidor
      const response = await api.post('monitora/anexar_foto_perfil', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (__DEV__) console.log('[Perfil] Resposta da API:', response.status, response.data);

      if (response.status === 200) {
        // Extrair o nome do arquivo retornado pela API
        const filename = response.data?.data;

        if (filename) {
          // Retornar apenas o nome do arquivo (será combinado com FILES_URL na exibição)
          return filename;
        } else {
          // Se não retornou filename, usar a URI local temporariamente
          return uriLocal;
        }
      } else {
        showAlert('Erro', 'Erro ao enviar foto', [{ text: 'OK' }], 'error');
        return null;
      }
    } catch (error: any) {
      if (__DEV__) console.error('[Perfil] Erro no upload:', error);
      showAlert('Erro', 'Falha ao enviar foto. Verifique sua conexão.', [{ text: 'OK' }], 'error');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoOptions = () => {
    setShowPhotoOptions(true);
  };

  // Salvar foto no banco de dados
  const savePhotoToDatabase = async (filename: string) => {
    try {
      if (__DEV__) console.log('[Perfil] Salvando foto no banco:', filename);

      // Atualizar perfil no banco de dados
      const response = await api.post('/monitora/editar_usuario', {
        id: user?.id,
        name: user?.name || '',
        email: user?.email || '',
        cpf_cnpj: user?.cpf_cnpj || user?.cpf || '',
        data_nascimento: user?.data_nascimento || '',
        telefone: user?.telefone || '',
        perfil: filename, // Campo que salva a foto no banco
      });

      if (response.status === 200) {
        // Atualizar APENAS a foto no estado (não salva no AsyncStorage até próximo login)
        if (user) {
          setUser({ ...user, picture: filename });
        }
        showAlert('Sucesso', 'Foto de perfil atualizada!', [{ text: 'OK' }], 'success');

        if (__DEV__) console.log('[Perfil] Foto atualizada no estado (não persistido no AsyncStorage)');
      }
    } catch (error) {
      if (__DEV__) console.error('[Perfil] Erro ao salvar foto no banco:', error);
      showAlert('Erro', 'Foto enviada mas não foi possível salvar no perfil.', [{ text: 'OK' }], 'error');
    }
  };

  const handleTakePhoto = async () => {
    setShowPhotoOptions(false);

    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      showAlert('Permissão Necessária', 'Precisamos de permissão para acessar a câmera.', [{ text: 'OK' }], 'warning');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Mesma qualidade do monitora_mobile
    });

    if (!result.canceled && result.assets[0]) {
      // Fazer upload para o servidor
      const filename = await uploadPhotoToServer(result.assets[0].uri);

      if (filename) {
        // Salvar foto no banco de dados
        await savePhotoToDatabase(filename);
      }
    }
  };

  const handlePickFromGallery = async () => {
    setShowPhotoOptions(false);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      showAlert('Permissão Necessária', 'Precisamos de permissão para acessar suas fotos.', [{ text: 'OK' }], 'warning');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Mesma qualidade do monitora_mobile
    });

    if (!result.canceled && result.assets[0]) {
      // Fazer upload para o servidor
      const filename = await uploadPhotoToServer(result.assets[0].uri);

      if (filename) {
        // Salvar foto no banco de dados
        await savePhotoToDatabase(filename);
      }
    }
  };

  const handleRemovePhoto = () => {
    setShowPhotoOptions(false);

    showAlert(
      'Remover Foto',
      'Tem certeza que deseja remover sua foto de perfil?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              if (__DEV__) console.log('[Perfil] Removendo foto do banco...');

              // Remover foto do banco de dados
              const response = await api.post('/monitora/editar_usuario', {
                id: user?.id,
                name: user?.name || '',
                email: user?.email || '',
                cpf_cnpj: user?.cpf_cnpj || user?.cpf || '',
                data_nascimento: user?.data_nascimento || '',
                telefone: user?.telefone || '',
                perfil: '', // Remove foto
              });

              if (response.status === 200) {
                // Atualizar APENAS no estado (não salva no AsyncStorage)
                if (user) {
                  setUser({ ...user, picture: '' });
                }
                showAlert('Sucesso', 'Foto de perfil removida!', [{ text: 'OK' }], 'success');

                if (__DEV__) console.log('[Perfil] Foto removida do estado (não persistido no AsyncStorage)');
              }
            } catch (error) {
              if (__DEV__) console.error('[Perfil] Erro ao remover foto:', error);
              showAlert('Erro', 'Não foi possível remover a foto.', [{ text: 'OK' }], 'error');
            }
          },
        },
      ],
      'warning'
    );
  };

  const handleSave = async () => {
    try {
      // Converter data de DD/MM/AAAA para YYYY-MM-DD
      let dataNascimentoAPI = '';
      if (formData.data_nascimento) {
        const [day, month, year] = formData.data_nascimento.split('/');
        if (day && month && year) {
          dataNascimentoAPI = `${year}-${month}-${day}`;
        }
      }

      // Enviar dados para a API seguindo padrão do monitora_mobile
      const response = await api.post('/monitora/editar_usuario', {
        id: user?.id,
        name: formData.name,
        email: formData.email,
        cpf_cnpj: user?.cpf_cnpj || user?.cpf || '',
        data_nascimento: dataNascimentoAPI,
        telefone: formData.telefone,
        cep: formData.cep,
        endereco: formData.endereco,
        bairro: formData.bairro,
        cidade: formData.cidade,
        uf: formData.uf,
        numero: formData.numero,
        complemento: formData.complemento,
        perfil: user?.picture || '',
      });

      if (response.status === 200) {
        // Atualizar dados locais no contexto
        await updateUser({
          name: formData.name,
          email: formData.email,
          telefone: formData.telefone,
          data_nascimento: dataNascimentoAPI,
        });

        setEditing(false);
        showAlert('Sucesso', 'Perfil atualizado com sucesso!', [{ text: 'OK' }], 'success');
      }
    } catch (error) {
      if (__DEV__) console.error('[Perfil] Erro ao salvar:', error);
      showAlert('Erro', 'Não foi possível atualizar o perfil.', [{ text: 'OK' }], 'error');
    }
  };

  const handleDeleteAccount = () => {
    // Navegar para tela de exclusão de conta (será criada)
    router.push('/delete-account' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar
        barStyle="light-content"
        translucent={true}
      />

      {/* Header */}
      <AppHeader title='Meu Perfil' />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePhotoOptions} style={styles.avatarContainer}>
            <Image
              source={{
                uri: user?.picture
                  ? (user.picture.startsWith('http') || user.picture.startsWith('file')
                    ? user.picture
                    : settings.FILES_URL + user.picture)
                  : getDefaultAvatar(user?.name)
              }}
              style={styles.avatar}
            />
            <View style={styles.cameraButton}>
              <IconSymbol name="camera.fill" size={16} color={AppColors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
          <Text style={styles.userPlan}>{user?.plano || 'Plano Gratuito'}</Text>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Informações Pessoais</Text>
            {!editing && (
              <TouchableOpacity onPress={() => setEditing(true)} style={styles.editButton}>
                <IconSymbol name="pencil" size={18} color={AppColors.primary} />
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>
            )}
          </View>

          <Card style={styles.card}>
            <Input
              label="Nome"
              placeholder="Digite seu nome"
              icon="person.fill"
              value={formData.name}
              onChangeText={(value) => setFormData({ ...formData, name: value })}
              editable={editing}
            />

            <Input
              label="Email"
              placeholder="Digite seu email"
              icon="envelope.fill"
              value={formData.email}
              onChangeText={(value) => setFormData({ ...formData, email: value })}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
            />

            <Input
              label="CPF"
              placeholder="CPF"
              icon="creditcard.fill"
              value={cpfMask(user?.cpf_cnpj || user?.cpf || '')}
              editable={false}
            />

            <Input
              label="Telefone"
              placeholder="(00) 00000-0000"
              icon="phone.fill"
              value={formData.telefone}
              onChangeText={(value) => setFormData({ ...formData, telefone: phoneMask(value) })}
              keyboardType="phone-pad"
              editable={editing}
            />

            <Input
              label="Data de Nascimento"
              placeholder="DD/MM/AAAA"
              icon="calendar"
              value={formData.data_nascimento}
              onChangeText={(value) => setFormData({ ...formData, data_nascimento: dateMask(value) })}
              keyboardType="numeric"
              editable={editing}
            />
          </Card>
        </View>

        {/* Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Endereço</Text>

          <Card style={styles.card}>
            <Input
              label="CEP"
              placeholder="00000-000"
              icon="location.fill"
              value={formData.cep}
              onChangeText={handleCEPSearch}
              keyboardType="numeric"
              editable={editing}
            />

            <Input
              label="Endereço"
              placeholder="Rua, Avenida..."
              icon="house.fill"
              value={formData.endereco}
              onChangeText={(value) => setFormData({ ...formData, endereco: value })}
              editable={editing}
            />

            <View style={styles.row}>
              <View style={styles.inputSmall}>
                <Input
                  label="Número"
                  placeholder="Nº"
                  value={formData.numero}
                  onChangeText={(value) => setFormData({ ...formData, numero: value })}
                  keyboardType="numeric"
                  editable={editing}
                />
              </View>
              <View style={styles.inputLarge}>
                <Input
                  label="Complemento"
                  placeholder="Apto, Bloco..."
                  value={formData.complemento}
                  onChangeText={(value) => setFormData({ ...formData, complemento: value })}
                  editable={editing}
                />
              </View>
            </View>

            <Input
              label="Bairro"
              placeholder="Bairro"
              value={formData.bairro}
              onChangeText={(value) => setFormData({ ...formData, bairro: value })}
              editable={editing}
            />

            <View style={styles.row}>
              <View style={styles.inputLarge}>
                <Input
                  label="Cidade"
                  placeholder="Cidade"
                  value={formData.cidade}
                  onChangeText={(value) => setFormData({ ...formData, cidade: value })}
                  editable={editing}
                />
              </View>
              <View style={styles.inputSmall}>
                <Input
                  label="UF"
                  placeholder="UF"
                  value={formData.uf}
                  onChangeText={(value) => setFormData({ ...formData, uf: value })}
                  autoCapitalize="characters"
                  maxLength={2}
                  editable={editing}
                />
              </View>
            </View>
          </Card>
        </View>

        {editing && (
          <View style={styles.buttonContainer}>
            <Button
              title="Salvar Alterações"
              variant="primary"
              onPress={handleSave}
              fullWidth
            />
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={() => {
                setEditing(false);
                // Recarregar dados originais
                const dataNascimentoFormatted = user?.data_nascimento
                  ? user.data_nascimento.split('-').reverse().join('/')
                  : '';

                setFormData({
                  name: user?.name || '',
                  email: user?.email || '',
                  telefone: user?.telefone || '',
                  data_nascimento: dataNascimentoFormatted,
                  cep: formData.cep,
                  endereco: formData.endereco,
                  numero: formData.numero,
                  bairro: formData.bairro,
                  cidade: formData.cidade,
                  uf: formData.uf,
                  complemento: formData.complemento,
                });
              }}
              fullWidth
              style={{ marginTop: 12 }}
            />
          </View>
        )}

        {/* Danger Zone */}
        {!editing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Zona de Perigo</Text>
            <Card style={styles.card}>
              <TouchableOpacity
                style={styles.deleteAccountButton}
                onPress={handleDeleteAccount}
              >
                <IconSymbol name="trash.fill" size={20} color="#DC3545" />
                <View style={styles.deleteAccountContent}>
                  <Text style={styles.deleteAccountTitle}>Excluir Conta</Text>
                  <Text style={styles.deleteAccountText}>
                    Remover permanentemente sua conta e todos os dados
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color="#DC3545" />
              </TouchableOpacity>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Photo Options Modal */}
      <Modal
        visible={showPhotoOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhotoOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPhotoOptions(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Foto de Perfil</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleTakePhoto}
              disabled={uploading}
            >
              <IconSymbol name="camera.fill" size={24} color={AppColors.primary} />
              <Text style={styles.modalOptionText}>Tirar Foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handlePickFromGallery}
              disabled={uploading}
            >
              <IconSymbol name="photo.fill" size={24} color={AppColors.primary} />
              <Text style={styles.modalOptionText}>Escolher da Galeria</Text>
            </TouchableOpacity>

            {user?.picture && (
              <TouchableOpacity
                style={[styles.modalOption, styles.modalOptionDanger]}
                onPress={handleRemovePhoto}
                disabled={uploading}
              >
                <IconSymbol name="trash.fill" size={24} color="#DC3545" />
                <Text style={[styles.modalOptionText, styles.modalOptionTextDanger]}>
                  Remover Foto
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowPhotoOptions(false)}
              disabled={uploading}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Loading Overlay durante upload */}
      {uploading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AppColors.primary} />
            <Text style={styles.loadingText}>Enviando foto...</Text>
          </View>
        </View>
      )}

      {/* Alert Modal */}
      <AlertComponent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background.secondary,
    width: '100%',
    ...Platform.select({
      web: {
          maxWidth: 720,
          marginHorizontal: 'auto',
      },
  }),
  },
  header: {
    backgroundColor: AppColors.primary,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scrollView: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: AppColors.white,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: AppColors.primary,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: AppColors.primary,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: AppColors.white,
  },
  userName: {
    fontSize: 24,
    fontFamily: Fonts.medium,
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  userPlan: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: AppColors.text.secondary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: Fonts.semiBold,
    color: AppColors.text.secondary,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editButtonText: {
    fontFamily: Fonts.medium,
    color: AppColors.primary,
    fontSize: 14,
  },
  card: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputSmall: {
    flex: 1,
  },
  inputLarge: {
    flex: 2,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
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
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Fonts.semiBold,
    color: AppColors.text.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: AppColors.background.secondary,
    marginBottom: 12,
  },
  modalOptionDanger: {
    backgroundColor: '#FEE',
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: AppColors.text.primary,
    marginLeft: 16,
  },
  modalOptionTextDanger: {
    color: '#DC3545',
  },
  modalCancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: AppColors.text.secondary,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingContainer: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    minWidth: 150,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: AppColors.text.primary,
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  deleteAccountContent: {
    flex: 1,
  },
  deleteAccountTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: '#DC3545',
    marginBottom: 4,
  },
  deleteAccountText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
  },
});
