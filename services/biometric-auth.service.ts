/**
 * Serviço de Autenticação Biométrica
 * Gerencia armazenamento seguro de credenciais e autenticação biométrica
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

const STORAGE_KEYS = {
  BIOMETRIC_ENABLED: '@biometric_enabled',
  LAST_USER_EMAIL: '@last_user_email',
  LAST_USER_NAME: '@last_user_name',
  REMEMBER_ME: '@remember_me',
};

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

export interface LastUserInfo {
  email: string;
  name?: string;
}

export const BiometricAuthService = {
  /**
   * Verifica se o dispositivo suporta biometria
   */
  async isAvailable(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return compatible && enrolled;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade de biometria:', error);
      return false;
    }
  },

  /**
   * Retorna o tipo de biometria suportada
   */
  async getBiometricType(): Promise<string> {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'Face ID';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'Impressão Digital';
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        return 'Reconhecimento de Íris';
      }

      return 'Biometria';
    } catch (error) {
      console.error('Erro ao obter tipo de biometria:', error);
      return 'Biometria';
    }
  },

  /**
   * Verifica se a biometria está habilitada
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
      return enabled === 'true';
    } catch (error) {
      console.error('Erro ao verificar se biometria está habilitada:', error);
      return false;
    }
  },

  /**
   * Habilita/desabilita a biometria
   */
  async setBiometricEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, enabled.toString());
    } catch (error) {
      console.error('Erro ao salvar preferência de biometria:', error);
      throw error;
    }
  },

  /**
   * Autentica usando biometria
   */
  async authenticate(promptMessage?: string): Promise<BiometricAuthResult> {
    try {
      const available = await this.isAvailable();

      if (!available) {
        return {
          success: false,
          error: 'Biometria não disponível neste dispositivo',
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || 'Autentique-se para continuar',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
        fallbackLabel: 'Usar senha',
      });

      if (result.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || 'Autenticação falhou',
        };
      }
    } catch (error: any) {
      console.error('Erro na autenticação biométrica:', error);
      return {
        success: false,
        error: error.message || 'Erro ao autenticar',
      };
    }
  },

  /**
   * Salva informações do último usuário logado
   */
  async saveLastUser(email: string, name?: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.LAST_USER_EMAIL, email],
        [STORAGE_KEYS.LAST_USER_NAME, name || ''],
      ]);
    } catch (error) {
      console.error('Erro ao salvar último usuário:', error);
      throw error;
    }
  },

  /**
   * Obtém informações do último usuário logado
   */
  async getLastUser(): Promise<LastUserInfo | null> {
    try {
      const values = await AsyncStorage.multiGet([
        STORAGE_KEYS.LAST_USER_EMAIL,
        STORAGE_KEYS.LAST_USER_NAME,
      ]);

      const email = values[0][1];
      const name = values[1][1];

      if (!email) {
        return null;
      }

      return {
        email,
        name: name || undefined,
      };
    } catch (error) {
      console.error('Erro ao obter último usuário:', error);
      return null;
    }
  },

  /**
   * Remove informações do último usuário
   */
  async clearLastUser(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.LAST_USER_EMAIL,
        STORAGE_KEYS.LAST_USER_NAME,
      ]);
    } catch (error) {
      console.error('Erro ao limpar último usuário:', error);
      throw error;
    }
  },

  /**
   * Salva preferência "Lembrar-me"
   */
  async setRememberMe(remember: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, remember.toString());
    } catch (error) {
      console.error('Erro ao salvar preferência lembrar-me:', error);
      throw error;
    }
  },

  /**
   * Obtém preferência "Lembrar-me"
   */
  async getRememberMe(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
      return value === 'true';
    } catch (error) {
      console.error('Erro ao obter preferência lembrar-me:', error);
      return false;
    }
  },

  /**
   * Verifica se deve sugerir login com biometria
   */
  async shouldSuggestBiometric(): Promise<boolean> {
    try {
      const available = await this.isAvailable();
      const enabled = await this.isBiometricEnabled();
      const lastUser = await this.getLastUser();
      const rememberMe = await this.getRememberMe();

      return available && enabled && lastUser !== null && rememberMe;
    } catch (error) {
      console.error('Erro ao verificar sugestão de biometria:', error);
      return false;
    }
  },

  /**
   * Limpa todos os dados de autenticação
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.BIOMETRIC_ENABLED,
        STORAGE_KEYS.LAST_USER_EMAIL,
        STORAGE_KEYS.LAST_USER_NAME,
        STORAGE_KEYS.REMEMBER_ME,
      ]);
    } catch (error) {
      console.error('Erro ao limpar dados de autenticação:', error);
      throw error;
    }
  },
};
