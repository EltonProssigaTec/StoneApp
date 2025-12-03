import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { AppColors, Fonts } from '@/constants/theme';
import { IconSymbol } from './icon-symbol';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertModalProps {
  visible: boolean;
  type?: AlertType;
  title: string;
  message: string;
  buttons?: AlertButton[];
  onClose?: () => void;
}

const getIconConfig = (type: AlertType) => {
  switch (type) {
    case 'success':
      return { name: 'checkmark.circle.fill', color: AppColors.status.success };
    case 'error':
      return { name: 'xmark.circle.fill', color: AppColors.status.error };
    case 'warning':
      return { name: 'exclamationmark.triangle.fill', color: '#FFC107' };
    case 'info':
    default:
      return { name: 'info.circle.fill', color: AppColors.primary };
  }
};

const getButtonStyle = (style?: string) => {
  switch (style) {
    case 'cancel':
      return { color: AppColors.text.secondary, fontFamily: Fonts.regular };
    case 'destructive':
      return { color: '#DC3545', fontFamily: Fonts.semiBold };
    default:
      return { color: AppColors.primary, fontFamily: Fonts.semiBold };
  }
};

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  type = 'info',
  title,
  message,
  buttons = [{ text: 'OK', style: 'default' }],
  onClose,
}) => {
  const iconConfig = getIconConfig(type);

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.modalContent}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Ícone */}
          <View style={styles.iconContainer}>
            <IconSymbol name={iconConfig.name as any} size={56} color={iconConfig.color} />
          </View>

          {/* Título */}
          <Text style={styles.title}>{title}</Text>

          {/* Mensagem */}
          <Text style={styles.message}>{message}</Text>

          {/* Botões */}
          <View style={styles.buttonsContainer}>
            {buttons.map((button, index) => {
              const buttonStyleConfig = getButtonStyle(button.style);
              const isLastButton = index === buttons.length - 1;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    !isLastButton && styles.buttonBorder,
                  ]}
                  onPress={() => handleButtonPress(button)}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      { color: buttonStyleConfig.color, fontFamily: buttonStyleConfig.fontFamily },
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: AppColors.white,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconContainer: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.semiBold,
    color: AppColors.text.primary,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: AppColors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
    lineHeight: 22,
  },
  buttonsContainer: {
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonBorder: {
    borderRightWidth: 1,
    borderRightColor: AppColors.border,
  },
  buttonText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

// Hook para facilitar o uso
export const useAlert = () => {
  const [alertConfig, setAlertConfig] = React.useState<{
    visible: boolean;
    type: AlertType;
    title: string;
    message: string;
    buttons: AlertButton[];
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    buttons: [],
  });

  const showAlert = (
    title: string,
    message: string,
    buttons?: AlertButton[],
    type: AlertType = 'info'
  ) => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message,
      buttons: buttons || [{ text: 'OK', style: 'default' }],
    });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const AlertComponent = () => (
    <AlertModal
      visible={alertConfig.visible}
      type={alertConfig.type}
      title={alertConfig.title}
      message={alertConfig.message}
      buttons={alertConfig.buttons}
      onClose={hideAlert}
    />
  );

  return {
    showAlert,
    hideAlert,
    AlertComponent,
  };
};
