import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Input } from '@/components/ui/Input';
import { AppColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PerfilScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await updateUser({ picture: result.assets[0].uri });
      Alert.alert('Sucesso', 'Foto de perfil atualizada!');
    }
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar
        backgroundColor={AppColors.primary} // cor do header no Android
        barStyle="light-content" // texto branco
        translucent={false}
      />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={AppColors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)}>
          <IconSymbol
            name={editing ? "xmark" : "pencil"}
            size={24}
            color={AppColors.white}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleImagePick} style={styles.avatarContainer}>
            {user?.picture ? (
              <Image
                source={{ uri: user.picture }}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.white,
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
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  userPlan: {
    fontSize: 14,
    color: AppColors.text.secondary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
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
    padding: 16,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});
