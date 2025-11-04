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
import api from '@/services/api.config';

export interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  cpf_cnpj?: string;
  telefone?: string; // Campo da API
  picture?: string;
  plano?: string;
  data_nascimento?: string; // Campo da API (formato: YYYY-MM-DD)
  // Campos de comprovantes (usados no cadastro e edição de perfil)
  comprovante_rg_frente?: string;
  comprovante_rg_verso?: string;
  comprovante_cnh?: string;
  comprovante_endereco?: string;
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
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Preferências de notificação
  const [notificar, setNotificar] = useState(false);
  const [notificar_sms, setNotificarSMS] = useState(false);
  const [notificar_email, setNotificarEmail] = useState(false);

  /**
   * Login do usuário
   */
  const signIn = async (email: string, password: string, keepLoggedIn: boolean = false): Promise<boolean> => {
    try {
      if (__DEV__) console.log('[Auth] Iniciando login...');

      // Remove token antigo antes de fazer login
      delete api.defaults.headers.common['Authorization'];

      // Fazer requisição de login
      const response = await api.post('/login_monitora', {
        email: email.trim().toLowerCase(),
        password
      });

      // Verificar se o status não é 2xx (sucesso)
      if (response.status < 200 || response.status >= 300) {
        throw new Error('Status de resposta inválido');
      }

      // Verifica diferentes estruturas de resposta possíveis
      let user = null;
      let token = null;

      // Tentar extrair dados em diferentes estruturas
      const data = response.data;

      if (data?.dados?.user && data?.dados?.access_token) {
        user = data.dados.user;
        token = data.dados.access_token;
      } else if (data?.user && data?.access_token) {
        user = data.user;
        token = data.access_token;
      } else if (data?.data?.user && data?.data?.access_token) {
        user = data.data.user;
        token = data.data.access_token;
      }

      if (!user || !token) {
        if (__DEV__) {
          console.error('[Auth] Estrutura de resposta inválida');
          console.error('[Auth] Resposta:', JSON.stringify(data, null, 2));
        }
        throw new Error('Resposta da API inválida');
      }

      // Configura token no header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Salva no AsyncStorage com tratamento de erro individual
      try {
        await AsyncStorage.multiSet([
          ['@Auth:user', JSON.stringify(user)],
          ['@Auth:token', token],
          ['@Auth:keepLoggedIn', keepLoggedIn ? 'true' : 'false'],
        ]);
      } catch (storageError) {
        if (__DEV__) console.error('[Auth] Erro ao salvar no storage:', storageError);
        // Continua mesmo com erro no storage
      }

      setUser(user);
      if (__DEV__) console.log('[Auth] Login concluído com sucesso!');
      return true;

    } catch (err: any) {
      if (__DEV__) {
        console.error('[Auth] Erro no login:', err.message);
        console.error('[Auth] Detalhes:', {
          code: err.code,
          status: err.response?.status,
        });
      }

      // Não mostrar Alert aqui - deixar para o componente que chamou
      return false;
    }
  };

  /**
   * Logout do usuário
   */
  const signOut = async (): Promise<void> => {
    try {
      if (__DEV__) console.log('[Auth] Fazendo logout...');
      setLoading(true);

      // Limpar token do header da API
      delete api.defaults.headers.common['Authorization'];

      // Limpar dados do AsyncStorage
      try {
        await AsyncStorage.multiRemove(['@Auth:user', '@Auth:token', '@Auth:keepLoggedIn']);
      } catch (storageError) {
        if (__DEV__) console.error('[Auth] Erro ao limpar storage:', storageError);
      }

      // Limpar estado do usuário
      setUser(null);
      if (__DEV__) console.log('[Auth] Logout concluído');
    } catch (error) {
      if (__DEV__) console.error('[Auth] Erro no logout:', error);
    } finally {
      setLoading(false);
    }
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
    // Evita verificações duplicadas
    if (hasCheckedAuth) {
      if (__DEV__) console.log('[Auth] Verificação já realizada, pulando...');
      return;
    }

    try {
      if (__DEV__) console.log('[Auth] Verificando sessão...');
      setHasCheckedAuth(true);

      const [storedUser, storedToken, storedKeepLoggedIn] = await AsyncStorage.multiGet([
        '@Auth:user',
        '@Auth:token',
        '@Auth:keepLoggedIn',
      ]);

      const keepLoggedIn = storedKeepLoggedIn[1] === 'true';

      if (storedUser[1] && storedToken[1] && keepLoggedIn) {
        try {
          const parsedUser = JSON.parse(storedUser[1]);
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken[1]}`;
          setUser(parsedUser);
          if (__DEV__) console.log('[Auth] Sessão restaurada');
        } catch (parseError) {
          if (__DEV__) console.error('[Auth] Erro ao parsear usuário:', parseError);
          // Limpa apenas as chaves de auth se houver erro
          await AsyncStorage.multiRemove(['@Auth:user', '@Auth:token', '@Auth:keepLoggedIn']);
        }
      } else {
        if (__DEV__) console.log('[Auth] Nenhuma sessão ativa');
      }
    } catch (error) {
      if (__DEV__) console.error('[Auth] Erro ao verificar sessão:', error);
      // Não fazer nada em caso de erro - apenas log em dev
    } finally {
      setLoading(false);
    }
  }, [hasCheckedAuth]);

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