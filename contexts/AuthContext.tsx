/**
 * Context de Autenticação
 * Baseado em: monitora_mobile/src/contexts/auth.js
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import api from '@/services/api.config';

export interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  cpf_cnpj?: string;
  phone?: string;
  picture?: string;
  plano?: string;
  // Adicione outros campos conforme necessário
}

interface AuthContextData {
  isLogged: boolean;
  loading: boolean;
  user: User | null;
  signIn: (email: string, password: string, keepLoggedIn?: boolean) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateUser: (newData: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
  // Preferências de notificação
  notificar: boolean;
  setNotificar: (value: boolean) => void;
  notificar_sms: boolean;
  setNotificarSMS: (value: boolean) => void;
  notificar_email: boolean;
  setNotificarEmail: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Preferências de notificação
  const [notificar, setNotificar] = useState(false);
  const [notificar_sms, setNotificarSMS] = useState(false);
  const [notificar_email, setNotificarEmail] = useState(false);

  /**
   * Login do usuário
   */
  const signIn = async (email: string, password: string, keepLoggedIn: boolean = false): Promise<boolean> => {
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`[Auth] Tentativa ${attempts} de login...`);

        // IMPORTANTE: Remover token antigo antes de fazer login
        // Isso evita que o backend tente validar um token expirado/inválido
        delete api.defaults.headers.common['Authorization'];

        // Fazer requisição de login
        const response = await api.post('/login_monitora', {
          email: email.trim().toLowerCase(),
          password
        });

        console.log('[Auth] Status da resposta:', response.status);

        // Verificar se o status não é 2xx (sucesso)
        if (response.status < 200 || response.status >= 300) {
          console.error('[Auth] Status de erro:', response.status);
          if (attempts < maxAttempts) {
            console.log('[Auth] Tentando novamente...');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar 1s antes de tentar novamente
            continue;
          }
          throw new Error('Status de resposta inválido');
        }

        // Verifica diferentes estruturas de resposta possíveis
        let user = null;
        let token = null;

        // Tentar extrair dados em diferentes estruturas
        const data = response.data;

        if (data?.dados?.user && data?.dados?.access_token) {
          // Estrutura: { dados: { user, access_token } }
          user = data.dados.user;
          token = data.dados.access_token;
        } else if (data?.user && data?.access_token) {
          // Estrutura: { user, access_token }
          user = data.user;
          token = data.access_token;
        } else if (data?.data?.user && data?.data?.access_token) {
          // Estrutura: { data: { user, access_token } }
          user = data.data.user;
          token = data.data.access_token;
        }

        if (!user || !token) {
          console.error('[Auth] Estrutura de resposta inválida');
          console.error('[Auth] Resposta recebida:', JSON.stringify(data, null, 2));

          if (attempts < maxAttempts) {
            console.log('[Auth] Tentando novamente...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }

          throw new Error('Resposta da API inválida');
        }

        console.log('[Auth] Token recebido com sucesso');
        console.log('[Auth] Usuário:', user.name || user.email);

        // Configura token no header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Salva no AsyncStorage
        const storageItems: [string, string][] = [
          ['@Auth:user', JSON.stringify(user)],
          ['@Auth:token', token],
          ['@Auth:keepLoggedIn', keepLoggedIn ? 'true' : 'false'],
        ];

        await AsyncStorage.multiSet(storageItems);

        setUser(user);
        console.log('[Auth] Login concluído com sucesso!');
        return true;

      } catch (err: any) {
        console.error(`[Auth] Erro na tentativa ${attempts}:`, err.message);

        // Se ainda há tentativas, continuar
        if (attempts < maxAttempts) {
          console.log('[Auth] Tentando novamente...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        // Última tentativa falhou - mostrar erro ao usuário
        console.error('[Auth] Todas as tentativas falharam');
        console.error('[Auth] Detalhes do erro:', {
          code: err.code,
          status: err.response?.status,
          data: err.response?.data,
        });

        // Usar mensagem personalizada do interceptor se disponível
        let message = err?.userMessage;

        if (!message) {
          // Verificar tipo de erro
          if (err.code === 'ERR_NETWORK' || !err.response) {
            message = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
          } else if (err.code === 'ECONNABORTED') {
            message = 'Tempo de espera esgotado. Tente novamente.';
          } else if (err.response?.status === 401) {
            message = 'Email ou senha incorretos.';
          } else if (err.response?.status >= 500) {
            message = 'Erro no servidor. Tente novamente mais tarde.';
          } else {
            message = err?.response?.data?.message ?? 'Falha ao fazer login. Tente novamente.';
          }
        }

        Alert.alert('Erro no Login', message);
        return false;
      }
    }

    return false;
  };

  /**
   * Logout do usuário
   */
  const signOut = async (): Promise<void> => {
    console.log('[Auth] Fazendo logout...');
    setLoading(true);

    // Limpar token do header da API
    delete api.defaults.headers.common['Authorization'];

    // Desabilitar login automático ao fazer logout manual
    await AsyncStorage.multiSet([
      ['@Auth:keepLoggedIn', 'false'],
      ['@Auth:token', ''],
      ['@Auth:user', ''],
    ]);

    // Limpar estado do usuário
    setUser(null);
    setLoading(false);
    console.log('[Auth] Logout concluído');
  };

  /**
   * Atualiza dados do usuário
   */
  const updateUser = async (newData: Partial<User>): Promise<void> => {
    setUser((prev) => {
      const merged = prev ? { ...prev, ...newData } : ({ ...newData } as User);
      AsyncStorage.setItem('@Auth:user', JSON.stringify(merged));
      return merged;
    });
  };

  /**
   * Verifica se há sessão ativa
   */
  const verifyIsLogged = useCallback(async () => {
    try {
      const [storedUser, storedToken, storedKeepLoggedIn] = await AsyncStorage.multiGet([
        '@Auth:user',
        '@Auth:token',
        '@Auth:keepLoggedIn',
      ]);

      const keepLoggedIn = storedKeepLoggedIn[1] === 'true';

      if (storedUser[1] && storedToken[1] && keepLoggedIn) {
        // Restaurar sessão automaticamente apenas se o usuário escolheu manter logado
        console.log('[Auth] Restaurando sessão (manter logado ativado)');
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken[1]}`;
        setUser(JSON.parse(storedUser[1]));
      } else {
        console.log('[Auth] Não há sessão para restaurar ou manter logado está desativado');
      }
    } catch (error) {
      console.error('[Auth] Erro ao verificar sessão:', error);
      // Limpar dados corrompidos
      await AsyncStorage.clear();
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    verifyIsLogged();
  }, [verifyIsLogged]);

  const value = useMemo(
    () => ({
      isLogged: !!user,
      loading,
      user,
      signIn,
      signOut,
      updateUser,
      setUser,
      // Preferências
      notificar,
      setNotificar,
      notificar_sms,
      setNotificarSMS,
      notificar_email,
      setNotificarEmail,
    }),
    [user, loading, notificar, notificar_sms, notificar_email]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};