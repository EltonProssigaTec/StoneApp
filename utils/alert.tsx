/**
 * Utilitário de Alert Multiplataforma
 * Funciona em web e mobile
 */

import { Alert as RNAlert, Platform } from 'react-native';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export const Alert = {
  alert: (title: string, message?: string, buttons?: AlertButton[]) => {
    if (Platform.OS === 'web') {
      // No web, usar confirm/alert nativo do browser
      if (buttons && buttons.length > 1) {
        const confirmed = window.confirm(`${title}\n\n${message || ''}`);
        if (confirmed && buttons[1]?.onPress) {
          buttons[1].onPress();
        } else if (!confirmed && buttons[0]?.onPress) {
          buttons[0].onPress();
        }
      } else {
        window.alert(`${title}\n\n${message || ''}`);
        if (buttons && buttons[0]?.onPress) {
          buttons[0].onPress();
        }
      }
    } else {
      // No mobile, usar Alert nativo
      RNAlert.alert(title, message, buttons);
    }
  },
};
