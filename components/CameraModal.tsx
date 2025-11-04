import { AppColors, Fonts } from '@/constants/theme';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from './ui/icon-symbol';

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onPhotoTaken: (uri: string) => Promise<void>;
}

export function CameraModal({ visible, onClose, onPhotoTaken }: CameraModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState<CameraType>('front');
  const cameraRef = useRef<CameraView>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  React.useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission();
    }
  }, [visible]);

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        skipProcessing: Platform.OS === 'android', // Melhor performance no Android
      });

      if (photo?.uri) {
        // Aguardar o upload completar antes de fechar o modal
        // Isso evita que o arquivo seja deletado do cache antes do upload
        await onPhotoTaken(photo.uri);
        onClose();
      }
    } catch (error) {
      if (__DEV__) console.error('[CameraModal] Erro ao tirar foto:', error);
      setIsCapturing(false);
    }
    // Não desabilitar isCapturing aqui - só desabilita se houver erro
    // O modal será fechado após o upload, então não precisa desabilitar
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Precisamos de permissão para acessar a câmera
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Permitir Câmera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing} // Sempre câmera frontal (como apps de banco)
        >
          {/* Overlay com instruções */}
          <View style={styles.overlay}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <IconSymbol name="xmark" size={28} color={AppColors.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.instructionsContainer}>
              <Text style={styles.instructions}>Posicione seu rosto no centro</Text>
            </View>

            {/* Guia visual para selfie */}
            <View style={styles.faceGuide} />

            <View style={styles.controls}>
              {isCapturing && (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator color={AppColors.white} size="small" />
                  <Text style={styles.uploadingText}>Enviando foto...</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
                onPress={takePicture}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <ActivityIndicator color={AppColors.primary} size="large" />
                ) : (
                  <View style={styles.captureButtonInner} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.black,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionsContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  instructions: {
    color: AppColors.white,
    fontSize: 16,
    fontFamily: Fonts.medium,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  faceGuide: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    marginLeft: -125,
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 3,
    borderColor: AppColors.white,
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 16,
    gap: 10,
  },
  uploadingText: {
    color: AppColors.white,
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: AppColors.white,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  permissionText: {
    color: AppColors.white,
    fontSize: 18,
    fontFamily: Fonts.medium,
    textAlign: 'center',
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: AppColors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  cancelButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontFamily: Fonts.medium,
    opacity: 0.7,
  },
});
