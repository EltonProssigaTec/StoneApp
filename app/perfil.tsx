import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Input } from '@/components/ui/Input';
import { AppColors, Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import api, { settings } from '@/services/api.config';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PerfilScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    cep: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: '',
    complemento: '',
  });
  const [loadingAddress, setLoadingAddress] = useState(false);

  // Carregar endereço do usuário
  useEffect(() => {
    const loadUserAddress = async () => {
      if (!user?.id) return;

      try {
        const response = await api.post('/monitora/endereco_usuario', { id: user.id });
        if (response.status === 200 && response.data?.data?.length > 0) {
          const addressData = response.data.data[0];
          setFormData((prev) => ({
            ...prev,
            cep: addressData.cep || '',
            endereco: addressData.endereco || '',
            numero: addressData.numero || '',
            bairro: addressData.bairro || '',
            cidade: addressData.municipio || '',
            uf: addressData.uf || '',
            complemento: addressData.complemento || '',
          }));
        }
      } catch (error) {
        if (__DEV__) console.error('[Perfil] Erro ao carregar endereço:', error);
      }
    };

    loadUserAddress();
  }, [user?.id]);

  // Buscar endereço por CEP
  const handleCEPSearch = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    setFormData((prev) => ({ ...prev, cep }));

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
        Alert.alert('Erro', 'Dados do usuário não encontrados');
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
        Alert.alert('Erro', 'Erro ao enviar foto');
        return null;
      }
    } catch (error: any) {
      if (__DEV__) console.error('[Perfil] Erro no upload:', error);
      Alert.alert('Erro', 'Falha ao enviar foto. Verifique sua conexão.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoOptions = () => {
    setShowPhotoOptions(true);
  };

  const handleTakePhoto = async () => {
    setShowPhotoOptions(false);

    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permissão Necessária', 'Precisamos de permissão para acessar a câmera.');
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
        // Atualizar o usuário com o nome do arquivo
        await updateUser({ picture: filename });
        Alert.alert('Sucesso', 'Foto de perfil atualizada!');
      }
    }
  };

  const handlePickFromGallery = async () => {
    setShowPhotoOptions(false);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permissão Necessária', 'Precisamos de permissão para acessar suas fotos.');
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
        // Atualizar o usuário com o nome do arquivo
        await updateUser({ picture: filename });
        Alert.alert('Sucesso', 'Foto de perfil atualizada!');
      }
    }
  };

  const handleRemovePhoto = () => {
    setShowPhotoOptions(false);

    Alert.alert(
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
            await updateUser({ picture: '' });
            Alert.alert('Sucesso', 'Foto de perfil removida!');
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    try {
      await updateUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });
      setEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    }
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
            {user?.picture ? (
              <Image
                source={{
                  uri: user.picture.startsWith('http') || user.picture.startsWith('file')
                    ? user.picture
                    : settings.FILES_URL + user.picture
                }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <IconSymbol name="person.fill" size={48} color={AppColors.white} />
              </View>
            )}
            <View style={styles.cameraButton}>
              <IconSymbol name="camera.fill" size={16} color={AppColors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
          <Text style={styles.userPlan}>{user?.plano || 'Plano Gratuito'}</Text>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>

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
              editable={editing}
            />

            <Input
              label="CPF"
              placeholder="CPF"
              icon="creditcard.fill"
              value={user?.cpf_cnpj || user?.cpf || ''}
              editable={false}
            />

            <Input
              label="Telefone"
              placeholder="Digite seu telefone"
              icon="phone.fill"
              value={formData.phone}
              onChangeText={(value) => setFormData({ ...formData, phone: value })}
              keyboardType="phone-pad"
              editable={editing}
            />
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
  sectionTitle: {
    fontFamily: Fonts.semiBold,
    color: AppColors.text.secondary,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  card: {
    padding: 16,
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
});
